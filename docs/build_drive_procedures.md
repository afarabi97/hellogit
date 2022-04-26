## Drive Build Procedures

The purpose of this document is to outline the procedures needed in order to build a drive from start to finish. 
Anyone following this document should be able to execute this procedures to build documents from start to finish.

### Pre-requisites

Before creating a release it is paramount that you communicate to all the team leads on the project and ensure all 
functionality that needs to be merged will be included as part of the next drive build.  Failure to do so may 
result in features or bugs fixes not making it into a drive build.  All those changes need to go into the corresponding release branch prior to these procedures being run.

### Step by step procedures

1. Go plug in the drives or ask someone at the office to plugin the drives for you into the drive creation server located in the server room.
2. Go to [Nexus](https://nexus.sil.lab/#browse/browse:tfplenum-stable), check for latest version.  For example, if    latest version is 3.7.0-28 then increment that version to v3.7.0-29 in your brain for the next step.
3. Go to [New Tags page](https://gitlab.sil.lab/tfplenum/tfplenum/-/tags/new) fill out the form.
   - For <strong>Tag name</strong> use previously incremented version stored in your brain with the following format <strong>v3.7.0-29</strong>
   - For <strong>Create from</strong> use the <strong>release/3.7.0.0</strong> branch.
4. Click on <strong>Create Tag</strong>
5. Go to [Pipelines](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipelines) and monitor its progress.  This process will take about 30 minutes.  While this process is running we can do all our other checks before kicking off the main
export build. (NOTE: If the job does not display right away on the page, refresh the page by hitting F5)
6. SSH to the gitlab runner using `ssh drive_creator@10.10.102.10`. Execute the following procedures:
   1. `lsblk` make note of the devices plugged into /dev/sda, /dev/sdb, and /dev/sdc. <strong>DO NOT</strong> use the device that is mounted to the root drive of the OS.  It will have a MOUNTPOINT set to /.  In the below example, /dev/sdc is mounted to the OS drive so <strong>DO NOT</strong> use that device when setting up the schedule variables.
        ```
        NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
        loop0    7:0    0 110.6M  1 loop /snap/core/12834
        loop2    7:2    0 111.6M  1 loop /snap/core/12941
        sda      8:0    0   1.8T  0 disk 
        ├─sda1   8:1    0    20G  0 part 
        ├─sda2   8:2    0    10G  0 part 
        ├─sda3   8:3    0     1K  0 part 
        ├─sda5   8:5    0 342.7G  0 part 
        └─sda6   8:6    0   1.5T  0 part 
        sdb      8:0    0   1.8T  0 disk 
        ├─sdb1   8:1    0    20G  0 part 
        ├─sdb2   8:2    0    10G  0 part 
        ├─sdb3   8:3    0     1K  0 part 
        ├─sdb5   8:5    0 342.7G  0 part 
        └─sdb6   8:6    0   1.5T  0 part 
        sdc      8:32   0 953.9G  0 disk 
        ├─sdc1   8:33   0     1M  0 part 
        └─sdc2   8:34   0 953.9G  0 part /
        ```
   2. For CPT and MDT drive creation you should see two devices /dev/sd[x] that are <strong>NOT</strong> mounted to the OS / drive.  These are the values you will be using in subsequent steps in the schedule configuration.
   3. Make sure drive creation is mounted using `ls /mnt/drive_creation`, if drive is not mounted, it will need to be remounted by an administrator.
7. Go to [3.7.0 drive schedule](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules/197/edit) review the following variables
   - <strong>CREATE_CPT_DRIVE</strong> - make sure this is set to <strong>yes</strong> if you want to create it, or set it <strong>no</strong> otherwise.
   - <strong>CREATE_MDT_DRIVE</strong> - make sure this is set to <strong>yes</strong> if you want to create it, or set it <strong>no</strong> otherwise.
   - <strong>MASTER_DRIVE_CREATION_EXTERNAL_CPT_DRIVE</strong> - set this to one of the /dev/sd[x] values from step 6
   - <strong>MASTER_DRIVE_CREATION_EXTERNAL_MDT_DRIVE</strong> - set this to one of the /dev/sd[x] values from step 6
   - <strong>RPM_BUILD</strong> - make sure it is set to <strong>stable</strong>
8. Go back to [Pipelines](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipelines) and make sure all the RPMs built successfully by making sure the new release is displayed in [Releases page](https://gitlab.sil.lab/tfplenum/tfplenum/-/releases) that matches the corresponding tag you entered in step 3.
9. Go to [Schedules page](https://gitlab.sil.lab/tfplenum/tfplenum/-/pipeline_schedules).
10. Click on the play button next to the <strong>(Internal) Create 3.7.0 CPT and MDT Development Drives</strong> schedule.
