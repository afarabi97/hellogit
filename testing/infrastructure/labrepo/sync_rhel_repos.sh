#!/bin/bash

rhel_repos="rhel-7-server-rpms rhel-7-server-extras-rpms rhel-7-server-optional-rpms"

repo_path="/repos/yum/rhel"

pushd "$repo_path" > /dev/null

for repo in $rhel_repos; do
  echo "Syncing $repo..."
  reposync --repoid=$repo --download_path=$repo_path --download-metadata --downloadcomps
  pushd $repo_path/$repo > /dev/null
  rm -rf .repodata
  rm -rf repodata
  createrepo -g comps.xml .
  popd > /dev/null  
done

echo "rhel sync complete"

