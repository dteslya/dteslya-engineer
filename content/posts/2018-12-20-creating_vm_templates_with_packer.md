---
title:  "Automate Windows VM Creation and Configuration in vSphere Using Packer, Terraform and Ansible (Part 1 of 3)"
description: "This is the first part of a series of tutorials about Packer, Terraform and Ansible and how to use those tools to automatically create Windows VMs in VMware environment."
categories:
  - automation
  - tutorial
tags:
  - ansible
  - terraform
  - packer
  - vmware
  - windows
date: "2018-12-20"
author: "dteslya"
toc: true
url: automation/2018-12-20-creating_vm_templates_with_packer/
maxWidthTitle: "max-w-4xl"
maxWidthContent: "max-w-4xl"
feature: "images/packer_terraform_feature_1.png"
---
In this series of posts I'd like to show how to automate the process of setting up virtual infrastructure consisting of several Windows Server 2016 machines. Most articles I've come across cover the use of cloud providers (e.g. AWS) as a virtualization platform, so I decided to make a write up about my experience with VMware vSphere.
The whole process can be devided in three stages:
1. Prepare VM template
2. Deploy the desired number of VMs using template from the previous step
3. Configure those VMs with Ansible

All the scripts and configurations I use in this series of articles are available at my [GitHub repository](https://github.com/dteslya/win-iac-lab).

In this post I will cover the first stage, i.e. VM template creation.

## Creating VM template using Packer
As stated on the official [Packer](https://www.packer.io/intro/index.html) page
>Packer is an open source tool for creating identical machine images for multiple platforms from a single source configuration. 

### Choosing the right builder
Packer uses builder plugins to actually build images. There are two builders for VMware available out of the box: `vmware-iso` and `vmware-vmx`. The latter uses existing VMs to create images, so it doesn't fit in my concept of building everything from scratch.
`vmware-iso` however starts from ISO file and creates brand new VM. But to use `vmware-iso` builder remotely on VMware vSphere hypervisor you need to modify your ESXi host to allow SSH access, because `vmware-iso` uses SSH instead of API to talk to VMware hypervisor. Looks pretty much like a dirty hack to me, not to mention that I don't have enough privileges to make such modifications to ESXi hosts in my environment.

Fortunately there is a third-party builder by [JetBrains](https://github.com/jetbrains-infra) called `vsphere-iso` which does pretty much the same as `vmware-iso` but using vCenter API instead of SSH (they also have a `vshpere-clone` builder as a `vmware-vmx` alternative).

### Setting up Packer
First you need to install Packer on your workstation. I use Ubuntu, but the installation process is fairly similar on all supported OSes. There are no packages of Packer for Ubuntu, but it can be installed as a precompiled binary very easily.

Just [download](https://www.packer.io/downloads.html) the appropriate package, unzip Packer binary and place it somewhere on your $PATH. I use `~/bin` for this purpose. You can read about other installation options on the [official guide](https://www.packer.io/intro/getting-started/install.html).

To install `vpshere-iso` plugin download its binary from the [releases page](https://github.com/jetbrains-infra/packer-builder-vsphere/releases) and put it in the same directory where you put `packer` binary. In my case it is `~/bin`.

### Build process overview
After you clone my [Github repo](https://github.com/dteslya/win-iac-lab) and tweak the config files in accrordance with your environment all you need to do is run this command:
```bash
$ packer build -var-file=vars.json windows-server-2016.json
```
This tells `packer` to do the following:
1. Connect to vSphere and create virtual machine
2. Mount ISO images specified in json file
3. Create floppy disk and put files from `setup` dir on it
4. Mount floppy disk
5. Power on VM and wait for it to get an IP address
    * When VM is powered on it boots from the first ISO which is Windows installation disk
    * Windows setup reads `autounattend.xml` from floppy drive
    * `autounattend.xml` runs `vmtools.cmd` batch script during the "specialize" pass
    * `autounattend.xml` runs `setup.ps1` Powershell script after the first autologon
    * `autounattend.xml` sets local administrator user and password which are later used by `packer` to connect to Windows via WinRM
6. Connect to Windows via WinRM
7. Run provisioning script (in my case it just lists files on C: drive)
8. Shut down VM and convert it to VM template

Now lets take a look at each config file in more detail.

### Preparing necessary files
I don't present complete file listings here assuming that you just clone my git repo and work with prepared files.  
You can do it by issuing this command:
```bash
$ git clone https://github.com/dteslya/win-iac-lab
```  

This repo contains configs for Packer, Terraform and Ansible and since this article's focus is Packer let's take a look at `packer` directory structure.
```bash
.
├── setup
│   ├── autounattend.xml
│   ├── setup.ps1
│   └── vmtools.cmd
├── vars.json.example
└── windows-server-2016.json
```
Each file's description is listed below.

#### vars.json.example
I try to use variables for everything and put actual values in a separate file. This file is just an example and you should rename it to `vars.json` and change all the values according to your environment.

#### windows-server-2016.json
This is the main configuration file for `packer`. The first section just declares all the variables and marks `vsphere_password` and `winadmin_password` as sensitive so that their values are not echoed during the build run.  
Next section called `builders` tells `vpshere-iso` how to connect to vSphere and where to put the VM template.
```json
      "communicator": "winrm",
      "winrm_username": "Administrator",
      "winrm_password": "{{user `winadmin_password`}}",
```
This section is crucial as it tells packer how to connect to the guest OS. This username and password are set during the Windows setup (see [autounattend.xml](#autounattendxml)).
```json
      "iso_paths": [
        "{{user `os_iso_path`}}",
        "{{user `vmtools_iso_path`}}"
      ],
```
Here you point to Windows ISO file and VMware tools ISO which will be presented to guest OS as CDROM drives. Guest OS will mount this ISOs exactly in that order (Windows ISO as "D:", vmtools as "E:"). This is important because other scripts refer to particular Windows drive letters.
```json
      "floppy_files": [
        "setup/autounattend.xml",
        "setup/setup.ps1",
        "setup/vmtools.cmd"
      ]
```
This section tells `packer` to create a virtual floppy drive and put those files on it. More on that later.

#### autounattend.xml
This is the second most important file called answer file which allows to fully automate Windows installation. Windows setup reads this file either from installation media (ISO) or floppy drive automatically.  
You can create this file by yourself or use one from my repository. If you choose to make your own answer file I recommend to read [this article](https://www.derekseaman.com/2012/07/windows-server-2012-unattended.html) by Derek Seaman. Although it is focused on Windows Server 2012 it works for Windows 2016 too, except for this two details:
* Change image name to Windows Server 2016 SERVERSTANDARD
* Set first partition size to 500 (Default size with 2016)

In any case let's take a look at the important sections of this file.  
First section of interest is "specialize" pass:
```xml
    <settings pass="specialize">
        ...
            <RunSynchronous>
                <RunSynchronousCommand wcm:action="add">
                    <Path>a:\vmtools.cmd</Path>
                    <Order>1</Order>
                    <WillReboot>Always</WillReboot>
                </RunSynchronousCommand>
            </RunSynchronous>
        ...
    </settings>
```
It tells Windows setup to run [vmtools.cmd](#vmtoolscmd) batch script from virtual floppy drive.

Second section of interest is "oobeSystem" pass:
```xml
    <settings pass="oobeSystem">
        ...
            <AutoLogon>
                <Password>
                    <Value>S3cret!</Value>
                    <PlainText>true</PlainText>
                </Password>
                <LogonCount>2</LogonCount>
                <Username>Administrator</Username>
                <Enabled>true</Enabled>
            </AutoLogon>
            <FirstLogonCommands>
                <SynchronousCommand wcm:action="add">
                    <Order>1</Order>
                    <!-- Enable WinRM service -->
                    <CommandLine>powershell -ExecutionPolicy Bypass -File a:\setup.ps1</CommandLine>
                    <RequiresUserInput>true</RequiresUserInput>
                </SynchronousCommand>
            </FirstLogonCommands>
            <UserAccounts>
                <AdministratorPassword>
                    <Value>S3cret!</Value>
                    <PlainText>true</PlainText>
                </AdministratorPassword>
            </UserAccounts>
        ...
    </settings>
```
This section tells Windows setup to perform autologon using "Administrator" account which is also set in this section and run the [setup.ps1](#setupps1) powershell script.

#### setup.ps1
This script does three things.  
First, it changes Windows Firewall profile to private in order for Windows to accept incoming network connections.
```powershell
$profile = Get-NetConnectionProfile
Set-NetConnectionProfile -Name $profile.Name -NetworkCategory Private
```

Then it enables WinRM service for `packer` to be able to connect to Windows.
```powershell
winrm quickconfig -quiet
winrm set winrm/config/service '@{AllowUnencrypted="true"}'
winrm set winrm/config/service/auth '@{Basic="true"}'
```

And finally it resets autologon count to zero for obvious security reasons.
```powershell
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon' -Name AutoLogonCount -Value 0
```
#### vmtools.cmd
The sole perpose of this script is to install VMware tools. 
```powershell
e:\setup64 /s /v "/qb REBOOT=R"
```
[![vmtools.cmd](/images/2018-12-28-packer-02.png)](/images/2018-12-28-packer-02.png)

Please note the drive letter. It is E: because VMware tools ISO is listed after Windows ISO (which is D:) in [json file](#windows-server-2016json).

## Build process example
Now when you've got all files prepared you can actually try and call `packer` to build a VM template for you.

When you run `packer build -var-file=vars.json windows-server-2016.json` it will look something like this:
[![packer build run](/images/2018-12-28-packer-01.png)](/images/2018-12-28-packer-01.png)
As you can see it takes about 20 minutes to finish Windows setup and installation in my case.

## Conclusion
Now you have very basic but working configuration that lets you fully automate Windows Server 2016 build. There are a lot of things you can add and improve here. To name a few, you can automate Windows updates installation, pre-install software using [Chocolatey](https://chocolatey.org/), enable remote desktop and so on. I provided a couple of resources below which can serve as a good source of inspiration.

##  References and further reading
1. [Official Packer documentation](https://packer.io/docs/index.html)
1. [Packer Builder for VMware vSphere](https://github.com/jetbrains-infra/packer-builder-vsphere)
2. [Using Packer to create Windows images](https://www.bloggingforlogging.com/2017/11/23/using-packer-to-create-windows-images/) by Jordan Borean
3. [Big collection of Windows templates](https://github.com/StefanScherer/packer-windows) by Stefan Scherer on Github
