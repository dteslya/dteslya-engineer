# Configuring devices

## NAPALM

As the official documentation states
>NAPALM (Network Automation and Programmability Abstraction Layer with Multivendor support) is a Python library that implements a set of functions to interact with different network device Operating Systems using a unified API.

### Supported devices

As of the time of writing NAPALM supported the following network operating systems:

* Arista EOS
* Cisco IOS
* Cisco IOS-XR
* Cisco NX-OS
* Juniper JunOS

### Working with device configuration

With NAPALM you can push [configuration](https://napalm.readthedocs.io/en/latest/tutorials/first_steps_config.html) and retrieve operational data from  devices. When manipulating device configuration you have two options:

* **Replace** the entire running configuration with a new one
* **Merge** the existing running configuration with a new one

Replace and merge operations don't apply at once. Before committing the new configuration you can compare it to the currently running configuration and then either commit or discard it. And even after applying the new config, you have an option to rollback to the previously committed configuration if the network OS supports it. 

### Validating deployment

The ability to retrieve operational data from devices brings a powerful NAPALM feature called compliance report or [deployment validation](https://napalm.readthedocs.io/en/latest/validate/index.html). To get a compliance report you need to write a YAML file describing the desired state of the device and tell NAPALM to use it against the device with a `compliance_report` method.

### Integration with other tools

Being a Python library NAPALM can be used directly in Python scripts or integrated with Ansible ([napalm-ansible](https://github.com/napalm-automation/napalm-ansible) module), Nornir ([nornir_napalm](https://github.com/nornir-automation/nornir_napalm) plugin) or SaltStack (native support).

## Ansible

[Ansible](https://en.wikipedia.org/wiki/Ansible_(software)) is a comprehensive automation [framework](https://www.geeksforgeeks.org/software-framework-vs-library/) initially developed to provision Linux servers. Due to its agentless nature, Ansible soon became very popular among network engineers. Contrary to the agent-based systems like [Chef](https://en.wikipedia.org/wiki/Chef_(software)) and [Puppet](https://en.wikipedia.org/wiki/Puppet_(company)), Ansible executes Python code on the target systems to perform its tasks. Therefore it only requires the target system to run SSH and Python. But how does it align with the network devices which cannot execute Python code? To solve this Ansible executes its network modules locally on the [control node](https://docs.ansible.com/ansible/latest/network/getting_started/basic_concepts.html#control-node). 

### Ansible Galaxy

To interact with different network platforms Ansible uses plugins grouped in [collections](https://docs.ansible.com/ansible/latest/collections/index.html#list-of-collections). To install these collections you can use [Ansible Galaxy](https://galaxy.ansible.com/search?deprecated=false&tags=networking&keywords=&order_by=-download_count&page=1) which is like [DockerHub](https://hub.docker.com/) or [PyPi](https://pypi.org/) for Ansible, where users can share Ansible [roles](#roles) and plugins.

### Terminology

Typical Ansible automation project consists of the following building blocks.

#### Inventory

Inventory file lists managed network devices, their hostnames or IP addresses, and optionally other variables like access credentials. Ansible can use Netbox as an inventory information source via a [plugin](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html).

#### Playbooks

A playbook defines an ordered list of tasks to be performed against managed devices. It also can define which roles should be applied to devices.

#### Roles

As the [official documentation](https://docs.ansible.com/ansible/latest/network/getting_started/network_roles.html#understanding-roles) states
>Ansible roles are basically playbooks broken up into a known file structure.

Roles allow you to group tasks and variables in separate directories. This makes an Ansible project more organized and lets you reuse those roles on different groups of managed hosts more easily.

You can create roles according to different configuration sections: one for routing, another for basic settings such as NTP and DNS servers, etc. etc. Then you can apply those roles to different groups of devices. For example, routing is needed only on the core switches, and basic settings should be applied to all devices.

### Pros & Cons

Ansible uses its own [DSL](https://en.wikipedia.org/wiki/Domain-specific_language) based on [YAML](#yaml) to describe its playbooks logic. This design decision can be considered a two-edged sword. It requires minimal learning to solve simple tasks, but when you need to write something more complex it quickly becomes quite cumbersome and hard to debug.

Speed and scalability are other aspects where Ansible doesn't shine in the context of network automation. 

In my opinion, Ansible is a great starting point for your network automation journey, as it is easy to learn and gives you a good idea of what modern automation tools are about. As John McGovern from CBT Nuggets [said](https://youtu.be/uQAaA_-lb7k?t=177) "Ansible is like a CCNA for network automation".

Another Ansible advantage is that it can be used as a single automation solution for the whole IT infrastructure.

## Nornir

Nornir was initially created by David Barroso, author of NAPALM.
>Nornir is an automation framework written in python to be used with python.
>
><cite>Official Nornir [documentation](https://nornir.readthedocs.io/en/latest/index.html)</cite>

The last part of the definition is key here. Unlike Ansible, Nornir uses pure Python for describing its tasks (Nornir tasks are essentially Python functions). This makes Nornir far more flexible, [fast](https://networklore.com/ansible-nornir-speed/), and easy to [debug](https://nornir.readthedocs.io/en/latest/howto/ipdb_how_to_use_it_with_nornir.html).

!!! note ""
    Another aspect of Nornir being purely Python is that when you learn Nornir you also learn Python.

Nornir is a pluggable system and starting with version 3.0 it comes only with the very basic plugins. A list of Nornir plugins can be found [here](https://nornir.tech/nornir/plugins/). Plugins are installed with Python's standard package manager [pip](https://pip.pypa.io/en/stable/).

Like Ansible, Nornir has a concept of inventory, which also can be written in YAML ([YAMLInventory](https://github.com/nornir-automation/nornir_utils) plugin), where you put host and group variables. You can also use existing Ansible inventory files ([nornir_ansible](https://github.com/carlmontanari/nornir_ansible)) or take your inventory information directly from Netbox with [nornir_netbox](https://github.com/wvandeun/nornir_netbox).

To interact with network devices, Nornir can leverage [NAPALM](#napalm), [netmiko](#netmiko), and [scrapli](#scrapli) libraries via respective plugins.