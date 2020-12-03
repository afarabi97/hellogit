#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/../web/"
USER_HOME="/home/david"

if [ "$EUID" -ne 0 ]
  then echo "Please run as root or use sudo."
  exit
fi

pushd $SCRIPT_DIR > /dev/null

function run_cmd {
    local command="$@"
    eval $command
    local ret_val=$?
    if [ $ret_val -ne 0 ]; then
        echo "$command returned error code $ret_val"
        exit 1
    fi
}

function _install_nodejs(){
    run_cmd rm -rf node-v14.5.0-linux-x64*
	run_cmd wget https://nodejs.org/dist/v14.5.0/node-v14.5.0-linux-x64.tar.xz
    run_cmd tar xf node-v14.5.0-linux-x64.tar.xz
    run_cmd cd node-v14.5.0-linux-x64/
    run_cmd cp -R * /usr/local/
    run_cmd cd ..
	run_cmd rm -rf node-v14.5.0-linux-x64/
	run_cmd rm -f node-v14.5.0-linux-x64.tar.xz
    run_cmd node -v
    run_cmd npm -v
}

function _install_angular(){
	pushd $FRONTEND_DIR/frontend > /dev/null
	run_cmd npm install -g npm@6.14.5
    run_cmd npm install -g @angular/cli@10.2.0
	run_cmd npm cache verify
    run_cmd npm install
	npm audit fix
	popd > /dev/null
}

function _install_virtalenvs(){
    apt-get install python3-venv gcc krb5-config python3-dev libffi7 libffi-dev
    mkdir -p $USER_HOME/.virtualenvs/
    pushd $USER_HOME/.virtualenvs/ > /dev/null
    run_cmd python3 -m venv pipeline
    $USER_HOME/.virtualenvs/pipeline/bin/pip install --upgrade pip
    $USER_HOME/.virtualenvs/pipeline/bin/pip install -r $SCRIPT_DIR/../testing/pipeline/requirements.txt
    run_cmd python3 -m venv web
    $USER_HOME/.virtualenvs/web/bin/pip install --upgrade pip
    $USER_HOME/.virtualenvs/web/bin/pip install wheel
    $USER_HOME/.virtualenvs/web/bin/pip install -r $FRONTEND_DIR/requirements.txt
    popd > /dev/null
}

_install_nodejs
_install_angular
# _install_virtalenvs

popd > /dev/null
