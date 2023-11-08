#!/bin/bash
set -x
export CVAH_VERSION=3.8.0
bootstrap_version=1.5.0
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
RHEL_VERSION="8.2"
RHEL_ISO="rhel-$RHEL_VERSION-x86_64-dvd.iso"
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin"

# Create tfplenum log dir
mkdir -p /var/log/tfplenum
mkdir -p /etc/tfplenum

pushd "/opt" > /dev/null

if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

REPOS=("tfplenum")

function run_cmd {
    local command="$@"
    eval $command
    local ret_val=$?
    if [ $ret_val -ne 0 ]; then
        echo "$command returned error code $ret_val"
        exit 1
    fi
}

function prompt_runtype() {
    echo "Select a run type:"
    echo "Full: Fresh Builds, Home Builds, A full run will remove tfplenum directories in /opt, reclone tfplenum git repos and runs bootstrap ansible role."
    echo "Bootstrap: Only runs bootstrap ansible role."
    echo "Docker Images: Repull docker images to controller and upload to controllers docker registry."
    if [ -z "$RUN_TYPE" ]; then
        select cr in "Full" "Bootstrap" "Docker Images"; do
            case $cr in
                Full ) export RUN_TYPE=full; break;;
                Bootstrap ) export RUN_TYPE=bootstrap; break;;
                "Docker Images" ) export RUN_TYPE=dockerimages; break;;
            esac
        done
    fi
}

function setup_ansible(){
    local tfplenum_root_dir="/opt/tfplenum"
    pushd $tfplenum_root_dir > /dev/null
    run_cmd dnf install -y python36-3.6.8-2.module+el8.1.0+3334+5cb623d7 python36-devel-3.6.8-2.module+el8.1.0+3334+5cb623d7 krb5-devel-1.17-18.el8 krb5-workstation-1.17-18.el8 gcc-8.3.1-5.el8 policycoreutils-python-utils-2.9-9.el8 gobject-introspection-devel cairo-gobject-devel python3-gpg
    run_cmd pip3 install virtualenv cryptography==2.9.2
    run_cmd virtualenv --python=python3 --system-site-packages .venv
    run_cmd $tfplenum_root_dir/.venv/bin/python3 -m pip install -U pip==20.2.4
    run_cmd $tfplenum_root_dir/.venv/bin/pip3 install -r $tfplenum_root_dir/requirements.txt
    rm -f /usr/bin/ansible*
    rm -f /usr/bin/dir2pi
    rm -rf /usr/local/bin/gunicorn
    rm -rf /usr/local/bin/rqworker
    rm -rf /usr/local/bin/rqscheduler
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/ansible-playbook /usr/bin/ansible-playbook
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/ansible-console /usr/bin/ansible-console
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/ansible-config /usr/bin/ansible-config
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/ansible-galaxy /usr/bin/ansible-galaxy
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/ansible-doc /usr/bin/ansible-doc
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/ansible-inventory /usr/bin/ansible-inventory
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/ansible-pull /usr/bin/ansible-pull
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/ansible /usr/bin/ansible
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/dir2pi /usr/bin/dir2pi
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/gunicorn /usr/local/bin/gunicorn
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/rqworker /usr/local/bin/rqworker
    run_cmd ln -s $tfplenum_root_dir/.venv/bin/rqscheduler /usr/local/bin/rqscheduler
    popd > /dev/null
}

function add_nexus_laprepo() {
    mkdir -p /root/.pip
    cat <<EOF > /root/.pip/pip.conf
[global]
index-url = https://nexus.sil.lab/repository/pypi/simple
trusted-host = nexus.sil.lab
EOF
}

function generate_repo_file() {
    rm -rf /etc/yum.repos.d/*.repo > /dev/null
    curl -o /etc/yum.repos.d/nexus-rhel8.repo https://nexus.sil.lab/repository/tfplenum-repo/nexus-rhel8.repo
    cat <<EOF > /etc/yum.repos.d/nexus-yum-proxy.repo
[nexus-yum-proxy]
name=nexus-yum-proxy
baseurl=https://nexus.sil.lab/repository/yum-proxy/
enabled=1
gpgcheck=0
repo_gpgcheck=0
EOF
    dnf clean all > /dev/null
    rm -rf /var/cache/yum/ > /dev/null
    dnf makecache
}

function get_controller_ip() {
    if [ -z "$TFPLENUM_SERVER_IP" ]; then
        controller_ips=`ip -o addr | awk '!/^[0-9]*: ?lo|inet6|docker|link\/ether/ {gsub("/", " "); print $4}'`
        choices=( $controller_ips )
        echo "-------"
        echo "Select the controllers ip address:"
        select cr in "${choices[@]}"; do
            case $cr in
                $cr ) export TFPLENUM_SERVER_IP=$cr; break;;
            esac
        done
    fi
}

function prompt_git_creds() {
    export REMOTE_GIT_NAME="GITLAB"
    if [ -z "$GIT_USERNAME" ]; then
        echo "-------"
        echo "Bootstrapping a controller requires ${REMOTE_GIT_NAME} credentials."
        while true; do
            read -p "${REMOTE_GIT_NAME} Username: "  GIT_USERNAME
            if [ "$GIT_USERNAME" == "" ]; then
                echo "The username cannot be empty.  Please try again."
            elif [ "$GIT_USERNAME" != "" ]; then
                export GIT_USERNAME=$GIT_USERNAME
                break
            fi
        done
    fi

    if [ -z "$PASSWORD" ]; then
        while true; do
            read -s -p "${REMOTE_GIT_NAME} Password: " PASSWORD
            echo
            if [ "$PASSWORD" == "" ]; then
                echo "The passwords cannot be empty.  Please try again."
            else
                read -s -p "${REMOTE_GIT_NAME} Password (again): " PASSWORD2
            fi

            if [ "$PASSWORD" != "$PASSWORD2" ]; then
                echo "The passwords do not match.  Please try again."
            elif [ "$PASSWORD" == "$PASSWORD2" ] && [ "$PASSWORD" != "" ]; then
                break
            fi
        done
        export GIT_PASSWORD=$PASSWORD
    fi
}

function set_git_variables() {

    if [ -z "$BRANCH_NAME" ]; then
        echo "WARNING: Any existing tfplenum directories in /opt will be removed."
        echo "Which branch do you want to checkout for all repos?"
        select cr in "Master" "Devel" "Custom"; do
            case $cr in
                Master ) export TFPLENUM_BRANCH_NAME=master; break;;
                Devel ) export TFPLENUM_BRANCH_NAME=devel; break;;
                Custom ) export BRANCH_NAME=custom; break;;
            esac
        done

        if [ "$BRANCH_NAME" == "custom" ]; then
            echo "Please type the name of the branch on the repo exactly. Make sure that you use the
            right branch name with each of your repos"

            read -p "tfplenum Branch Name: " TFPLENUM_BRANCH_NAME
            export TFPLENUM_BRANCH_NAME=$TFPLENUM_BRANCH_NAME

        fi
    fi
}

function clone_repos(){
    if [ -z "$REPO_URL" ]; then
        export REPO_URL="https://gitlab.sil.lab/tfplenum/tfplenum.git"
    fi
    local directory="/opt/tfplenum"
    if [ -d "$directory" ]; then
        rm -rf $directory
    fi
    if [[ ! -d "$directory" ]]; then
        run_cmd git clone $REPO_URL $directory
        pushd $directory > /dev/null
        run_cmd git checkout $TFPLENUM_BRANCH_NAME
        popd > /dev/null
    fi
}

function setup_git(){
  if ! rpm -q git > /dev/null 2>&1; then
    dnf install --allowerasing git -y > /dev/null 2>&1
  fi
git config --global --unset credential.helper
cat <<EOF > ~/credential-helper.sh
#!/bin/bash
echo username="\$GIT_USERNAME"
echo password="\$GIT_PASSWORD"
EOF
  git config --global credential.helper "/bin/bash ~/credential-helper.sh"
}

function execute_bootstrap_playbook(){
    echo "Running controller bootstrap"

    pushd "/opt/tfplenum/bootstrap/playbooks" > /dev/null
    run_cmd make bootstrap
    popd > /dev/null

    #  Add STIGS to Controller
    #pushd "/opt/tfplenum/rhel8-stigs" > /dev/null
    #run_cmd make controller-stigs
    #popd > /dev/null
}

function execute_pull_docker_images_playbook(){
    echo "Pulling docker images"
    pushd "/opt/tfplenum/bootstrap/playbooks" > /dev/null
    run_cmd make pull_docker_images
    popd > /dev/null
}

function prompts(){
    echo "---------------------------------"
    echo "TFPLENUM DEPLOYER BOOTSTRAP ${bootstrap_version}"
    echo "---------------------------------"

    prompt_runtype
    get_controller_ip

    if [ "$RUN_TYPE" == "bootstrap" ] || [ "$RUN_TYPE" == "full" ]; then
        generate_repo_file
    fi

    if [ "$RUN_TYPE" == "bootstrap" ] || [ "$RUN_TYPE" == "full" ]; then
        prompt_git_creds
        set_git_variables
    fi
}

export BUILD_DATE=`date +"%FT%T%z"`
cat <<EOF > /etc/tfplenum/tfplenum.ini
[tfplenum]
version = ${CVAH_VERSION}
build_date = ${BUILD_DATE}
EOF


export BOOTSTRAP=true
prompts

if [ "$RUN_TYPE" == "full" ]; then
    setup_git
    clone_repos
    git config --global --unset credential.helper
fi

if [ "$RUN_TYPE" == "bootstrap" ] || [ "$RUN_TYPE" == "full" ]; then
    add_nexus_laprepo
    setup_ansible
    execute_bootstrap_playbook
fi

if [ "$RUN_TYPE" == "dockerimages" ]; then
    execute_pull_docker_images_playbook
fi

popd > /dev/null
