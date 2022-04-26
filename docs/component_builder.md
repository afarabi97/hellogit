## Component builder

The component builder which can be found under component-builder/ directory is directly responsible for building out all the custom Docker containers, Helm charts and RPMs for all the subcomponents contained within the TFPlenum controller.

### How to build a helm chart

1. Open up any of the component folders (EX: component-builder/component/rocketchat/helm)
2. Add or update any of the files within this folder.
3. Open up version.yml in the projects root folder 
4. Increment the associated helm version number in the <strong>helm_versions:</strong> section. (<strong>NOTE:</strong> Failure to update the version number will result in a job failure as nexus is setup with to deny duplicate version numbers from being published.)
5. Commit the code and push it up to your gitlab fork.  A pipeline will automatically get spawned based on the changes you made and it will both build and publish the Helm chart to the nexus.sil.lab 

### How to build a docker container

1. Open up any of teh component folders that has a custom docker container file (EX: component-builder/component/suricata/templates/Dockerfile.j2)
2. Make changes to the Dockerfile.j2 template as well as any docker context changes (EX: component-builder/component/suricata/docker folder).
  - The docker context folder in the example can hold any files you wish to copy into the docker container itself.
3. Open up version.yml in the projects root folder
4. Increment the associated helm version number in the <strong>docker_versions:</strong> section. (<strong>NOTE:</strong> Failure to update the version number will result in a job failure as nexus is setup with to deny duplicate version numbers from being published.)
5. Commit the code and push it up to your gitlab fork.  A pipeline will automatically get spawned based on the changes you made and it will both build and publish the new docker container to the nexus.sil.lab 

### How to build a RPM package.

1. Ensure all your code is pushed up.
2. Create a tag with one of the following formats vX.X.Xdev-1 or vX.X.Xdev-1-```component name```
  - The first format will build all the rpms with the specified version then publish to nexus. (<strong>NOTE:</strong> Anything marked with the dev tag with the same version will be overridden.) 
  - The second cormat will build a specific RPM.  For example v3.7.0-1-arkime, will only build the tfplenum-arkime RPM package and publish to nexus.
3. After the tag is created a pipeline will build and publish the rpms to [tfplenum-dev repo](https://nexus.sil.lab/#browse/browse:tfplenum-dev).
4. Make sure the the latest version of [tfplenum-cli](https://gitlab.sil.lab/tfplenum/tfplenum-cli) repo is also published.  Follow the same instructions for creating the tag.

### How to cut a stable release

1. Ensure all code has been tested and is ready to go and committed.
2. Create a tag with the vX.X.X-1 format. (<strong>NOTE:</strong> If there are RPMs in the [tfplenum-stable repo](https://nexus.sil.lab/#browse/browse:tfplenum-stable) with the same version as the tag just created, the job will fail. RPM overrides are not allowed in the stable repository.)
3. After the tag is create, it will spawn a pipeline building all the RPMs and it will publish it to the [tfplenum-stable repo](https://nexus.sil.lab/#browse/browse:tfplenum-stable)
4. Make sure the the latest version of [tfplenum-cli](https://gitlab.sil.lab/tfplenum/tfplenum-cli) repo is also published.  Follow the same instructions for creating the tag.

### How to build a hardware or virtual kit using RPMs

1. Open up the schedule you use to build your kit.
2. Add the ```RPM_BUILD``` variable to it.
3. For the value enter either ```stable``` or ```dev```.
  - The stable value uses the [tfplenum-stable repo](https://nexus.sil.lab/#browse/browse:tfplenum-stable) for provisioning the controller
  - The dev value uses the [tfplenum-dev repo](https://nexus.sil.lab/#browse/browse:tfplenum-dev) for provisioning the controller.
  > <strong>NOTE:</strong> The latest versions of the RPMs will be selected in the above repositories.
4. Hit play on your schedule.
