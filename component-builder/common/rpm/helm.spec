Name: tfplenum-%{rpm_name}
Version: %{rpm_version}
Release: %{release_ver}%{?dist}
Summary: This package contains all docker images and helm charts need to install %{helm_name}.
License: Property of US government
Requires: %{rpm_requires}

%define tf_folder /opt/tfplenum
%define staging %{tf_folder}/staging
%define charts_folder /var/www/html/offlinerepo/charts/
%define helm_tar %{helm_name}-%{helm_version}.tgz


%description
This package is for upgrading %{helm_name}'s helm package and docker containers. This RPM includes:
%{modules}
and the helm chart file %{staging}/%{helm_tar}.

%install
mkdir -p %{buildroot}%{staging}
mkdir -p %{buildroot}%{charts_folder}

MODULES="%{modules}"
if [ "$MODULES" != "empty"  ]; then
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
else
    touch %{buildroot}%{staging}/%{rpm_name}-notar
fi
cp %{artifact_dir}/%{helm_tar} %{buildroot}%{charts_folder}/


%files
%{staging}/*
%{charts_folder}/%{helm_tar}


%post
setenforce 0
systemctl start docker.service
systemctl enable docker.service
systemctl start docker-distribution.service
systemctl enable docker-distribution.service

arrayIn=(${HOSTNAME//./ })
domain=${arrayIn[1]}

MODULES="%{modules}"
if [ "$MODULES" != "empty"  ]; then
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
fi

chart_url=https://controller/chartmuseum/api/charts

cmd="curl -k -X "DELETE" ${chart_url}/%{helm_name}/%{helm_version}"
echo "$cmd"
eval $cmd

cmd="curl -k --data-binary "@%{charts_folder}/%{helm_tar}" -H 'Content-Type: application/octet-stream' $chart_url"
echo "$cmd"
eval $cmd

helm repo update

setenforce 1
getenforce
