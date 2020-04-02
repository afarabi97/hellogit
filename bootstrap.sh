#!/bin/bash
export DIP_VERSION=3.4.0
echo "${DIP_VERSION}" > /etc/dip-version
boostrap_version=1.3.0
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
PACKAGES="vim net-tools wget"
EPEL_RPM_PUBLIC_URL="https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm"
RHEL_VERSION="7.7"
RHEL_ISO="rhel-server-$RHEL_VERSION-x86_64-dvd.iso"
export TFPLENUM_LABREPO=false
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin"

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

function install_python36(){
	run_cmd yum install -y gcc
	run_cmd yum install -y python36 python36-devel
	mkdir -p /root/.pip/
}

function labrepo_available() {
    echo "-------"
    echo "Checking if labrepo is available..."
    labrepo_check=`curl -m 120 -s http://labrepo.sil.lab/check.html`
    if [ "$labrepo_check" != true ]; then
      echo "Warning: Labrepo not found. Defaulting to public repos."
      echo "Using public repos this might not always work as external dependencies change frequently."
      labrepo_check=false
    fi
}

function prompt_runtype() {
    echo "Select a run type:"
    echo "Full: Fresh Builds, Home Builds, A full run will remove tfplenum directories in /opt, reclone tfplenum git repos and runs boostrap ansible role."
    echo "Boostrap: Only runs boostrap ansible role."
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

function prompt_runtype_mip {
    echo "Select a run type:"
    echo "Full: Fresh Builds, Home Builds, A full run will remove tfplenum directories in /opt, reclone tfplenum git repos and runs boostrap ansible role."
    echo "Boostrap: Only runs boostrap ansible role."
    if [ -z "$RUN_TYPE" ]; then
        select cr in "Full" "Bootstrap"; do
            case $cr in
                Full ) export RUN_TYPE=full; break;;
                Bootstrap ) export RUN_TYPE=bootstrap; break;;
            esac
        done
    fi
}

function check_rhel_iso(){
    echo "Checking for RHEL ISO..."
    rhel_iso_exists=false
    if [ -f /root/$RHEL_ISO ]; then
        rhel_iso_exists=true
        echo "RHEL ISO found! Moving on..."
    fi
}

function prompt_rhel_iso_download() {
    check_rhel_iso
    if [ "$rhel_iso_exists" == false ]; then
        echo "-------"

        echo "RHEL ISO is required to setup the kit."
        echo "Download the RHEL ISO following these instructions:"
        echo "***If you already have the $RHEL_ISO skip to step 6.***"
        echo ""
        echo "1. In a browser navgiate to https://access.redhat.com/downloads"
        echo "2. Select Red Hat Enterprise Linux."
        echo "3. Login using your Red Hat user/pass."
        echo "4. Select $RHEL_VERSION from the Versions dropdown."
        echo "5. Select Download for Red Hat Enterprise Linux $RHEL_VERSION Binary DVD."
        echo "6. SCP $RHEL_ISO to /root on your controller."

        while true; do
        read -p "Have you completed the above steps? (Y/N): " rhel_iso_prompted

        if [[ $rhel_iso_prompted =~ ^[Yy]$ ]]; then
            check_rhel_iso
            echo "rhel_iso_exists: $rhel_iso_exists"
            if [ "$rhel_iso_exists" == true ]; then
                break
            fi
        fi
        echo "Unable to find rhel iso please try again."
        done
    fi
}

function choose_rhel_yum_repo() {
    labrepo_available
    if [ "$labrepo_check" == true ] ; then
        if [ -z "$RHEL_SOURCE_REPO" ]; then
            echo "-------"
            echo "Select the source rhel yum server to use:"
            echo "Labrepo: Requires dev network"
            echo "Public: Requires internet access"
            select cr in "Labrepo" "Public"; do
                case $cr in
                    Labrepo )
                    export RHEL_SOURCE_REPO="labrepo";
                    break
                    ;;
                    Public )
                    export RHEL_SOURCE_REPO="public";
                    break
                    ;;
                esac
            done
        fi
    else
        export RHEL_SOURCE_REPO="public";
    fi
}

function subscription_prompts(){
    echo "Verifying RedHat Subscription..."
    subscription_status=`subscription-manager status | grep 'Overall Status:' | awk '{ print $3 }'`

    if [ "$subscription_status" != "Current" ]; then
        echo "-------"
        echo "Since you are running a RHEL controller outside the Dev Network and/or not using Labrepo, "
        echo "You will need to subscribe to RHEL repositories."
        echo "-------"
        echo "Select RedHat subscription method:"
        echo "Standard: Requires Org + Activation Key"
        echo "RedHat Developer Login: A RedHat Developer account is free signup here https://developers.redhat.com/"
        echo "RedHat Developer License cannot be used in production environments"
        select cr in "Standard" "RedHat Developer" ; do
                case $cr in
                    Standard )
                    export RHEL_SUB_METHOD="standard";
                    break
                    ;;
                    "RedHat Developer" )
                    export RHEL_SUB_METHOD="developer";
                    break
                    ;;
                esac
            done
        while true; do
            subscription-manager remove --all
            subscription-manager unregister
            subscription-manager clean

            if [ "$RHEL_SUB_METHOD" == "standard" ]; then
                if [ -z "$RHEL_ORGANIZATION" ]; then
                    read -p 'Please enter your RHEL org number (EX: Its the --org flag for the subscription-manager command): ' orgnumber
                    export RHEL_ORGANIZATION=$orgnumber
                fi

                if [ -z "$RHEL_ACTIVATIONKEY" ]; then
                    read -p 'Please enter your RHEL activation key (EX: Its the --activationkey flag for the subscription-manager command): ' activationkey
                    export RHEL_ACTIVATIONKEY=$activationkey
                fi
                subscription-manager register --activationkey=$RHEL_ACTIVATIONKEY --org=$RHEL_ORGANIZATION --force
            elif [ "$RHEL_SUB_METHOD" == "developer" ]; then
                subscription-manager register
            fi

            subscription-manager refresh
            subscription-manager attach --auto
            echo "Checking subscription status..."
            subscription_status=`subscription-manager status | grep 'Overall Status:' | awk '{ print $3 }'`

            if [ "$subscription_status" == "Current" ]; then
                break;
            else
                echo "Error subscription appears to be invalid please try again..."
            fi
        done;

    fi

    if [ "$subscription_status" == "Current" ]; then
        run_cmd subscription-manager repos --enable rhel-7-server-rpms
        run_cmd subscription-manager repos --enable rhel-7-server-extras-rpms
        run_cmd subscription-manager repos --enable rhel-7-server-optional-rpms
        prompt_rhel_iso_download
    fi


}

function setup_ansible(){
    local core_dir="/opt/tfplenum/core"
    pushd $core_dir > /dev/null
    run_cmd yum install -y policycoreutils-python python-pip python-gobject sshpass
    run_cmd pip2 install --upgrade pip
    run_cmd pip2 install virtualenv
    run_cmd virtualenv --python=python2 --system-site-packages tfp-env
    run_cmd $core_dir/tfp-env/bin/pip2 install -r $core_dir/requirements-py2.txt
    rm -f /usr/bin/ansible*
    rm -f /usr/bin/dir2pi
    run_cmd ln -s /opt/tfplenum/core/tfp-env/bin/ansible-playbook /usr/bin/ansible-playbook
    run_cmd ln -s /opt/tfplenum/core/tfp-env/bin/ansible-console /usr/bin/ansible-console
    run_cmd ln -s /opt/tfplenum/core/tfp-env/bin/ansible-config /usr/bin/ansible-config
    run_cmd ln -s /opt/tfplenum/core/tfp-env/bin/ansible-galaxy /usr/bin/ansible-galaxy
    run_cmd ln -s /opt/tfplenum/core/tfp-env/bin/ansible-doc /usr/bin/ansible-doc
    run_cmd ln -s /opt/tfplenum/core/tfp-env/bin/ansible-inventory /usr/bin/ansible-inventory
    run_cmd ln -s /opt/tfplenum/core/tfp-env/bin/ansible-pull /usr/bin/ansible-pull
    run_cmd ln -s /opt/tfplenum/core/tfp-env/bin/ansible /usr/bin/ansible
    run_cmd ln -s /opt/tfplenum/core/tfp-env/bin/dir2pi /usr/bin/dir2pi
    popd > /dev/null
}

function add_workstation_repositories() {
    if [ "$RHEL_SOURCE_REPO" == "labrepo" ] && [ "$TFPLENUM_OS_TYPE" == "rhel" ]; then
        cat <<EOF > /etc/yum.repos.d/workstation-labrepo-rhel.repo
[rhel-7-workstation-rpms]
name=labrepos rhel-7-workstation-rpms
baseurl=http://yum.labrepo.sil.lab/rhel/workstation/rhel-7-workstation-rpms
enabled=0
gpgcheck=0

[rhel-7-workstation-optional-rpms]
name=labrepos rhel-7-workstation-optional-rpms
baseurl=http://yum.labrepo.sil.lab/rhel/workstation/rhel-7-workstation-optional-rpms
enabled=0
gpgcheck=0

[rhel-7-workstation-extras-rpms]
name=labrepos rhel-7-workstation-extras-rpms
baseurl=http://yum.labrepo.sil.lab/rhel/workstation/rhel-7-workstation-extras-rpms
enabled=0
gpgcheck=0

[rhel-7-workstation-source-rpms]
name=labrepos rhel-7-workstation-source-rpms
baseurl=http://yum.labrepo.sil.lab/rhel/workstation/rhel-7-workstation-source-rpms
enabled=0
gpgcheck=0
EOF
        yum clean all > /dev/null
        rm -rf /var/cache/yum/ > /dev/null
    fi
}

function generate_repo_file() {
    rm -rf /etc/yum.repos.d/*.repo > /dev/null

    if [ "$RHEL_SOURCE_REPO" == "labrepo" ] && [ "$TFPLENUM_OS_TYPE" == "rhel" ]; then
cat <<EOF > /etc/yum.repos.d/labrepo-rhel.repo
[rhel-7-server-extras-rpms]
name=labrepos rhel-7-server-extras-rpms
baseurl=http://yum.labrepo.sil.lab/rhel/rhel-7-server-extras-rpms
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release

[rhel-7-server-optional-rpms]
name=labrepos rhel-7-server-extras-rpms
baseurl=http://yum.labrepo.sil.lab/rhel/rhel-7-server-optional-rpms
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release

[rhel-7-server-rpms]
name=labrepos rhel-7-server-extras-rpms
baseurl=http://yum.labrepo.sil.lab/rhel/rhel-7-server-rpms
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release
EOF

    elif [ "$RHEL_SOURCE_REPO" == "public" ] && [ "$TFPLENUM_OS_TYPE" == "rhel" ]; then
        subscription_prompts
    fi

    yum clean all > /dev/null
    rm -rf /var/cache/yum/ > /dev/null
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

function prompt_di2e_creds() {
    if [ -z "$DIEUSERNAME" ]; then
        echo "-------"
        echo "Bootstrapping a controller requires DI2E credentials."
        while true; do
            read -p "DI2E Username: "  DIEUSERNAME
            if [ "$DIEUSERNAME" == "" ]; then
                echo "The username cannot be empty.  Please try again."
            elif [ "$DIEUSERNAME" != "" ]; then
                export GIT_USERNAME=$DIEUSERNAME
                break
            fi
        done
    fi

    if [ -z "$PASSWORD" ]; then
        while true; do
            read -s -p "DI2E Password: " PASSWORD
            echo
            if [ "$PASSWORD" == "" ]; then
                echo "The passwords cannot be empty.  Please try again."
            else
                read -s -p "DI2E Password (again): " PASSWORD2
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
                Master ) export BRANCH_NAME=master; export USE_FORK=no; break;;
                Devel ) export BRANCH_NAME=devel; export USE_FORK=no; break;;
                Custom ) export BRANCH_NAME=custom; export USE_FORK=yes; break;;
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
        export REPO_URL="https://bitbucket.di2e.net/scm/thisiscvah/tfplenum.git"
    else
        git config --global http.sslVerify false
    fi

    local directory="/opt/tfplenum"
    if [ -d "$directory" ]; then
        rm -rf $directory
    fi
    if [[ ! -d "$directory" && ("$USE_FORK" == "no") ]]; then
        run_cmd git clone $REPO_URL
        pushd $directory > /dev/null
        run_cmd git checkout $BRANCH_NAME
        popd > /dev/null
    fi
    if [[ ! -d "$directory" && ("$USE_FORK" == "yes") ]]; then
        run_cmd git clone $REPO_URL
        pushd $directory > /dev/null
        case "$i" in
        "tfplenum" )
            run_cmd git checkout "$TFPLENUM_BRANCH_NAME";;
        esac
        popd > /dev/null
    fi
}

function test_branch_name() {
    if [[ ! $(git checkout $1) ]]; then
        echo "Branch $1 is not found in your repo please reenter you branch name or create one with that name"
        enter_branch_name "$1" "$2"
    else
        git checkout $1
    fi
}

function enter_branch_name() {
    echo " Enter correct branch name for $2 the branch $1 doesnt exist"
    read -p "Branch Name: " NEW_BRANCH_NAME
    export NEW_BRANCH_NAME=$NEW_BRANCH_NAME
    test_branch_name "$NEW_BRANCH_NAME"
}

function setup_frontend(){
    run_cmd /opt/tfplenum/web/setup/setup.sh
}

function _install_and_start_mongo40() {
cat <<EOF > /etc/yum.repos.d/mongodb-org-4.0.repo
[mongodb-org-4.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/4.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc
EOF
    run_cmd yum install -y mongodb-org
    run_cmd systemctl enable mongod
}


function execute_pre(){

    rpm -e epel-release-latest-7.noarch.rpm
    yum remove epel-release -y
    rm -rf /etc/yum.repos.d/epel*.repo
    yum install $EPEL_RPM_PUBLIC_URL -y
    rm -rf epel-release-latest-7.noarch.rpm

    run_cmd yum -y update
    run_cmd yum -y install $PACKAGES
}

function remove_npmrc(){
    rm -rf ~/.npmrc
}

function setup_git(){
  if ! rpm -q git > /dev/null 2>&1; then
    yum install git -y > /dev/null 2>&1
  fi
git config --global --unset credential.helper
cat <<EOF > ~/credential-helper.sh
#!/bin/bash
echo username="\$GIT_USERNAME"
echo password="\$GIT_PASSWORD"
EOF
  git config --global credential.helper "/bin/bash ~/credential-helper.sh"
}

function execute_mip_bootstrap_playbook(){
    echo "Running MIP controller bootstrap."
    pushd "/opt/tfplenum/mip/mip-controller-bootstrap" > /dev/null
    make bootstrap
    popd > /dev/null
}

function execute_bootstrap_playbook(){
    echo "Running controller bootstrap"

    pushd "/opt/tfplenum/deployer/playbooks" > /dev/null
    make bootstrap
    popd > /dev/null

    pushd "/opt/tfplenum/stigs/playbooks" > /dev/null
    make controller-stigs
    popd > /dev/null
}

function execute_pull_docker_images_playbook(){
    echo "Pulling docker images"
    pushd "/opt/tfplenum/deployer/playbooks" > /dev/null
    make pull-docker-images
    popd > /dev/null
}

function prompts(){
    echo "---------------------------------"
    echo "TFPLENUM DEPLOYER BOOTSTRAP ${boostrap_version}"
    echo "---------------------------------"
    prompt_for_system

    export TFPLENUM_OS_TYPE=rhel
    if [ "$SYSTEM_NAME" == "DIP" ]; then
        prompt_runtype
    fi

    if [ "$SYSTEM_NAME" == "MIP" ]; then
        prompt_runtype_mip
    fi

    get_controller_ip

    if [ "$RUN_TYPE" == "bootstrap" ] || [ "$RUN_TYPE" == "full" ]; then
        if [ "$TFPLENUM_OS_TYPE" == "rhel" ]; then
            choose_rhel_yum_repo
        else
            export RHEL_SOURCE_REPO="public";
        fi
        generate_repo_file
        if [[ "$SYSTEM_NAME" == "MIP" ]]; then
            add_workstation_repositories
        fi
    fi

    if [ "$RUN_TYPE" == "full" ]; then
        prompt_di2e_creds
        set_git_variables
    fi
}

function prompt_for_system() {
    if [[ -z "${SYSTEM_NAME}" ]]; then
        choices=( DIP MIP GIP )
        echo "Select the platform this controller will manage:"
        select system in "${choices[@]}"; do
            case $system in
                DIP ) SYSTEM_NAME="DIP"; break;;
                MIP ) SYSTEM_NAME="MIP"; break;;
                GIP ) SYSTEM_NAME="GIP"; break;;
            esac
        done
    fi
    export SYSTEM_NAME=$SYSTEM_NAME;
    echo "[tfplenum]" > /etc/tfplenum.ini
    echo "system_name = ${SYSTEM_NAME}" >> /etc/tfplenum.ini
}


export BOOTSTRAP=true
prompts

if [ "$RUN_TYPE" == "full" ]; then
    setup_git
    clone_repos
    git config --global --unset credential.helper
    execute_pre
    remove_npmrc
    install_python36
    setup_frontend
fi

if [ "$RUN_TYPE" == "bootstrap" ]; then
    execute_pre
fi

if [ "$RUN_TYPE" == "bootstrap" ] || [ "$RUN_TYPE" == "full" ]; then
    setup_ansible
    if [[ "$SYSTEM_NAME" == "DIP" ]]; then
        execute_bootstrap_playbook
    fi

    if [[ "$SYSTEM_NAME" == "MIP" ]]; then
        execute_mip_bootstrap_playbook
    fi
fi

if [ "$RUN_TYPE" == "dockerimages" ] && [ "$SYSTEM_NAME" == "DIP" ]; then
    execute_pull_docker_images_playbook
fi

popd > /dev/null