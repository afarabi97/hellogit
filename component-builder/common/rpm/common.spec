Name: tfplenum-%{rpm_name}
Version: %{rpm_version}
Release: %{release_ver}%{?dist}
Summary: This package contains all docker images needed to install %{rpm_name}.
License: Property of US government
Requires: %{rpm_requires}

%define tf_folder /opt/tfplenum
%define staging %{tf_folder}/staging


%description
This package is for upgrading %{rpm_name}'s helm packages.  This package includes:
%{modules}

%install
mkdir -p %{buildroot}%{staging}
MODULES="%{modules}"
for IMAGE_PATH in $MODULES
do
    arrayIn=(${IMAGE_PATH//:/ })
    VERSION=${arrayIn[1]}
    arrayIn2=(${IMAGE_PATH//// })
    length=$(echo ${#arrayIn2[@]})
    IMAGE=${arrayIn2[$length - 1]}
    arrayIn3=(${IMAGE//:/ })
    COMMON_NAME=${arrayIn3[0]}
    cp %{artifact_dir}/${COMMON_NAME}-${VERSION}.tar %{buildroot}%{staging}/
done


%files
%{staging}/*


%post
setenforce 0
systemctl start docker.service
systemctl enable docker.service
systemctl start docker-distribution.service
systemctl enable docker-distribution.service

MODULES="%{modules}"
for IMAGE_PATH in $MODULES
do
    arrayIn=(${IMAGE_PATH//:/ })
    VERSION=${arrayIn[1]}
    arrayIn2=(${IMAGE_PATH//// })
    length=$(echo ${#arrayIn2[@]})
    IMAGE=${arrayIn2[$length - 1]}
    arrayIn3=(${IMAGE//:/ })
    COMMON_NAME=${arrayIn3[0]}

    if [ $length -ge 3 ]; then
    length=$(expr $length - 1)
    IMAGE=""
    for i in $( eval echo {0..$length} )
    do
        if [ $i -ge 1 ]; then
            IMAGE="$IMAGE${arrayIn2[$i]}/"
        fi
    done
    IMAGE=${IMAGE::-1}
    fi

    echo "COMMON_MODULE $COMMON_MODULE"
    echo "VERSION $VERSION"
    echo "IMAGE $IMAGE"
    echo "COMMON_NAME $COMMON_NAME"

    cmd="docker load --input /opt/tfplenum/staging/${COMMON_NAME}-${VERSION}.tar"
    echo "$cmd"
    eval $cmd

    cmd="docker tag ${IMAGE_PATH} localhost:5000/${IMAGE}"
    echo "$cmd"
    eval $cmd

    cmd="docker push localhost:5000/${IMAGE}"
    echo "$cmd"
    eval $cmd

    cmd="docker rmi -f $(docker image ls --format "{{.ID}}" ${IMAGE_PATH})"
    echo "$cmd"
    eval $cmd

    echo "File cleared to save space" > /opt/tfplenum/staging/${COMMON_NAME}-${VERSION}.tar
done

setenforce 1
getenforce
