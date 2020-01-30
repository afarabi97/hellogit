function run_cmd {
	local command="$@"
	eval $command
	local ret_val=$?
	if [ $ret_val -ne 0 ]; then
		echo "$command returned error code $ret_val"
        exit 1
	fi
}

function root_check(){
    if [ "$EUID" -ne 0 ]
        then echo "Please run as root or use sudo."
        exit 2
    fi
}

function set_os_type(){
    local os_id=$(awk -F= '/^ID=/{print $2}' /etc/os-release)
    if [ "$os_id" == '"centos"' ]; then
        export OS_TYPE=centos
    else
        export OS_TYPE=rhel
    fi
}

function check_if_rhel_or_fail(){
    set_os_type
    if [ "$OS_TYPE" == "rhel" ]; then
        echo "Script running on correct OS."
    else
        echo "Script running on incompatible OS."
        exit 3
    fi
}

function check_if_centos_or_fail(){
    set_os_type
    if [ "$OS_TYPE" == "centos" ]; then
        echo "Script running on correct OS."
    else
        echo "Script running on incompatible OS."
        exit 3
    fi
}

function setup_sdk(){
  pushd /opt > /dev/null
  rm -rf vsphere-automation-sdk-python
  git clone https://github.com/vmware/vsphere-automation-sdk-python.git
  cd vsphere-automation-sdk-python/
  git checkout v6.8.7
  cd ..
  popd > /dev/null
}

function install_requirements(){
  pushd $int_testing_dir > /dev/null
  run_cmd pip3 install --upgrade pip
  run_cmd pip3 install --upgrade --force-reinstall -r /opt/vsphere-automation-sdk-python/requirements.txt --extra-index-url file:///opt/vsphere-automation-sdk-python/lib
  run_cmd pip3 install -r requirements.txt
  popd > /dev/null
}

function install_ovftool(){
    pushd /root > /dev/null
    run_cmd curl -s -o VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle http://misc.labrepo.sil.lab/VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle
    run_cmd bash VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle
    popd > /dev/null
}

function setup_chrome(){
  if rpm -q google-chrome-stable > /dev/null 2>&1 ; then
    yum remove google-chrome-stable -y > /dev/null 2>&1
  fi

  cat << EOF > /etc/yum.repos.d/google-chrome.repo
[google-chrome]
name=google-chrome
baseurl=http://dl.google.com/linux/chrome/rpm/stable/x86_64
enabled=1
gpgcheck=1
gpgkey=https://dl.google.com/linux/linux_signing_key.pub
EOF

  yum clean all
  run_cmd yum install google-chrome-stable -y

  run_cmd curl -s -o chromedriver_linux64.zip https://chromedriver.storage.googleapis.com/2.46/chromedriver_linux64.zip
  run_cmd unzip -o -q chromedriver_linux64.zip -d /usr/local/bin/
  run_cmd chmod 755 /usr/local/bin/chromedriver
  rm -rf chromedriver_linux64.zip
}
