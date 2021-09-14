# TFPlenum Builder

This repository contains all the files needed in order to build our in place upgrade RPM packages.
Furthermore, this project is responsbile controlling all the updates made to all the HELM appliactions
contained within the project

## Getting started

Each component should have a component.ci.yml file, it should only execute the jobs contained
when any of the files within that directory change.  For example, if you change any files within the redmine.
folder, the 3 jobs needed to build the (docker, helm, rpm builds) RPM will only run.  If for example you change
files within redmine and suricata, 6 jobs will run to build the rpms.

## Creating a release

To create a release things are incredibly simple, all you have to do is create a tag within Gitlabs Interface.
The Tag MUST be in the `vx.x.x` format.  Creating the tag will trigger the pipeline to rebuild all the artifacts.
They will also be published.


Last commit sychronized against
30c56e955fbb9022e0db62d6ce0a4272bf50f562
