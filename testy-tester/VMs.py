---

host_configuration:
  vcenter:
    ip_address: "172.16.20.106"
    username: "administrator@sil.local"
    password: "We.are.tfplenum4$"
    datacenters: "SIL_Datacenter"
    cluster_name: "SIL_Cluster"

kits:
  kit_1:

    kickstart_configuration:

        dhcp_start: "172.16.73.100"
        dhcp_end: "172.16.73.110"
        netmask: "255.255.255.0"

        # Gateway will probably be different on a per kit basis (depends on the vlan)
        gateway: "172.16.73.1"

        root_password: "we.are.tfplenum"

    VM_settings:
        username: "root"
        password: "we.are.tfplenum"

        # Kubernetes cidr will probably be different on a per kit basis
        kubernetes_cidr: "172.16.73.112/28"

        VMs:

          # Note: You should not have more than one of these
          test_controller.lan:

            type: "controller" # Can be controller, sensor, or server

            # GestOS should be one of the enumeration values in com.vmware.vcenter.vm.GuestOS
            # https://vdc-repo.vmware.com/vmwb-repository/dcr-public/89baa2e8-e8f1-4d6a-87c5-baa3116e422a/42afa517-2614-43fb-a352-c3ed88ae95fc/doc/com/vmware/vcenter/vm/class-use/GuestOS.html
            # For us that will likely be: RHEL_7_64, CENTOS_7_64, VMWARE_PHOTON_64, or UBUNTU_64
            # Sorry Holden, you're on your own for arch. They didn't have it in the guest list
            vm_guestos: "RHEL_7_64"

            vm_to_clone: "DO NOT TURN ON Master Controller (RHEL)"
            cloned_vm_name: "Test Controller"

            username: "root"
            password: "we.are.tfplenum"

            # The following controls where the VM will be placed on the ESXi servers
            storage_options:
              datacenter: "SIL_Datacenter"
              cluster: "SIL_Cluster"
              datastore: "NVMe Storage"
              folder: "Testing"
            networking:
              std_portgroup_name: "VM Network"
              nics:
                management_nic:
                  type: "manual" # This can be auto, manual, or link-local
                  ip_address: "172.16.73.20"
                  start_connected: True
                  management_interface: True
                  mac_auto_generated: True
                  mac_address: "" # This is ignored if mac_auto_generated is true
                  dv_portgroup_name: "73 Portgroup"
                  std_portgroup_name:
            cpu_spec:
              sockets: 2
              cores_per_socket: 1
              hot_add_enabled: False
              hot_remove_enabled: False
            memory_spec:
              size: 16 # This value is in GiB
              hot_add_enabled: False
            disks:
              boot: 200 # Name of disk followed by capacity in GiBs
            iso_file: "rhel-server-7.4-x86_64-dvd.iso"
            boot_order: # Valid options are CDROM, DISK, and ETHERNET
              - "CDROM" # CDROM will be ignored if iso_file is None
              - "DISK"
              - "ETHERNET"
          tfserver1.lan:
            type: "master-server" # Can be controller, sensor, or server
            vm_guestos: "RHEL_7_64"
            storage_options:
              datacenter: "SIL_Datacenter"
              cluster: "SIL_Cluster"
              datastore: "NVMe Storage"
              folder: "Testing"
            networking:
              nics:
                management_nic:
                  type: "manual"
                  ip_address: "172.16.73.40"
                  start_connected: True
                  management_interface: True
                  mac_auto_generated: True
                  mac_address: ""
                  dv_portgroup_name: "73 Portgroup"
                  std_portgroup_name:
            cpu_spec:
              sockets: 16
              cores_per_socket: 4
              hot_add_enabled: False
              hot_remove_enabled: False
            memory_spec:
              size: 64
              hot_add_enabled: False
            boot_drive_name: "sda"
            disks:
              boot: 20
              ceph: 20
            iso_file:
            boot_order:
              - "CDROM"
              - "DISK"
              - "ETHERNET"
          tfserver2.lan:
            type: "server" # Can be controller, sensor, or server
            vm_guestos: "RHEL_7_64"
            storage_options:
              datacenter: "SIL_Datacenter"
              cluster: "SIL_Cluster"
              datastore: "NVMe Storage"
              folder: "Testing"
            networking:
              nics:
                management_nic:
                  type: "manual"
                  ip_address: "172.16.73.41"
                  start_connected: True
                  management_interface: True
                  mac_auto_generated: True
                  mac_address: ""
                  dv_portgroup_name: "73 Portgroup"
                  std_portgroup_name:
            cpu_spec:
              sockets: 16
              cores_per_socket: 1
              hot_add_enabled: False
              hot_remove_enabled: False
            memory_spec:
              size: 64
              hot_add_enabled: False
            boot_drive_name: "sda"
            disks:
              boot: 20
              ceph: 20
            iso_file:
            boot_order:
              - "CDROM"
              - "DISK"
              - "ETHERNET"
          tfsensor1.lan:
            type: "sensor" # Can be controller, sensor, or server
            vm_guestos: "RHEL_7_64"
            storage_options:
              datacenter: "SIL_Datacenter"
              cluster: "SIL_Cluster"
              datastore: "NVMe Storage"
              folder: "Testing"
            networking:
              nics:
                management_nic:
                  type: "manual"
                  ip_address: "172.16.73.50"
                  start_connected: True
                  management_interface: True
                  mac_auto_generated: True
                  mac_address: ""
                  dv_portgroup_name: "73 Portgroup"
                  std_portgroup_name:
                ens224:
                  type: "manual"
                  ip_address:
                  start_connected: True
                  management_interface: False
                  mac_auto_generated: True
                  mac_address: ""
                  dv_portgroup_name: "Monitoring Portgroup"
                  std_portgroup_name:
            cpu_spec:
              sockets: 16
              cores_per_socket: 1
              hot_add_enabled: False
              hot_remove_enabled: False
            memory_spec:
              size: 64
              hot_add_enabled: False
            boot_drive_name: "sda"
            disks:
              boot: 20
              ceph: 20
            iso_file:
            boot_order:
            - "CDROM"
            - "DISK"
            - "ETHERNET"
          tfsensor2.lan:
            type: "remote-sensor" # Can be controller, sensor, or server
            vm_guestos: "RHEL_7_64"
            storage_options:
              datacenter: "SIL_Datacenter"
              cluster: "SIL_Cluster"
              datastore: "NVMe Storage"
              folder: "Testing"
            networking:
              nics:
                management_nic:
                  type: "manual"
                  ip_address: "172.16.73.51"
                  start_connected: True
                  management_interface: True
                  mac_auto_generated: True
                  mac_address: ""
                  dv_portgroup_name: "73 Portgroup"
                  std_portgroup_name:
                ens224:
                  type: "manual"
                  ip_address:
                  start_connected: True
                  management_interface: False
                  mac_auto_generated: True
                  mac_address: ""
                  dv_portgroup_name: "Monitoring Portgroup"
                  std_portgroup_name:
            cpu_spec:
              sockets: 16
              cores_per_socket: 1
              hot_add_enabled: False
              hot_remove_enabled: False
            memory_spec:
              size: 64
              hot_add_enabled: False
            boot_drive_name: "sda"
            disks:
              boot: 20
              ceph: 20
            iso_file:
            boot_order:
            - "CDROM"
            - "DISK"
            - "ETHERNET"
