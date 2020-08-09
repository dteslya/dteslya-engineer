---
title:  "Automate Windows VM Creation and Configuration in vSphere Using Packer, Terraform and Ansible (Part 2 of 3)"
description: "In the second part of the series I show how to create VMs with Terraform."
categories:
  - automation
  - tutorial
tags:
  - ansible
  - terraform
  - packer
  - vmware
  - windows
date: "2019-01-21"
toc: true
---
In the [first entry]({{< ref 2018-12-20-creating_vm_templates_with_packer.md >}}) of this series I showed how to create VM templates using Packer. Now we can use those templates to spin up actual VMs with help of Terraform.

All the scripts and configurations I use in this series of articles are available at my [GitHub repository](https://github.com/dteslya/win-iac-lab).

## Creating VMs with Terraform
[Terraform](https://www.terraform.io/) is a tool by Hashicorp which lets you turn your virtual infrastructure into code by writing declarative configuration files. It supports all the popular cloud infrastructure providers and most importantly VMware vSphere among others.

### Setting up Terraform
* Install Terraform on your workstation by downloading the [binary file](https://www.terraform.io/downloads.html). Put it somewhere on your $PATH. I use `~/bin` for this purpose.
* Clone my [Github repo](https://github.com/dteslya/win-iac-lab) and `cd` to `terraform`
* Run `terraform init`. It will download the VMware vSphere provider plugin.
[![terraform init](/images/2019-01-21-terraform-01.png)](/images/2019-01-21-terraform-01.png)

Now everything is ready to proceed with editing the configuration files and running Terraform.

### Configuration files
When Terraform is run it reads all the `.tf` files in the working directory. This lets you group different logical parts of the configuration into separate files. In my example I have the following directory structure:
```bash
.
├── 01-PDC.tf
├── 02-ReplicaDC.tf
├── 03-FileServer.tf
├── base.tf
├── terraform.tfvars.example
└── variables.tf
```
I start with the `base.tf` where I define connection to vCenter and basic parameters such as datacenter name, compute and storage clusters and most importantly template VM. Template VM is used to set target VMs parameters such as number of CPUs, RAM and disk size etc. Those parameters are set in separate configuration files for each VM (`01-PDC.tf`, `02-ReplicaDC.tf` and `03-FileServer.tf`).  
I also use `variables.tf` to define all the variables and `terraform.tfvars` to set the actual values.

{{< alert message="It is considered best practice to add `terraform.tfvars` to `.gitignore` file to avoid leaking of sensitive data to version control system." type="info" badge="Note" >}}

### Running Terraform
After you have modified configuration files according to your environment you can run `terraform plan`. This will give you the idea of what will happen when you run `terraform apply` so you can review your configuration and double check everything before actually making any changes to the infrastructure. This step is crucial in production environments, but in our case, you can skip it and run `terraform apply` straight away. It will still list all the actions to be performed and ask you for confirmation before making any changes to the infrastructure.
"terraform apply" output
```bash
dteslya@ubuntu ~/a/terraform> terraform apply
data.vsphere_datacenter.dc: Refreshing state...
data.vsphere_virtual_machine.Win2016GUI_template: Refreshing state...
data.vsphere_datastore_cluster.datastore_cluster: Refreshing state...
data.vsphere_network.network: Refreshing state...
data.vsphere_compute_cluster.cluster: Refreshing state...

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  + vsphere_virtual_machine.01-PDC
      id:                                                            <computed>
      boot_retry_delay:                                              "10000"
      change_version:                                                <computed>
      clone.#:                                                       "1"
      clone.0.customize.#:                                           "1"
      clone.0.customize.0.ipv4_gateway:                              "10.5.202.1"
      clone.0.customize.0.network_interface.#:                       "1"
      clone.0.customize.0.network_interface.0.dns_server_list.#:     "1"
      clone.0.customize.0.network_interface.0.dns_server_list.0:     "10.5.202.3"
      clone.0.customize.0.network_interface.0.ipv4_address:          "10.5.202.4"
      clone.0.customize.0.network_interface.0.ipv4_netmask:          "24"
      clone.0.customize.0.timeout:                                   "10"
      clone.0.customize.0.windows_options.#:                         "1"
      clone.0.customize.0.windows_options.0.admin_password:          <sensitive>
      clone.0.customize.0.windows_options.0.auto_logon:              "true"
      clone.0.customize.0.windows_options.0.auto_logon_count:        "1"
      clone.0.customize.0.windows_options.0.computer_name:           "01-pdc"
      clone.0.customize.0.windows_options.0.full_name:               "Administrator"
      clone.0.customize.0.windows_options.0.organization_name:       "Managed by Terraform"
      clone.0.customize.0.windows_options.0.run_once_command_list.#: "5"
      clone.0.customize.0.windows_options.0.run_once_command_list.0: "winrm quickconfig -force"
      clone.0.customize.0.windows_options.0.run_once_command_list.1: "winrm set winrm/config @{MaxEnvelopeSizekb=\"100000\"}"
      clone.0.customize.0.windows_options.0.run_once_command_list.2: "winrm set winrm/config/Service @{AllowUnencrypted=\"true\"}"
      clone.0.customize.0.windows_options.0.run_once_command_list.3: "winrm set winrm/config/Service/Auth @{Basic=\"true\"}"
      clone.0.customize.0.windows_options.0.run_once_command_list.4: "netsh advfirewall set allprofiles state off"
      clone.0.customize.0.windows_options.0.time_zone:               "85"
      clone.0.template_uuid:                                         "422e95b1-dfe9-25cd-b223-c87077093ae9"
      clone.0.timeout:                                               "30"
      cpu_limit:                                                     "-1"
      cpu_share_count:                                               <computed>
      cpu_share_level:                                               "normal"
      datastore_cluster_id:                                          "group-p289"
      datastore_id:                                                  <computed>
      default_ip_address:                                            <computed>
      disk.#:                                                        "1"
      disk.0.attach:                                                 "false"
      disk.0.datastore_id:                                           "<computed>"
      disk.0.device_address:                                         <computed>
      disk.0.disk_mode:                                              "persistent"
      disk.0.disk_sharing:                                           "sharingNone"
      disk.0.eagerly_scrub:                                          "false"
      disk.0.io_limit:                                               "-1"
      disk.0.io_reservation:                                         "0"
      disk.0.io_share_count:                                         "0"
      disk.0.io_share_level:                                         "normal"
      disk.0.keep_on_remove:                                         "false"
      disk.0.key:                                                    "0"
      disk.0.label:                                                  "disk0"
      disk.0.path:                                                   <computed>
      disk.0.size:                                                   "32"
      disk.0.thin_provisioned:                                       "true"
      disk.0.unit_number:                                            "0"
      disk.0.uuid:                                                   <computed>
      disk.0.write_through:                                          "false"
      ept_rvi_mode:                                                  "automatic"
      firmware:                                                      "bios"
      folder:                                                        "Teslya/mcsa"
      force_power_off:                                               "true"
      guest_id:                                                      "windows9Server64Guest"
      guest_ip_addresses.#:                                          <computed>
      host_system_id:                                                <computed>
      hv_mode:                                                       "hvAuto"
      imported:                                                      <computed>
      latency_sensitivity:                                           "normal"
      memory:                                                        "8192"
      memory_limit:                                                  "-1"
      memory_share_count:                                            <computed>
      memory_share_level:                                            "normal"
      migrate_wait_timeout:                                          "30"
      moid:                                                          <computed>
      name:                                                          "01-pdc"
      network_interface.#:                                           "1"
      network_interface.0.adapter_type:                              "vmxnet3"
      network_interface.0.bandwidth_limit:                           "-1"
      network_interface.0.bandwidth_reservation:                     "0"
      network_interface.0.bandwidth_share_count:                     <computed>
      network_interface.0.bandwidth_share_level:                     "normal"
      network_interface.0.device_address:                            <computed>
      network_interface.0.key:                                       <computed>
      network_interface.0.mac_address:                               <computed>
      network_interface.0.network_id:                                "dvportgroup-262"
      num_cores_per_socket:                                          "1"
      num_cpus:                                                      "4"
      reboot_required:                                               <computed>
      resource_pool_id:                                              "resgroup-62"
      run_tools_scripts_after_power_on:                              "true"
      run_tools_scripts_after_resume:                                "true"
      run_tools_scripts_before_guest_shutdown:                       "true"
      run_tools_scripts_before_guest_standby:                        "true"
      scsi_bus_sharing:                                              "noSharing"
      scsi_controller_count:                                         "1"
      scsi_type:                                                     "lsilogic-sas"
      shutdown_wait_timeout:                                         "3"
      swap_placement_policy:                                         "inherit"
      uuid:                                                          <computed>
      vapp_transport.#:                                              <computed>
      vmware_tools_status:                                           <computed>
      vmx_path:                                                      <computed>
      wait_for_guest_net_routable:                                   "true"
      wait_for_guest_net_timeout:                                    "5"

  + vsphere_virtual_machine.02-ReplicaDC
      id:                                                            <computed>
      boot_retry_delay:                                              "10000"
      change_version:                                                <computed>
      clone.#:                                                       "1"
      clone.0.customize.#:                                           "1"
      clone.0.customize.0.ipv4_gateway:                              "10.5.202.1"
      clone.0.customize.0.network_interface.#:                       "1"
      clone.0.customize.0.network_interface.0.dns_server_list.#:     "1"
      clone.0.customize.0.network_interface.0.dns_server_list.0:     "10.5.202.3"
      clone.0.customize.0.network_interface.0.ipv4_address:          "10.5.202.5"
      clone.0.customize.0.network_interface.0.ipv4_netmask:          "24"
      clone.0.customize.0.timeout:                                   "10"
      clone.0.customize.0.windows_options.#:                         "1"
      clone.0.customize.0.windows_options.0.admin_password:          <sensitive>
      clone.0.customize.0.windows_options.0.auto_logon:              "true"
      clone.0.customize.0.windows_options.0.auto_logon_count:        "1"
      clone.0.customize.0.windows_options.0.computer_name:           "02-replicadc"
      clone.0.customize.0.windows_options.0.full_name:               "Administrator"
      clone.0.customize.0.windows_options.0.organization_name:       "Managed by Terraform"
      clone.0.customize.0.windows_options.0.run_once_command_list.#: "5"
      clone.0.customize.0.windows_options.0.run_once_command_list.0: "winrm quickconfig -force"
      clone.0.customize.0.windows_options.0.run_once_command_list.1: "winrm set winrm/config @{MaxEnvelopeSizekb=\"100000\"}"
      clone.0.customize.0.windows_options.0.run_once_command_list.2: "winrm set winrm/config/Service @{AllowUnencrypted=\"true\"}"
      clone.0.customize.0.windows_options.0.run_once_command_list.3: "winrm set winrm/config/Service/Auth @{Basic=\"true\"}"
      clone.0.customize.0.windows_options.0.run_once_command_list.4: "netsh advfirewall set allprofiles state off"
      clone.0.customize.0.windows_options.0.time_zone:               "85"
      clone.0.template_uuid:                                         "422e95b1-dfe9-25cd-b223-c87077093ae9"
      clone.0.timeout:                                               "30"
      cpu_limit:                                                     "-1"
      cpu_share_count:                                               <computed>
      cpu_share_level:                                               "normal"
      datastore_cluster_id:                                          "group-p289"
      datastore_id:                                                  <computed>
      default_ip_address:                                            <computed>
      disk.#:                                                        "1"
      disk.0.attach:                                                 "false"
      disk.0.datastore_id:                                           "<computed>"
      disk.0.device_address:                                         <computed>
      disk.0.disk_mode:                                              "persistent"
      disk.0.disk_sharing:                                           "sharingNone"
      disk.0.eagerly_scrub:                                          "false"
      disk.0.io_limit:                                               "-1"
      disk.0.io_reservation:                                         "0"
      disk.0.io_share_count:                                         "0"
      disk.0.io_share_level:                                         "normal"
      disk.0.keep_on_remove:                                         "false"
      disk.0.key:                                                    "0"
      disk.0.label:                                                  "disk0"
      disk.0.path:                                                   <computed>
      disk.0.size:                                                   "32"
      disk.0.thin_provisioned:                                       "true"
      disk.0.unit_number:                                            "0"
      disk.0.uuid:                                                   <computed>
      disk.0.write_through:                                          "false"
      ept_rvi_mode:                                                  "automatic"
      firmware:                                                      "bios"
      folder:                                                        "Teslya/mcsa"
      force_power_off:                                               "true"
      guest_id:                                                      "windows9Server64Guest"
      guest_ip_addresses.#:                                          <computed>
      host_system_id:                                                <computed>
      hv_mode:                                                       "hvAuto"
      imported:                                                      <computed>
      latency_sensitivity:                                           "normal"
      memory:                                                        "8192"
      memory_limit:                                                  "-1"
      memory_share_count:                                            <computed>
      memory_share_level:                                            "normal"
      migrate_wait_timeout:                                          "30"
      moid:                                                          <computed>
      name:                                                          "02-replicadc"
      network_interface.#:                                           "1"
      network_interface.0.adapter_type:                              "vmxnet3"
      network_interface.0.bandwidth_limit:                           "-1"
      network_interface.0.bandwidth_reservation:                     "0"
      network_interface.0.bandwidth_share_count:                     <computed>
      network_interface.0.bandwidth_share_level:                     "normal"
      network_interface.0.device_address:                            <computed>
      network_interface.0.key:                                       <computed>
      network_interface.0.mac_address:                               <computed>
      network_interface.0.network_id:                                "dvportgroup-262"
      num_cores_per_socket:                                          "1"
      num_cpus:                                                      "4"
      reboot_required:                                               <computed>
      resource_pool_id:                                              "resgroup-62"
      run_tools_scripts_after_power_on:                              "true"
      run_tools_scripts_after_resume:                                "true"
      run_tools_scripts_before_guest_shutdown:                       "true"
      run_tools_scripts_before_guest_standby:                        "true"
      scsi_bus_sharing:                                              "noSharing"
      scsi_controller_count:                                         "1"
      scsi_type:                                                     "lsilogic-sas"
      shutdown_wait_timeout:                                         "3"
      swap_placement_policy:                                         "inherit"
      uuid:                                                          <computed>
      vapp_transport.#:                                              <computed>
      vmware_tools_status:                                           <computed>
      vmx_path:                                                      <computed>
      wait_for_guest_net_routable:                                   "true"
      wait_for_guest_net_timeout:                                    "5"

  + vsphere_virtual_machine.03-FileServer
      id:                                                            <computed>
      boot_retry_delay:                                              "10000"
      change_version:                                                <computed>
      clone.#:                                                       "1"
      clone.0.customize.#:                                           "1"
      clone.0.customize.0.ipv4_gateway:                              "10.5.202.1"
      clone.0.customize.0.network_interface.#:                       "1"
      clone.0.customize.0.network_interface.0.dns_server_list.#:     "1"
      clone.0.customize.0.network_interface.0.dns_server_list.0:     "10.5.202.3"
      clone.0.customize.0.network_interface.0.ipv4_address:          "10.5.202.6"
      clone.0.customize.0.network_interface.0.ipv4_netmask:          "24"
      clone.0.customize.0.timeout:                                   "10"
      clone.0.customize.0.windows_options.#:                         "1"
      clone.0.customize.0.windows_options.0.admin_password:          <sensitive>
      clone.0.customize.0.windows_options.0.auto_logon:              "true"
      clone.0.customize.0.windows_options.0.auto_logon_count:        "1"
      clone.0.customize.0.windows_options.0.computer_name:           "03-fileserver"
      clone.0.customize.0.windows_options.0.full_name:               "Administrator"
      clone.0.customize.0.windows_options.0.organization_name:       "Managed by Terraform"
      clone.0.customize.0.windows_options.0.run_once_command_list.#: "5"
      clone.0.customize.0.windows_options.0.run_once_command_list.0: "winrm quickconfig -force"
      clone.0.customize.0.windows_options.0.run_once_command_list.1: "winrm set winrm/config @{MaxEnvelopeSizekb=\"100000\"}"
      clone.0.customize.0.windows_options.0.run_once_command_list.2: "winrm set winrm/config/Service @{AllowUnencrypted=\"true\"}"
      clone.0.customize.0.windows_options.0.run_once_command_list.3: "winrm set winrm/config/Service/Auth @{Basic=\"true\"}"
      clone.0.customize.0.windows_options.0.run_once_command_list.4: "netsh advfirewall set allprofiles state off"
      clone.0.customize.0.windows_options.0.time_zone:               "85"
      clone.0.template_uuid:                                         "422e95b1-dfe9-25cd-b223-c87077093ae9"
      clone.0.timeout:                                               "30"
      cpu_limit:                                                     "-1"
      cpu_share_count:                                               <computed>
      cpu_share_level:                                               "normal"
      datastore_cluster_id:                                          "group-p289"
      datastore_id:                                                  <computed>
      default_ip_address:                                            <computed>
      disk.#:                                                        "1"
      disk.0.attach:                                                 "false"
      disk.0.datastore_id:                                           "<computed>"
      disk.0.device_address:                                         <computed>
      disk.0.disk_mode:                                              "persistent"
      disk.0.disk_sharing:                                           "sharingNone"
      disk.0.eagerly_scrub:                                          "false"
      disk.0.io_limit:                                               "-1"
      disk.0.io_reservation:                                         "0"
      disk.0.io_share_count:                                         "0"
      disk.0.io_share_level:                                         "normal"
      disk.0.keep_on_remove:                                         "false"
      disk.0.key:                                                    "0"
      disk.0.label:                                                  "disk0"
      disk.0.path:                                                   <computed>
      disk.0.size:                                                   "32"
      disk.0.thin_provisioned:                                       "true"
      disk.0.unit_number:                                            "0"
      disk.0.uuid:                                                   <computed>
      disk.0.write_through:                                          "false"
      ept_rvi_mode:                                                  "automatic"
      firmware:                                                      "bios"
      folder:                                                        "Teslya/mcsa"
      force_power_off:                                               "true"
      guest_id:                                                      "windows9Server64Guest"
      guest_ip_addresses.#:                                          <computed>
      host_system_id:                                                <computed>
      hv_mode:                                                       "hvAuto"
      imported:                                                      <computed>
      latency_sensitivity:                                           "normal"
      memory:                                                        "8192"
      memory_limit:                                                  "-1"
      memory_share_count:                                            <computed>
      memory_share_level:                                            "normal"
      migrate_wait_timeout:                                          "30"
      moid:                                                          <computed>
      name:                                                          "03-fileserver"
      network_interface.#:                                           "1"
      network_interface.0.adapter_type:                              "vmxnet3"
      network_interface.0.bandwidth_limit:                           "-1"
      network_interface.0.bandwidth_reservation:                     "0"
      network_interface.0.bandwidth_share_count:                     <computed>
      network_interface.0.bandwidth_share_level:                     "normal"
      network_interface.0.device_address:                            <computed>
      network_interface.0.key:                                       <computed>
      network_interface.0.mac_address:                               <computed>
      network_interface.0.network_id:                                "dvportgroup-262"
      num_cores_per_socket:                                          "1"
      num_cpus:                                                      "4"
      reboot_required:                                               <computed>
      resource_pool_id:                                              "resgroup-62"
      run_tools_scripts_after_power_on:                              "true"
      run_tools_scripts_after_resume:                                "true"
      run_tools_scripts_before_guest_shutdown:                       "true"
      run_tools_scripts_before_guest_standby:                        "true"
      scsi_bus_sharing:                                              "noSharing"
      scsi_controller_count:                                         "1"
      scsi_type:                                                     "lsilogic-sas"
      shutdown_wait_timeout:                                         "3"
      swap_placement_policy:                                         "inherit"
      uuid:                                                          <computed>
      vapp_transport.#:                                              <computed>
      vmware_tools_status:                                           <computed>
      vmx_path:                                                      <computed>
      wait_for_guest_net_routable:                                   "true"
      wait_for_guest_net_timeout:                                    "5"


Plan: 3 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

vsphere_virtual_machine.02-ReplicaDC: Creating...
  boot_retry_delay:                                              "" => "10000"
  change_version:                                                "" => "<computed>"
  clone.#:                                                       "" => "1"
  clone.0.customize.#:                                           "" => "1"
  clone.0.customize.0.ipv4_gateway:                              "" => "10.5.202.1"
  clone.0.customize.0.network_interface.#:                       "" => "1"
  clone.0.customize.0.network_interface.0.dns_server_list.#:     "" => "1"
  clone.0.customize.0.network_interface.0.dns_server_list.0:     "" => "10.5.202.3"
  clone.0.customize.0.network_interface.0.ipv4_address:          "" => "10.5.202.5"
  clone.0.customize.0.network_interface.0.ipv4_netmask:          "" => "24"
  clone.0.customize.0.timeout:                                   "" => "10"
  clone.0.customize.0.windows_options.#:                         "" => "1"
  clone.0.customize.0.windows_options.0.admin_password:          "<sensitive>" => "<sensitive>"
  clone.0.customize.0.windows_options.0.auto_logon:              "" => "true"
  clone.0.customize.0.windows_options.0.auto_logon_count:        "" => "1"
  clone.0.customize.0.windows_options.0.computer_name:           "" => "02-replicadc"
  clone.0.customize.0.windows_options.0.full_name:               "" => "Administrator"
  clone.0.customize.0.windows_options.0.organization_name:       "" => "Managed by Terraform"
  clone.0.customize.0.windows_options.0.run_once_command_list.#: "" => "5"
  clone.0.customize.0.windows_options.0.run_once_command_list.0: "" => "winrm quickconfig -force"
  clone.0.customize.0.windows_options.0.run_once_command_list.1: "" => "winrm set winrm/config @{MaxEnvelopeSizekb=\"100000\"}"
  clone.0.customize.0.windows_options.0.run_once_command_list.2: "" => "winrm set winrm/config/Service @{AllowUnencrypted=\"true\"}"
  clone.0.customize.0.windows_options.0.run_once_command_list.3: "" => "winrm set winrm/config/Service/Auth @{Basic=\"true\"}"
  clone.0.customize.0.windows_options.0.run_once_command_list.4: "" => "netsh advfirewall set allprofiles state off"
  clone.0.customize.0.windows_options.0.time_zone:               "" => "85"
  clone.0.template_uuid:                                         "" => "422e95b1-dfe9-25cd-b223-c87077093ae9"
  clone.0.timeout:                                               "" => "30"
  cpu_limit:                                                     "" => "-1"
  cpu_share_count:                                               "" => "<computed>"
  cpu_share_level:                                               "" => "normal"
  datastore_cluster_id:                                          "" => "group-p289"
  datastore_id:                                                  "" => "<computed>"
  default_ip_address:                                            "" => "<computed>"
  disk.#:                                                        "" => "1"
  disk.0.attach:                                                 "" => "false"
  disk.0.datastore_id:                                           "" => "<computed>"
  disk.0.device_address:                                         "" => "<computed>"
  disk.0.disk_mode:                                              "" => "persistent"
  disk.0.disk_sharing:                                           "" => "sharingNone"
  disk.0.eagerly_scrub:                                          "" => "false"
  disk.0.io_limit:                                               "" => "-1"
  disk.0.io_reservation:                                         "" => "0"
  disk.0.io_share_count:                                         "" => "0"
  disk.0.io_share_level:                                         "" => "normal"
  disk.0.keep_on_remove:                                         "" => "false"
  disk.0.key:                                                    "" => "0"
  disk.0.label:                                                  "" => "disk0"
  disk.0.path:                                                   "" => "<computed>"
  disk.0.size:                                                   "" => "32"
  disk.0.thin_provisioned:                                       "" => "true"
  disk.0.unit_number:                                            "" => "0"
  disk.0.uuid:                                                   "" => "<computed>"
  disk.0.write_through:                                          "" => "false"
  ept_rvi_mode:                                                  "" => "automatic"
  firmware:                                                      "" => "bios"
  folder:                                                        "" => "Teslya/mcsa"
  force_power_off:                                               "" => "true"
  guest_id:                                                      "" => "windows9Server64Guest"
  guest_ip_addresses.#:                                          "" => "<computed>"
  host_system_id:                                                "" => "<computed>"
  hv_mode:                                                       "" => "hvAuto"
  imported:                                                      "" => "<computed>"
  latency_sensitivity:                                           "" => "normal"
  memory:                                                        "" => "8192"
  memory_limit:                                                  "" => "-1"
  memory_share_count:                                            "" => "<computed>"
  memory_share_level:                                            "" => "normal"
  migrate_wait_timeout:                                          "" => "30"
  moid:                                                          "" => "<computed>"
  name:                                                          "" => "02-replicadc"
  network_interface.#:                                           "" => "1"
  network_interface.0.adapter_type:                              "" => "vmxnet3"
  network_interface.0.bandwidth_limit:                           "" => "-1"
  network_interface.0.bandwidth_reservation:                     "" => "0"
  network_interface.0.bandwidth_share_count:                     "" => "<computed>"
  network_interface.0.bandwidth_share_level:                     "" => "normal"
  network_interface.0.device_address:                            "" => "<computed>"
  network_interface.0.key:                                       "" => "<computed>"
  network_interface.0.mac_address:                               "" => "<computed>"
  network_interface.0.network_id:                                "" => "dvportgroup-262"
  num_cores_per_socket:                                          "" => "1"
  num_cpus:                                                      "" => "4"
  reboot_required:                                               "" => "<computed>"
  resource_pool_id:                                              "" => "resgroup-62"
  run_tools_scripts_after_power_on:                              "" => "true"
  run_tools_scripts_after_resume:                                "" => "true"
  run_tools_scripts_before_guest_shutdown:                       "" => "true"
  run_tools_scripts_before_guest_standby:                        "" => "true"
  scsi_bus_sharing:                                              "" => "noSharing"
  scsi_controller_count:                                         "" => "1"
  scsi_type:                                                     "" => "lsilogic-sas"
  shutdown_wait_timeout:                                         "" => "3"
  swap_placement_policy:                                         "" => "inherit"
  uuid:                                                          "" => "<computed>"
  vapp_transport.#:                                              "" => "<computed>"
  vmware_tools_status:                                           "" => "<computed>"
  vmx_path:                                                      "" => "<computed>"
  wait_for_guest_net_routable:                                   "" => "true"
  wait_for_guest_net_timeout:                                    "" => "5"
vsphere_virtual_machine.01-PDC: Creating...
  boot_retry_delay:                                              "" => "10000"
  change_version:                                                "" => "<computed>"
  clone.#:                                                       "" => "1"
  clone.0.customize.#:                                           "" => "1"
  clone.0.customize.0.ipv4_gateway:                              "" => "10.5.202.1"
  clone.0.customize.0.network_interface.#:                       "" => "1"
  clone.0.customize.0.network_interface.0.dns_server_list.#:     "" => "1"
  clone.0.customize.0.network_interface.0.dns_server_list.0:     "" => "10.5.202.3"
  clone.0.customize.0.network_interface.0.ipv4_address:          "" => "10.5.202.4"
  clone.0.customize.0.network_interface.0.ipv4_netmask:          "" => "24"
  clone.0.customize.0.timeout:                                   "" => "10"
  clone.0.customize.0.windows_options.#:                         "" => "1"
  clone.0.customize.0.windows_options.0.admin_password:          "<sensitive>" => "<sensitive>"
  clone.0.customize.0.windows_options.0.auto_logon:              "" => "true"
  clone.0.customize.0.windows_options.0.auto_logon_count:        "" => "1"
  clone.0.customize.0.windows_options.0.computer_name:           "" => "01-pdc"
  clone.0.customize.0.windows_options.0.full_name:               "" => "Administrator"
  clone.0.customize.0.windows_options.0.organization_name:       "" => "Managed by Terraform"
  clone.0.customize.0.windows_options.0.run_once_command_list.#: "" => "5"
  clone.0.customize.0.windows_options.0.run_once_command_list.0: "" => "winrm quickconfig -force"
  clone.0.customize.0.windows_options.0.run_once_command_list.1: "" => "winrm set winrm/config @{MaxEnvelopeSizekb=\"100000\"}"
  clone.0.customize.0.windows_options.0.run_once_command_list.2: "" => "winrm set winrm/config/Service @{AllowUnencrypted=\"true\"}"
  clone.0.customize.0.windows_options.0.run_once_command_list.3: "" => "winrm set winrm/config/Service/Auth @{Basic=\"true\"}"
  clone.0.customize.0.windows_options.0.run_once_command_list.4: "" => "netsh advfirewall set allprofiles state off"
  clone.0.customize.0.windows_options.0.time_zone:               "" => "85"
  clone.0.template_uuid:                                         "" => "422e95b1-dfe9-25cd-b223-c87077093ae9"
  clone.0.timeout:                                               "" => "30"
  cpu_limit:                                                     "" => "-1"
  cpu_share_count:                                               "" => "<computed>"
  cpu_share_level:                                               "" => "normal"
  datastore_cluster_id:                                          "" => "group-p289"
  datastore_id:                                                  "" => "<computed>"
  default_ip_address:                                            "" => "<computed>"
  disk.#:                                                        "" => "1"
  disk.0.attach:                                                 "" => "false"
  disk.0.datastore_id:                                           "" => "<computed>"
  disk.0.device_address:                                         "" => "<computed>"
  disk.0.disk_mode:                                              "" => "persistent"
  disk.0.disk_sharing:                                           "" => "sharingNone"
  disk.0.eagerly_scrub:                                          "" => "false"
  disk.0.io_limit:                                               "" => "-1"
  disk.0.io_reservation:                                         "" => "0"
  disk.0.io_share_count:                                         "" => "0"
  disk.0.io_share_level:                                         "" => "normal"
  disk.0.keep_on_remove:                                         "" => "false"
  disk.0.key:                                                    "" => "0"
  disk.0.label:                                                  "" => "disk0"
  disk.0.path:                                                   "" => "<computed>"
  disk.0.size:                                                   "" => "32"
  disk.0.thin_provisioned:                                       "" => "true"
  disk.0.unit_number:                                            "" => "0"
  disk.0.uuid:                                                   "" => "<computed>"
  disk.0.write_through:                                          "" => "false"
  ept_rvi_mode:                                                  "" => "automatic"
  firmware:                                                      "" => "bios"
  folder:                                                        "" => "Teslya/mcsa"
  force_power_off:                                               "" => "true"
  guest_id:                                                      "" => "windows9Server64Guest"
  guest_ip_addresses.#:                                          "" => "<computed>"
  host_system_id:                                                "" => "<computed>"
  hv_mode:                                                       "" => "hvAuto"
  imported:                                                      "" => "<computed>"
  latency_sensitivity:                                           "" => "normal"
  memory:                                                        "" => "8192"
  memory_limit:                                                  "" => "-1"
  memory_share_count:                                            "" => "<computed>"
  memory_share_level:                                            "" => "normal"
  migrate_wait_timeout:                                          "" => "30"
  moid:                                                          "" => "<computed>"
  name:                                                          "" => "01-pdc"
  network_interface.#:                                           "" => "1"
  network_interface.0.adapter_type:                              "" => "vmxnet3"
  network_interface.0.bandwidth_limit:                           "" => "-1"
  network_interface.0.bandwidth_reservation:                     "" => "0"
  network_interface.0.bandwidth_share_count:                     "" => "<computed>"
  network_interface.0.bandwidth_share_level:                     "" => "normal"
  network_interface.0.device_address:                            "" => "<computed>"
  network_interface.0.key:                                       "" => "<computed>"
  network_interface.0.mac_address:                               "" => "<computed>"
  network_interface.0.network_id:                                "" => "dvportgroup-262"
  num_cores_per_socket:                                          "" => "1"
  num_cpus:                                                      "" => "4"
  reboot_required:                                               "" => "<computed>"
  resource_pool_id:                                              "" => "resgroup-62"
  run_tools_scripts_after_power_on:                              "" => "true"
  run_tools_scripts_after_resume:                                "" => "true"
  run_tools_scripts_before_guest_shutdown:                       "" => "true"
  run_tools_scripts_before_guest_standby:                        "" => "true"
  scsi_bus_sharing:                                              "" => "noSharing"
  scsi_controller_count:                                         "" => "1"
  scsi_type:                                                     "" => "lsilogic-sas"
  shutdown_wait_timeout:                                         "" => "3"
  swap_placement_policy:                                         "" => "inherit"
  uuid:                                                          "" => "<computed>"
  vapp_transport.#:                                              "" => "<computed>"
  vmware_tools_status:                                           "" => "<computed>"
  vmx_path:                                                      "" => "<computed>"
  wait_for_guest_net_routable:                                   "" => "true"
  wait_for_guest_net_timeout:                                    "" => "5"
vsphere_virtual_machine.03-FileServer: Creating...
  boot_retry_delay:                                              "" => "10000"
  change_version:                                                "" => "<computed>"
  clone.#:                                                       "" => "1"
  clone.0.customize.#:                                           "" => "1"
  clone.0.customize.0.ipv4_gateway:                              "" => "10.5.202.1"
  clone.0.customize.0.network_interface.#:                       "" => "1"
  clone.0.customize.0.network_interface.0.dns_server_list.#:     "" => "1"
  clone.0.customize.0.network_interface.0.dns_server_list.0:     "" => "10.5.202.3"
  clone.0.customize.0.network_interface.0.ipv4_address:          "" => "10.5.202.6"
  clone.0.customize.0.network_interface.0.ipv4_netmask:          "" => "24"
  clone.0.customize.0.timeout:                                   "" => "10"
  clone.0.customize.0.windows_options.#:                         "" => "1"
  clone.0.customize.0.windows_options.0.admin_password:          "<sensitive>" => "<sensitive>"
  clone.0.customize.0.windows_options.0.auto_logon:              "" => "true"
  clone.0.customize.0.windows_options.0.auto_logon_count:        "" => "1"
  clone.0.customize.0.windows_options.0.computer_name:           "" => "03-fileserver"
  clone.0.customize.0.windows_options.0.full_name:               "" => "Administrator"
  clone.0.customize.0.windows_options.0.organization_name:       "" => "Managed by Terraform"
  clone.0.customize.0.windows_options.0.run_once_command_list.#: "" => "5"
  clone.0.customize.0.windows_options.0.run_once_command_list.0: "" => "winrm quickconfig -force"
  clone.0.customize.0.windows_options.0.run_once_command_list.1: "" => "winrm set winrm/config @{MaxEnvelopeSizekb=\"100000\"}"
  clone.0.customize.0.windows_options.0.run_once_command_list.2: "" => "winrm set winrm/config/Service @{AllowUnencrypted=\"true\"}"
  clone.0.customize.0.windows_options.0.run_once_command_list.3: "" => "winrm set winrm/config/Service/Auth @{Basic=\"true\"}"
  clone.0.customize.0.windows_options.0.run_once_command_list.4: "" => "netsh advfirewall set allprofiles state off"
  clone.0.customize.0.windows_options.0.time_zone:               "" => "85"
  clone.0.template_uuid:                                         "" => "422e95b1-dfe9-25cd-b223-c87077093ae9"
  clone.0.timeout:                                               "" => "30"
  cpu_limit:                                                     "" => "-1"
  cpu_share_count:                                               "" => "<computed>"
  cpu_share_level:                                               "" => "normal"
  datastore_cluster_id:                                          "" => "group-p289"
  datastore_id:                                                  "" => "<computed>"
  default_ip_address:                                            "" => "<computed>"
  disk.#:                                                        "" => "1"
  disk.0.attach:                                                 "" => "false"
  disk.0.datastore_id:                                           "" => "<computed>"
  disk.0.device_address:                                         "" => "<computed>"
  disk.0.disk_mode:                                              "" => "persistent"
  disk.0.disk_sharing:                                           "" => "sharingNone"
  disk.0.eagerly_scrub:                                          "" => "false"
  disk.0.io_limit:                                               "" => "-1"
  disk.0.io_reservation:                                         "" => "0"
  disk.0.io_share_count:                                         "" => "0"
  disk.0.io_share_level:                                         "" => "normal"
  disk.0.keep_on_remove:                                         "" => "false"
  disk.0.key:                                                    "" => "0"
  disk.0.label:                                                  "" => "disk0"
  disk.0.path:                                                   "" => "<computed>"
  disk.0.size:                                                   "" => "32"
  disk.0.thin_provisioned:                                       "" => "true"
  disk.0.unit_number:                                            "" => "0"
  disk.0.uuid:                                                   "" => "<computed>"
  disk.0.write_through:                                          "" => "false"
  ept_rvi_mode:                                                  "" => "automatic"
  firmware:                                                      "" => "bios"
  folder:                                                        "" => "Teslya/mcsa"
  force_power_off:                                               "" => "true"
  guest_id:                                                      "" => "windows9Server64Guest"
  guest_ip_addresses.#:                                          "" => "<computed>"
  host_system_id:                                                "" => "<computed>"
  hv_mode:                                                       "" => "hvAuto"
  imported:                                                      "" => "<computed>"
  latency_sensitivity:                                           "" => "normal"
  memory:                                                        "" => "8192"
  memory_limit:                                                  "" => "-1"
  memory_share_count:                                            "" => "<computed>"
  memory_share_level:                                            "" => "normal"
  migrate_wait_timeout:                                          "" => "30"
  moid:                                                          "" => "<computed>"
  name:                                                          "" => "03-fileserver"
  network_interface.#:                                           "" => "1"
  network_interface.0.adapter_type:                              "" => "vmxnet3"
  network_interface.0.bandwidth_limit:                           "" => "-1"
  network_interface.0.bandwidth_reservation:                     "" => "0"
  network_interface.0.bandwidth_share_count:                     "" => "<computed>"
  network_interface.0.bandwidth_share_level:                     "" => "normal"
  network_interface.0.device_address:                            "" => "<computed>"
  network_interface.0.key:                                       "" => "<computed>"
  network_interface.0.mac_address:                               "" => "<computed>"
  network_interface.0.network_id:                                "" => "dvportgroup-262"
  num_cores_per_socket:                                          "" => "1"
  num_cpus:                                                      "" => "4"
  reboot_required:                                               "" => "<computed>"
  resource_pool_id:                                              "" => "resgroup-62"
  run_tools_scripts_after_power_on:                              "" => "true"
  run_tools_scripts_after_resume:                                "" => "true"
  run_tools_scripts_before_guest_shutdown:                       "" => "true"
  run_tools_scripts_before_guest_standby:                        "" => "true"
  scsi_bus_sharing:                                              "" => "noSharing"
  scsi_controller_count:                                         "" => "1"
  scsi_type:                                                     "" => "lsilogic-sas"
  shutdown_wait_timeout:                                         "" => "3"
  swap_placement_policy:                                         "" => "inherit"
  uuid:                                                          "" => "<computed>"
  vapp_transport.#:                                              "" => "<computed>"
  vmware_tools_status:                                           "" => "<computed>"
  vmx_path:                                                      "" => "<computed>"
  wait_for_guest_net_routable:                                   "" => "true"
  wait_for_guest_net_timeout:                                    "" => "5"
vsphere_virtual_machine.02-ReplicaDC: Still creating... (10s elapsed)
vsphere_virtual_machine.01-PDC: Still creating... (10s elapsed)
vsphere_virtual_machine.03-FileServer: Still creating... (10s elapsed)
...
vsphere_virtual_machine.02-ReplicaDC: Still creating... (7m50s elapsed)
vsphere_virtual_machine.01-PDC: Still creating... (7m50s elapsed)
vsphere_virtual_machine.03-FileServer: Still creating... (7m50s elapsed)
vsphere_virtual_machine.01-PDC: Creation complete after 7m51s (ID: 422e621f-dcb4-d8c6-f5d1-865d1b06521a)
vsphere_virtual_machine.02-ReplicaDC: Still creating... (8m0s elapsed)
vsphere_virtual_machine.03-FileServer: Still creating... (8m0s elapsed)
vsphere_virtual_machine.02-ReplicaDC: Still creating... (8m10s elapsed)
vsphere_virtual_machine.03-FileServer: Still creating... (8m10s elapsed)
vsphere_virtual_machine.02-ReplicaDC: Still creating... (8m20s elapsed)
vsphere_virtual_machine.03-FileServer: Still creating... (8m20s elapsed)
vsphere_virtual_machine.02-ReplicaDC: Creation complete after 8m23s (ID: 422e7b9f-34fd-f513-4bce-df84a85c812a)
vsphere_virtual_machine.03-FileServer: Still creating... (8m30s elapsed)
vsphere_virtual_machine.03-FileServer: Creation complete after 8m32s (ID: 422e8ef8-63c1-6c91-8df7-877c6a1f91c6)

Apply complete! Resources: 3 added, 0 changed, 0 destroyed.
```

As you can see 3 VMs were successfully created during the `terraform apply` run. If you need to change something in the VMs configuration, for example add some RAM or CPU, you can run `terraform apply` once again. If you're done with your lab and want to delete the VMs, you can run `terraform destroy`.

One important note here. As you may have noticed there is a `customize` section in VMs configurations. This is actually [guest customization](https://docs.vmware.com/en/VMware-vSphere/6.5/com.vmware.vsphere.vm_admin.doc/GUID-F3E382AB-72F6-498A-BD26-7EC0BFE320A0.html) which can be done manually in vSphere when deploying a new VM from a template. During this process Windows is [sysprepped](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/sysprep-process-overview) and that is why I have to set an administrator password and configure WinRM the second time (first time it was done during the template creation).

## Conclusion
Now you can create and destroy VMs with one command which is very handy when you need to setup an ad-hoc lab. In the next post I will cover how to configure Windows with Ansible and perform such tasks as installing roles and services and creating and joining a domain.

##  References and further reading
1. [Running Terraform in Automation](https://learn.hashicorp.com/terraform/development/running-terraform-in-automation)
2. [An Introduction to Terraform](https://blog.gruntwork.io/an-introduction-to-terraform-f17df9c6d180)
3. [Datanauts 137: Automating Infrastructure As Code With Terraform](https://packetpushers.net/podcast/datanauts-137-automating-infrastructure-code-terraform/)
4. [Sysprep and VMware Guest Customization with Terraform](https://www.virtualizationhowto.com/2018/06/sysprep-and-vmware-guest-customization-with-terraform/)