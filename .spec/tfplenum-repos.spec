Name:       tfplenum-repo
Version:    %{rpm_version}
Release:    %{release_inc}%{?dist}
Summary:    The tfplenum repos package contains all the offline repos packages needed for setting up a controller.
License:    Property of US government

%define webdir /var/www/html
%define offlinerepo %{webdir}/offlinerepo
%define tfplenum_repo %{offlinerepo}/tfplenum
%define iso_mnt /rhel8temp

%description
This is the repos RPM that will update the /var/www/html/offlinerepo with all the required dependencies.

%install
mkdir -p %{buildroot}%{tfplenum_repo}
/usr/bin/cp -rf %{cache_dir}/MIP %{buildroot}%{webdir}
/usr/bin/cp -rf %{cache_dir}/offlinerepo %{buildroot}%{webdir}
/usr/bin/cp -rf %{cache_dir}/pcaps %{buildroot}%{webdir}

%post
cat << EOF>/etc/yum.repos.d/offline.repo
[local-rhel-8-baseos-rpms]
name=rhel-8-local-baseos
baseurl=file:///var/www/html/offlinerepo/tfplenum/BaseOS
enabled=1
gpgcheck=0

[local-rhel-8-appstream-rpms]
name=rhel-8-local-appstream
baseurl=file:///var/www/html/offlinerepo/tfplenum/AppStream
enabled=1
gpgcheck=0

[local-rhel-8-extras-rpms]
name=rhel-8-local-extras
baseurl=file:///var/www/html/offlinerepo/tfplenum/Extras
enabled=1
gpgcheck=0
EOF


%postun
if [ $1 == 0 ];then
    echo "--------------------"
    echo "tfplenum-repos RPM is getting removed/uninstalled"
    echo "--------------------"
    rm -rf %{webdir}/*
    rm -rf /etc/yum.repos.d/offline.repo
fi

%cleanup
rm -rf %{buildroot}

%files
%{webdir}/*

%changelog
