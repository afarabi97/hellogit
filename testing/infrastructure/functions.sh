
function run_cmd {
	local command="$@"
	eval $command
	local ret_val=$?
	if [ $ret_val -ne 0 ]; then
		echo "$command returned error code $ret_val"
        exit 1
	fi
}

function setup_sdk(){
  pushd /opt > /dev/null
  rm -rf vsphere-automation-sdk-python
  git clone https://github.com/vmware/vsphere-automation-sdk-python.git
  git checkout v6.8.7
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
    run_cmd curl -s -o VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle http://misc.labrepo.lan/VMware-ovftool-4.3.0-12320924-lin.x86_64.bundle
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
