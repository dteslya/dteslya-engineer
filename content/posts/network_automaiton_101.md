---
title:  Network automation 101
description: "A comprehensive guide on network automation: where to start, tools, technologies, and approaches"
categories:
  - automation
  - guide
tags:
  - git
  - version control
  - api
  - cicd
  - coding
  - python
  - postman
  - sdn
date: "2020-08-17"
draft: true
toc: false
maxWidthTitle: "max-w-4xl"
maxWidthContent: "max-w-4xl"
feature: "images/2020-08-network_automation.png"
---
- [Introduction](#introduction)
- [DevOps](#devops)
  - [Infrastructure as Code](#infrastructure-as-code)
  - [CI/CD](#cicd)
  - [Version control](#version-control)
  - [Summary](#summary)
- [NetDevOps](#netdevops)
- [Tools and technologies](#tools-and-technologies)
  - [Docker and containers](#docker-and-containers)
  - [Ways of interacting with network devices](#ways-of-interacting-with-network-devices)
  - [Monitoring](#monitoring)
  - [Testing and modeling tools](#testing-and-modeling-tools)
  - [Automation tools](#automation-tools)
    - [Paramiko, netmiko](#paramiko-netmiko)
    - [NAPALM](#napalm)
    - [Ansible (framework)](#ansible-framework)
    - [Chef, Puppet, Salt (honorable mentions)](#chef-puppet-salt-honorable-mentions)
    - [Nornir](#nornir)
    - [Scrapli](#scrapli)
    - [PyATS & Genie](#pyats--genie)
  - [Code editors](#code-editors)
  - [Data formats](#data-formats)
    - [JSON](#json)
    - [YAML](#yaml)
    - [XML](#xml)
- [Vendor resources](#vendor-resources)
  - [Cisco DevNet](#cisco-devnet)
  - [Juniper](#juniper)
  - [Arista?](#arista)
  - [Cumulus](#cumulus)
- [Who to follow on social media](#who-to-follow-on-social-media)
- [Conclusion](#conclusion)
- [References and further reading](#references-and-further-reading)
<hr>

# Introduction
In this post I want to gather everything I learned about network automation so far in a structured and concise manner. The main audience of this guide are engineers who want to start automating their networks but are overwhelmed by the abundance of terms, tools, and concepts.

# DevOps
When trying to grasp a new concept or technology I find it helpful to spend some extra time on learning about subject's origins. It gives context and perspective which are crucial to learning about something complex. So before diving into network automation topic I'd like to drop a few lines about where it all came from.

Of course, in some way network automation has been around for quite a long time. You can remember such examples as using [Expect](https://en.wikipedia.org/wiki/Expect) to connect to network devices and issue commands or writing [EEM](https://en.wikipedia.org/wiki/Embedded_event_manager) scripts on Cisco routers, or maybe running scripts which retrieve useful information from network devices via SNMP. So what have changed since then? Why network automation is so hot at the moment? My answer is &mdash; the change of culture which came with the emergence of [DevOps](https://en.wikipedia.org/wiki/DevOps) movement.

{{< figure src="images/2020-09-devops-loop.png" alt="DevOps" caption="DevOps Lifecycle" >}}

DevOps term first emerged somewhere around 2008 and 2009 and is attributed to Patrick Debois. In 2009 he held an event called DevOpsDays which main purpose was to bring together developers and system administrators and discuss the ways of how to bridge the gap between the two. This gained enough traction and the DevOps became a buzzword.

But what is DevOps? There is no academic definition, but the most common one states that it is a set of tools, practices, and philosophies aimed to bridge the gap between the development and operational teams in order to build quality software faster. If you want to learn more about DevOps I recommend this [awesome list](https://github.com/AcalephStorage/awesome-devops).

DevOps has many aspects to it but I'd like to focus on three key practices which it brings: [Infrastructure as Code](https://en.wikipedia.org/wiki/Infrastructure_as_code), [CI/CD](https://en.wikipedia.org/wiki/CI/CD), and [version control](https://en.wikipedia.org/wiki/Version_control).

## Infrastructure as Code
According to Wikipedia, IaC is ...
>... the process of managing and provisioning computer data centers through machine-readable definition files, rather than physical hardware configuration or interactive configuration tools.

What this really mean is that you have a bunch of text files in which you define the desired state of you infrastructure: number of VMs, their properties, virtual networks, ip addresses etc. etc. Then these files are processed by IaC tool or framework (Terraform, SaltStack, Ansible are just a few examples) which translates that declared state into actual API calls and configuration files and apply it to the infrastructure in order to bring it to the desired state. This gives you a level of abstraction since you focus only on the resulting state and not on how to achieve it. Here I should mention one of the key features of IaC approach which is [idempotence](https://en.wikipedia.org/wiki/Idempotence). This feature allows you to run an IaC tool repeatedly and if something is already in a desired state it won't touch it. For example, if you declare that a certain VLAN should be configured on a switch and it is already there, when you run an IaC tool against that switch it won't try to configure anything.

Treating your infrastructure as text files enables you to apply the same tools and practices to infrastructure as one would apply to any other software project. CI/CD and version control are main examples here.

## CI/CD
CI/CD stands for Continuous Integration / Continuous Delivery or Deployment. Lets look into each component in more detail.

**Continuous Integration** &mdash; a process of frequent (up to several times a day) merges of code changes to the main code repository. These merges are accompanied by various tests and quality control processes such as unit and integration tests, [static code analysis](https://en.wikipedia.org/wiki/Static_program_analysis), extraction of documentation from the source code etc. This approach allows to integrate code changes frequently by different developers therefore mitigating risks of integration conflicts.

**Continuous Delivery** &mdash; extension of CI which takes care of automating the release process (e.g. packaging, image building etc). Continuous delivery allows you to deploy your application to production environment at any time.

**Continuous Deployment** &mdash; extension of continuous delivery, but this time deployment to production is also automated.

## Version control
Version control system is a foundation for any automation project. It tracks changes in your project files (source code), logs who made those changes, and enables CI/CD workflows.
{{< figure src="https://imgs.xkcd.com/comics/git.png" alt="xkcd - Git" caption="Git" attr="xkcd" attrlink="https://xkcd.com/1597/">}}

Today [Git](https://git-scm.com/) is the de facto standard in version control systems. Essentially git is just a command line tool (though very powerfull) that manages project versioning by creating and manipulating metadata kept in a separate hidden directory in project's [working directory](https://en.wikipedia.org/wiki/Working_directory). But all the magic comes with web-based source control systems such as GitHub or GitLab among others.

{{< alert message="Many people confuse Git and GitHub because the latter became a [generic term](https://en.wikipedia.org/wiki/Generic_trademark) for version control systems." type="info" badge="Note" >}}

Lets suppose you are on a team of developers working on a project hosted on GitHub. Your typical [workflow](https://guides.github.com/introduction/flow/)  will go like this:
* You want to make changes to the source code. It may be a bug fix or a new feature. You create a new branch from the main one and start making [commits](https://en.wikipedia.org/wiki/Commit_(version_control)). This doesn't affect the main branch in any way.
* When the work seems to be done it's time to create a [pull request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests). PR is a way to tell other developers (project maintainers) that you want to merge your branch with the main one. PR creation can trigger CI tests if they are configured. After all CI tests pass successfully the code is reviewed by other team members. If CI tests fail or something needs to be improved the PR will be rejected. Then you can fix your code in the same branch and create another PR. 
{{< alert message="Usually, PR's are never merged automatically and someone need to make the final decision." type="info" badge="Note" >}}
* If everything is good your branch will be merged with the main one.
* If CD is configured merging with the main branch triggers deployment to the production environment.

## Summary
In this section a gave a brief overview of what DevOps is and it's main tools and practices. In the next section I'll try to explain how it can be applied to networks and network automation.

# NetDevOps
Now that you've read the previous section you should guess that NetDevOps is just a DevOps approach applied to networking. All of the aforementioned key DevOps practices can be aligned with network: device configurations can be templated (IaC) and put into version control system where CI/CD processes are applied.

Below is the sample diagram representing the whole process.

{{< figure src="images/2020-09-netdevops-pipeline.png" alt="DevOps" caption="NetDevOps Pipeline" >}}

The workflow starts with a network operator introducing a change (1) either to the *Source of Truth* or to the *configuration templates*. So what are those exactly?

**Source of Truth** is a database (e.g. SQL DB or plain text files) where constants such as VLAN numbers and IP addresses are stored. Actually this can be a number of databases &mdash; you can get your IP information from [IPAM](https://en.wikipedia.org/wiki/IP_address_management) and interface descriptions from [DCIM](https://en.wikipedia.org/wiki/Data_center_management#Data_center_infrastructure_management) ([Netbox](https://netbox.readthedocs.io/en/stable/) is a great example that can do both). The key idea here is that each database must be the [single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth) for the particular piece of information, so when you need to change something you change it only in one place.

**Configuration templates** are just text files written in a templating language of choice (I guess [Jinja](https://jinja.palletsprojects.com/en/2.11.x/) is the most popular one). When combined with the info from the SoT they produce device-specific config files. Templating allows you to break down device configurations into separate template files each one representing specific config section and then mix and match them to produce configurations for different network devices. Some templates may be reused across multiple devices and some may be created for specific software version or vendor.

Making changes to the SoT or the templates triggers (2) the rest of the process. First, both those sources of information are used by the configuration management system (e.g. Ansible, more on this later) to generate the resulting configuration files to be applied to the network devices. These configs then must be validated (3). Validation usually includes a number of automated tests (syntax check, use of modeling software, spinning up virtual devices) and a peer review. If validation fails some form of feedback is given to the initiator of change (4) so they can remediate and start the whole process again. If validation is passed resulting configs can be deployed to the production network (5).

Of course the presented workflow is rather schematic and aims to give a general idea of the network automation process and the role of the core components in it.

In the next section I'm going to look at the tools and technologies one can utilize in network automation workflows.

# Tools and technologies
This section is quite opinionated and aims to introduce you to the essential tools leaving behind many others for the sake of brevity. I highly recommend to take a look at the [Awesome Network Automation](https://github.com/networktocode/awesome-network-automation) list later.

## Docker and containers
Linux containers have been around for quite a long time (and [chroot and jail](https://en.wikipedia.org/wiki/Chroot) even longer) but Docker was what made it really popular and accessible.

Containers allow to run software in an isolated environment, but contrary to VMs each container doesn't need a full-blown OS to run. This makes containers more resource effective in terms of CPU, RAM, and storage not to mention that you don't need to maintain a separate OS for each container as with VMs.

Docker (Docker Engine, to be precise) is a software that creates, deletes, and runs containers. You can think of it as similar to ESXi. Docker's ease of use is what made containers so popular.

{{< alert message="Containerization topic is really huge and I don't want to go deep into technicalities here. If you want to learn more about Docker and containers I can recommend a book called [Docker Deep Dive](https://www.amazon.com/Docker-Deep-Dive-Nigel-Poulton-ebook-dp-B01LXWQUFF/dp/B01LXWQUFF/) by Nigel Poulton" type="info" badge="Note" >}}

What are the main reasons to use containers in general:
* **Isolation**  
  Application running inside a container has all the libraries of specific versions it needs. If another application needs other versions of the same libraries just use another container image.
* **Portability**  
  This comes as a result of the previous point. If you've managed to run your application inside a container you can easily run it anywhere where Docker is installed because for the application environment doesn't change.
* **Scalability**  
  You can easily create lots of containers to distribute load between them (see [Kubernetes](https://en.wikipedia.org/wiki/Kubernetes))
* **Performance**  
  Faster to create, quicker to start, consume less resources.
* **Lots of ready-made images**  
  Most modern application have a dockerized versions which you can easily install with just one command.

When talking about network automation Docker can come handy in a number of ways.

## Ways of interacting with network devices
* CLI scraping vs API
* RESTful, Netconf, RESTconf, YANG, gNMI

## Monitoring
* SNMP vs Streaming Telemetry
* Logging
* State monitoring with PyATS
* Modern Tools (influxdb, grafana, ELK)

## Testing and modeling tools
* [Batfish](https://www.batfish.org/)

## Automation tools
Quick overview and categorization (configuration management, orchestrators)
You don't necessarily need to know how to code, but it's so much better when you do.

### Paramiko, netmiko
### NAPALM
### Ansible (framework)
* Why so popular for network automation?
* Project structure: inventory, playbooks, roles
* Network modules (https://docs.ansible.com/ansible/latest/modules/list_of_network_modules.html)
### Chef, Puppet, Salt (honorable mentions)
### Nornir
### Scrapli
### PyATS & Genie

## Code editors
* VS Code
* Atom
* SublimeText
* PyCharm

## Data formats
### JSON
### YAML
### XML

# Vendor resources
## Cisco DevNet
## Juniper
## Arista?
## Cumulus

# Who to follow on social media
* Why it is important
* Twitter

# Conclusion
I hope this was useful for you to get a grip of what network automation is about. If you decide to learn more I encourage you to start automating something because doing is the best way to learn something. I recommend to start small and look for the low hanging fruits. For example, you can automate information gathering from you network devices (give more detail here) and then when you feel more comfortable begin to configure devices programmatically. There is a great [article](https://blog.networktocode.com/post/netdevops-concepts-mvp) by Brett Lykins on how to start automating your network.

# References and further reading
* [Network Programmability and Automation](https://www.oreilly.com/library/view/network-programmability-and/9781491931240/) a book by Jason Edelman, Scott S. Lowe, Matt Oswalt
* [Hands-on with NetDevOps](https://github.com/juliogomez/netdevops) by Julio Gomez
* [What is NetDevOps?](https://www.packetflow.co.uk/what-is-netdevops/) by Rick Donato
* [A practical approach to building a network CI/CD pipeline](https://www.intentionet.com/blog/a-practical-approach-to-building-a-network-ci-cd-pipeline/) by Samir Parikh
* [NetDevOps: what does it even mean?](https://cumulusnetworks.com/blog/netdevops-meaning/) by Madison Emery (Cumulus Networks)
* [Awesome Network Automation](https://github.com/networktocode/awesome-network-automation) &mdash; curated Awesome list about Network Automation