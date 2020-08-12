---
title:  "Automate Windows VM Creation and Configuration in vSphere Using Packer, Terraform and Ansible (Part 3 of 3)"
description: "In this final part of the series I show how to use Ansible to automate Windows VM provisioning."
categories:
  - automation
  - tutorial
tags:
  - ansible
  - terraform
  - packer
  - vmware
  - windows
date: "2019-02-19"
toc: true
aliases:
    - /automation/2019-02-19-configuring_vms_with_ansible/
maxWidthTitle: "max-w-4xl"
maxWidthContent: "max-w-4xl"
feature: "images/packer_terraform_feature_3.png"
---
This is the final entry in the series. In this post, I want to show how Ansible can be used to automate Windows VM provisioning. As always all the scripts and configurations are available at my [GitHub repository](https://github.com/dteslya/win-iac-lab).

## Provisioning with Ansible
Actually, Ansible was not my first choice when it came to VM provisioning. I've spent a lot of time with Chef at first because it was used in [this repo](https://github.com/SDBrett/mcsa_lab) which I took as a starting point. It almost worked for me but I've encountered a problem with a domain joining process. In order to join a domain the DNS server setting of the joining machine should be pointing to the domain controller. When the DNS server setting changed, the Chef client on that machine stopped resolving the Chef server and was unable to continue operation. Of course, I could fix it by adding necessary DNS entry on the server beforehand. Instead, I decided to try out Ansible which cannot run into such problems due to its agentless design.

### Setting up Ansible
- Install Ansible following [the official installation guide](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
- Install pywinrm library by issuing `pip install pywinrm`. Ansible uses this library to connect to Windows machines.
- Clone my [Github repo](https://github.com/dteslya/win-iac-lab) and `cd` to `ansible`
- Edit `inventory.yml` and `group_vars/all.yml` according to your environment

I use [Ansible Vault](https://docs.ansible.com/ansible/latest/user_guide/playbooks_vault.html) to store my credentials in `group_vars/all.yml` in encrypted form. To create your own encrypted passwords issue 
```bash
ansible-vault encrypt_string <string_to_encrypt>
```
command for each password you want to encrypt. It will ask you for the new vault password. Put that password in `.vault_pass` file in Ansible working directory.

### Configuration files
Ansible directory structure:
```bash
.
├── group_vars
│   └── all.yml
├── roles
│   ├── common
│   │   └── tasks
│   │       ├── enable_rdp.yml
│   │       └── main.yml
│   ├── fileserver
│   │   └── tasks
│   │       └── main.yml
│   ├── primary_domain_controller
│   │   └── tasks
│   │       └── main.yml
│   └── replica_domain_controller
│       └── tasks
│           └── main.yml
├── .vault_pass
├── ansible.cfg
├── inventory.yml
└── winlab.yml
```

### Executing playbooks
When you execute `ansible-playbook winlab.yml` Ansible reads `ansible.cfg` which points to inventory file and vault password file. 
```yaml
[defaults]
inventory = inventory.yml
vault_password_file = ./.vault_pass
```
Then it starts to apply roles from `winlab.yml`
```yaml
---
- hosts: primary_domain_controller
  roles:
    - primary_domain_controller
    - common

- hosts: replica_domain_controller
  roles:
    - replica_domain_controller
    - common

- hosts: fileserver
  roles:
    - fileserver
    - common
```
to hosts in `inventory.yml`.
```yaml
---
primary_domain_controller:
  hosts:
    10.5.202.4:
replica_domain_controller:
  hosts:
    10.5.202.5:
fileserver:
  hosts:
    10.5.202.6:
```

Primary domain controller (PDC) is configured by `roles/primary_domain_controller/tasks/main.yml`.

```yaml
---
- name: install ad
  win_domain:
    dns_domain_name: "{{ domain }}"
    domain_netbios_name: "{{ netbios_domain }}"
    safe_mode_password: "{{ domain_safemode_password }}"
  register: ad

- name: reboot server
  win_reboot:
    msg: "Installing AD. Rebooting..."
    pre_reboot_delay: 15
    reboot_timeout: 600
    post_reboot_delay: 420
  when: ad.changed
```

The `install ad` task installs the AD DS role on the server, creates a new forest and promotes the server to a domain controller. The `reboot server` reboots the server only if the status of the previous task returned "changed".

{{< alert message="`win_reboot` module doesn't have any reliable way to tell if the system is ready for management after the reboot. When Windows is rebooted after becoming a domain controller it takes a substantial amount of time to finish all the related tasks. To address this issue I specify the `post_reboot_delay` parameter. You may have to adjust it depending on your system's performance. Please refer to [official module documentation](https://docs.ansible.com/ansible/latest/modules/win_reboot_module.html) for further details." type="info" badge="Note" >}}

RDP is enabled on PDC by `roles/common/tasks/main.yml` which calls `roles/common/tasks/enable_rdp.yml`.

{{< alert message="This task is applied to all machines, so it is omitted hereafter." type="info" badge="Note" >}}

```yaml
- name: Windows | Check for xRemoteDesktopAdmin Powershell module
  win_psmodule:
    name: xRemoteDesktopAdmin
    state: present

- name: Windows | Enable Remote Desktop
  win_dsc:
    resource_name: xRemoteDesktopAdmin
    Ensure: present
    UserAuthentication: Secure

- name: Windows | Check for xNetworking Powershell module
  win_psmodule:
    name: xNetworking
    state: present

- name: Firewall | Allow RDP through Firewall
  win_dsc:
    resource_name: xFirewall
    Name: "Administrator access for RDP (TCP-In)"
    Ensure: present
    Enabled: True
    Profile: "Domain"
    Direction: "Inbound"
    Localport: "3389"
    Protocol: "TCP"
    Description: "Opens the listener port for RDP"
```

This one installs `xRemoteDesktopAdmin` [PowerShell module](https://github.com/PowerShell/xRemoteDesktopAdmin) with `win_psmodule` and enables RDP using [PowerShell Desired State Configuration](https://docs.ansible.com/ansible/latest/modules/win_dsc_module.html). Then `xNetworking` [module](https://github.com/PowerShell/NetworkingDsc) is installed to open RDP port on the Windows Firewall with `win_dsc` again.

Replica domain controller (RDC) is configured by `roles/replica_domain_controller/tasks/main.yml`script.

```yaml
---
- name: change DNS server
  when: not ansible_windows_domain_member
  win_dns_client:
    adapter_names: '*'
    ipv4_addresses: "{{ groups['primary_domain_controller'][0] }}"

- name: join domain
  win_domain_membership:
    dns_domain_name: "{{ domain }}"
    domain_admin_user: "{{ domain_admin }}"
    domain_admin_password: "{{ domain_admin_password }}"
    state: domain
  register: domain_joined

- name: reboot after domain join
  win_reboot:
  when: domain_joined.reboot_required

- name: Wait for system to become reachable over WinRM
  wait_for_connection:
    timeout: 900

- name: install ad
  win_domain_controller:
    dns_domain_name: "{{ domain }}"
    domain_admin_user: "{{ domain_admin }}"
    domain_admin_password: "{{ domain_admin_password }}"
    safe_mode_password: "{{ domain_safemode_password }}"
    state: domain_controller
  register: ad

- name: reboot server
  win_reboot:
    msg: "Installing AD. Rebooting..."
    pre_reboot_delay: 15
  when: ad.changed
```

First DNS server is changed to point to the PDC. Then the server joins the domain and reboots. After that AD role is installed and server reboots. 

The file server is configured by `roles/fileserver/tasks/main.yml`.

```yaml
---
- name: change DNS server
  win_dns_client:
    adapter_names: '*'
    ipv4_addresses: 
      - "{{ groups['primary_domain_controller'][0] }}"
      - "{{ groups['replica_domain_controller'][0] }}"

- name: join domain
  win_domain_membership:
    dns_domain_name: "{{ domain }}"
    domain_admin_user: "{{ domain_admin }}"
    domain_admin_password: "{{ domain_admin_password }}"
    state: domain
  register: domain_joined

- name: reboot after domain join
  win_reboot:
  when: domain_joined.reboot_required
```

It repeats the steps taken with SDC except `install ad` task.

Here is the sample output of `ansible-playbook winlab.yml`:
[![ansible-playbook](/images/2019-02-18-ansible.png)](/images/2019-02-18-ansible.png)

As you can see not everything went smooth at first. I guess there were some issues with Internet connectivity when Ansible tried to install `xRemoteDesktopAdmin` module. Fortunately, it succeeded on the second try. And here is what I like about Ansible: it didn't try to install AD during the second run, because it was already there. This [idempotency](https://docs.ansible.com/ansible/latest/reference_appendices/glossary.html) feature is very handy because it allows you to run playbooks against the same hosts over and over again and not to worry about making any changes to already configured resources.

## Conclusion
Now you have a fully functional basic Windows domain setup which you can use to prepare for MCSA exams or to build custom PoC setups.

## References and further reading
1. [Ansible Windows Guide](https://docs.ansible.com/ansible/latest/user_guide/windows.html)
2. [Ansible & DSC](https://docs.ansible.com/ansible/latest/user_guide/windows_dsc.html)
3. [Manage Windows like Linux with Ansible](https://www.youtube.com/watch?v=FEdXUv02Dbg)
4. [Configure An Ansible Testing System On Windows (Part 2)](https://www.frostbyte.us/configure-an-ansible-testing-system-on-windows-part-2/)
5. [Configure An Ansible Testing System On Windows (Part 3)](https://www.frostbyte.us/configure-an-ansible-testing-system-on-windows-part-3/)
