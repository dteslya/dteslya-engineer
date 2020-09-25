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
- [Data models and encodings](#data-models-and-encodings)
    - [YANG & Openconfig](#yang--openconfig)
    - [JSON](#json)
    - [YAML](#yaml)
    - [XML](#xml)
- [Tools and technologies](#tools-and-technologies)
  - [Ways of interacting with network devices programmatically](#ways-of-interacting-with-network-devices-programmatically)
    - [CLI](#cli)
      - [Netmiko](#netmiko)
      - [Scrapli](#scrapli)
      - [TextFSM and NTC Templates](#textfsm-and-ntc-templates)
      - [TTP (Template Text Parser)](#ttp-template-text-parser)
      - [PyATS & Genie](#pyats--genie)
    - [APIs](#apis)
      - [RESTful APIs](#restful-apis)
      - [NETCONF & RESTCONF](#netconf--restconf)
      - [gRPC & gNMI](#grpc--gnmi)
      - [Summary](#summary-1)
  - [Git](#git)
  - [Docker and containers](#docker-and-containers)
    - [Why use Docker?](#why-use-docker)
    - [Basic Terminology](#basic-terminology)
      - [Images](#images)
      - [Layers](#layers)
      - [Tags](#tags)
      - [Volumes](#volumes)
      - [Dockerfiles](#dockerfiles)
      - [Docker Compose](#docker-compose)
    - [Docker use cases for network automation](#docker-use-cases-for-network-automation)
  - [Automation tools](#automation-tools)
    - [NAPALM](#napalm)
    - [Ansible (framework)](#ansible-framework)
    - [Nornir](#nornir)
    - [PyATS & Genie](#pyats--genie-1)
  - [Monitoring](#monitoring)
  - [Testing and modeling tools](#testing-and-modeling-tools)
  - [Code editors](#code-editors)
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

**Configuration templates** are just text files written in a templating language of choice (I guess [Jinja2](https://jinja.palletsprojects.com/en/2.11.x/) is the most popular one). When combined with the info from the SoT they produce device-specific config files. Templating allows you to break down device configurations into separate template files each one representing specific config section and then mix and match them to produce configurations for different network devices. Some templates may be reused across multiple devices and some may be created for specific software version or vendor.

Making changes to the SoT or the templates triggers (2) the rest of the process. First, both those sources of information are used by the configuration management system (e.g. Ansible, more on this later) to generate the resulting configuration files to be applied to the network devices. These configs then must be validated (3). Validation usually includes a number of automated tests (syntax check, use of modeling software, spinning up virtual devices) and a peer review. If validation fails some form of feedback is given to the initiator of change (4) so they can remediate and start the whole process again. If validation is passed resulting configs can be deployed to the production network (5).

Of course the presented workflow is rather schematic and aims to give a general idea of the network automation process and the role of the core components in it.

In the next section I'm going to look at the tools and technologies one can utilize in network automation workflows.

# Data models and encodings
### YANG & Openconfig

### JSON
JSON

### YAML
YAML

### XML
XML

# Tools and technologies
This section is quite opinionated and aims to introduce you to the essential tools leaving behind many others for the sake of brevity. I highly recommend to take a look at the [Awesome Network Automation](https://github.com/networktocode/awesome-network-automation) list later.

## Ways of interacting with network devices programmatically
There are two major ways of accessing network devices programmatically: CLI and API.
### CLI
For a long time the only API of network devices was CLI which is designed to be used by humans and not automation scripts. These are the main drawbacks of using CLI as an API:
* **Inconsistent data output**  
  Same command outputs may differ from one NOS (Network Operating System) version to another.
* **Unstructured data output**  
  Data returned by command execution in CLI is plain text, which means you have to manually parse it (i.e. CLI scraping)
* **Unreliable command execution**  
  You don't get a status code of an executed command and have to parse the output to determine whether the command succeeded or failed.

Despite more and more networking vendors begin to include API support in their products it's unlikely that you won't have to deal with CLI during your network automation journey.

Fortunately there are a lot of tools and libraries today that make CLI scraping easier. Here is a list of the most prominent ones.
#### Netmiko  
[Netmiko](https://github.com/ktbyers/netmiko) is a python library based on [paramiko](http://www.paramiko.org/) and aimed to simplify SSH access to network devices. Created by Kirk Byers in 2014 this python library stays the most popular and widely used tool for managing SSH connections to network devices.

#### Scrapli 
[Scrapli](https://github.com/carlmontanari/scrapli) is somewhat new python library (first release in 2019) that solves the same problems as Netmiko but aims to be "*as fast and flexible as possible"*.

#### TextFSM and NTC Templates
[TextFSM](https://github.com/google/textfsm) is a python module created by Google which purpose is to parse semi-formatted text (i.e. CLI output). It takes a template file and text as input and produces structured output. [NTC templates](https://github.com/networktocode/ntc-templates) is a collection of TextFSM templates for variety of networking vendors. TextFSM can be used in conjunction with [netmiko](https://pynet.twb-tech.com/blog/automation/netmiko-textfsm.html) and [scrapli](https://github.com/carlmontanari/scrapli#textfsmntc-templates-integration).

#### TTP (Template Text Parser)
[TTP](https://ttp.readthedocs.io/en/latest/Overview.html) is the newest addition to the text parsing tools. It's also based on templates which resemble Jinja2 syntax but work in reverse. Simple TTP template looks much like the text it is aimed to parse but the parts you want to extract are put in {{ curly braces }}. It doesn't have a collection of prebuilt templates but given its relative ease of use you can quickly create your own.

#### PyATS & Genie
[This internal Cisco tools](https://developer.cisco.com/docs/pyats/) were publicly released a few years back and continue to develop rapidly. PyATS is a testing and automation framework. It has a lot to it and I encourage you to learn about it on Cisco DevNet resources. Here I would like to focus on two libraries within PyATS framework: [Genie parser](https://github.com/CiscoTestAutomation/genieparser) and [Dq](https://pubhub.devnetcloud.com/media/genie-docs/docs/userguide/utils/index.html#dq). The first one as the name implies is aimed to parse CLI output and has a [huge collection](https://pubhub.devnetcloud.com/media/genie-feature-browser/docs/#/parsers) (2000+) of ready-made parsers for various devices (not limited to Cisco). The second one, Dq, is a great time saver when you need to access the parsed data. Often parsers such as Genie return data in a complex data structures (e.g. nested dictionaries) and to access something you would need loops, if statements and a strong understanding of where to look. With Dq you can make queries without much caring of where in a nested structure your data resides.

### APIs
If you are lucky and devices in your network are equipped with API or maybe even driven by SDN controller this section is for you. Network APIs fall in two major categories: HTTP-based and NETCONF-based.

#### RESTful APIs
[REST](https://en.wikipedia.org/wiki/Representational_state_transfer) stands for Representational State Transfer and defines a set of properties and constraints which an API must conform to in order to be called RESTful.

{{< alert message="HTTP-based APIs may be RESTful and non-RESTful. Non-RESTful HTTP-based APIs are left out of scope because they are less common." type="info" badge="Note" >}}

RESTful APIs are quite easy to use and understand because they are based on HTTP protocol. Basically, RESTful API is just a set of HTTP URLs on which you can make GET and/or POST requests except for returned data is encoded in JSON or XML, not HTML. Since RESTful APIs are HTTP-based they are stateless by nature. This means each request is independent of another and has to supply all the needed information to be properly processed.

To explore RESTful APIs you can use tools such as cURL or Postman, but when you are ready to write some code utilizing RESTful API you can use a Python library called [requests](https://requests.readthedocs.io/en/master/).

#### NETCONF & RESTCONF
[NETCONF](https://tools.ietf.org/html/rfc6241) is a protocol specifically designed for managing network devices. Unlike REST it uses SSH as transport and is stateful as a result. The other key differences of NETCONF are clear delineation between configurational and operational data and the concept of configuration datastores. NETCONF defines three datastores: running configuration, startup configuration, and candidate configuration. You may be familiar with all three of them in context of network devices. Candidate configuration concept allows to deliver a configuration change consisting of many commands as one transaction. This means that if only one command in a transaction fails the transaction does not succeed avoiding a situation when partial configuration is applied.

Exploring NETCONF APIs is not as easy and straightforward as with RESTful APIs. To do so you need to establish an interactive SSH session to a device and send lengthy XML-encoded commands. To access NETCONF APIs programmatically there is a [ncclient](https://github.com/ncclient/ncclient) Python library.

[RESTCONF](https://tools.ietf.org/html/rfc8040) is another standard protocol which implements a subset of NETCONF functionality (e.g. transactions are not supported) and uses HTTP as transport and is RESTful.

When choosing between [NETCONF and RESTCONF](https://www.ipspace.net/kb/CiscoAutomation/070-netconf.html) it's [advised](https://www.claise.be/netconf-versus-restconf-capabilitity-comparisons-for-data-model-driven-management-2/) to use the former for direct interactions with network devices and the latter for interactions with SDN-controllers and/or orchestrators.

#### gRPC & gNMI
[gNMI](https://tools.ietf.org/html/draft-openconfig-rtgwg-gnmi-spec-01) is a new addition to network management protocols based on Google's [gRPC](https://en.wikipedia.org/wiki/GRPC) and developed by [OpenConfig](https://www.openconfig.net/) working group. It is considered to be a more robust successor of NETCONF and supports [streaming telemetry](https://blogs.cisco.com/developer/getting-started-with-model-driven-telemetry).

Because gNMI is not yet as mature as NETCONF it is not very well supported in Python. Though there are a couple of libraries you can look into: [cisco-gnmi](https://github.com/cisco-ie/cisco-gnmi-python) and [pygnmi](https://github.com/akarneliuk/pygnmi).

#### Summary
Here is a summary table representing key properties of network API types.

|                     | REST       | NETCONF  | RESTCONF | gNMI |
| ------------------- | ----       | -------  | -------- | ---   |
| RFC                 | -          | [RFC 6241](https://tools.ietf.org/html/rfc6241) | [RFC 8040](https://tools.ietf.org/html/rfc8040) | [Draft](https://tools.ietf.org/html/draft-openconfig-rtgwg-gnmi-spec-01) |
| Transport           | HTTP       | SSH      | HTTP | gRPC (HTTP/2.0) |
| Data encoding       | XML, JSON  | XML     | XML, JSON | ProtoBuf (binary) |
| Transaction support | ❌          | ✅        | ❌          | ✅  |
| Python libs         | [requests](https://requests.readthedocs.io/en/master/) | [ncclient](https://github.com/ncclient/ncclient) | [requests](https://requests.readthedocs.io/en/master/) | [cisco-gnmi](https://github.com/cisco-ie/cisco-gnmi-python), [pygnmi](https://github.com/akarneliuk/pygnmi) |

* CLI scraping vs API
* RESTful, Netconf, RESTconf, YANG, gNMI



## Git
Most popular version control system.

## Docker and containers
Linux containers have been around for quite a long time (and [chroot and jail](https://en.wikipedia.org/wiki/Chroot) even longer) but Docker was what made it really popular and accessible.

Containers allow to run software in an isolated environment, but contrary to VMs each container doesn't need a full-blown OS to run. This makes containers more resource effective in terms of CPU, RAM, and storage not to mention that you don't need to maintain a separate OS for each container as with VMs.

Docker (Docker Engine, to be precise) is a software that creates, deletes, and runs containers. You can think of it as similar to ESXi. Docker's ease of use is what made containers so popular.

### Why use Docker?
What are the main reasons to use containers in general:
* **Isolation**  
  Application running inside a container has all the libraries of specific versions it needs. If another application needs other versions of the same libraries just use another container image.
* **Portability**  
  This comes as a result of the previous point. If you've managed to run your application inside a container you can easily run it anywhere where Docker is installed because for the application environment doesn't change.
* **Scalability**  
  You can easily create lots of containers to distribute load between them (see [Kubernetes](https://en.wikipedia.org/wiki/Kubernetes))
* **Performance**  
  Faster to create, quicker to start, consume less resources.
* **Community**  
  There are millions of ready-made docker images on [dockerhub](https://hub.docker.com/) which you can use directly or build your own images upon them.

### Basic Terminology
To familiarize yourself with Docker you need to know the basic terminology and tools.

{{< alert message="Containerization topic is really huge and I don't want to go deep into technicalities here. If you want to learn more about Docker and containers I can recommend a book called [Docker Deep Dive](https://www.amazon.com/Docker-Deep-Dive-Nigel-Poulton-ebook-dp-B01LXWQUFF/dp/B01LXWQUFF/) by Nigel Poulton" type="info" badge="Note" >}}

#### Images
  To continue the VM analogy you can think of a Docker images as a VM templates. Image contains all the necessary files to run a container and can have a predefined parameters for the container, such as which TCP ports to expose. When you start a container you can override this parameters and add your own. You can run multiple containers from a single image. It is crucial to understand that containers itself are ephemeral or stateless. This means that when you make any changes to the container's filesystem when it's running it won't persist after you restart that container. If you need persistency you should use external storage solutions such as volumes.
#### Layers
  Docker images are made of layers. Essentially, a layer is a bunch of files created after running a command in a Dockerfile. If to build another image you use the same commands in a Dockerfile Docker will just reuse the previously created layer. This speeds up image building and saves storage space.
#### Tags
  When you are using different versions of the same image you need a way to distinguish between them. That's where tags come in handy. When creating an image or pulling one from a repository you should specify a tag (e.g. python:3.8.5-slim-buster where 3.8.5-slim-buster is a tag), if you don't the `latest` tag will be used. Please note that `latest` has no special meaning, it's just a tag which not necessary denotes the latest version of the image.
#### Volumes
  When starting a container you can specify directories or files to be mounted inside the container filesystem. Each such directory or file is called a volume. Volumes come in handy when you need the data to persist or to be shared among different containers. It's also an easy way to insert a custom config file into container, or to use a container as a runtime environment for your script which is mounted inside a container so you can test it without the need to rebuild the container image.

#### Dockerfiles
  [Dockerfile]((https://docs.docker.com/engine/reference/builder/)) is a text file with a set of instructions on how to build an image. It consists of the commands specifying such things as what another image should be used as a base image, what files to copy into the image, what packets to install and so on.

#### Docker Compose
  [Docker-compose](https://docs.docker.com/compose/) is a simple orchestrator for Docker containers. To start a number of containers without docker-compose you need to type a lot of long commands with multitude of arguments. Docker-compose allows you to specify all that arguments in a simple and clean manner of YAML file. It also allows you to specify dependencies between containers, i.e. in what order they should start. But even if you need to run only one container it's better to write a `docker-compose.yml` just to place all those arguments on record.

### Docker use cases for network automation
When talking about network automation Docker can come in handy in two major ways:
* You can build your own automation tools to run in Docker making them portable and automating the packaging process as a result.
* Most modern tools have a dockerized versions which you can run by entering just one command. This one is really useful when you want to follow a tutorial or to try out a new tool but doesn't want to waste time on setup (which can be quite nontrivial)

Here is a simple workflow to build and run your own Docker container:
* Write a `Dockerfile`
* Write a `docker-compose.yml` file
* Run `docker-compose up`

There are tons of articles on how to write Dockerfiles and use docker-compose. But I guess at first you will use prebuilt images just to get familiar with Docker and you will need to know some basic CLI commands to start, stop. and monitor Docker containers. [Here](https://pagertree.com/2020/01/06/docker-cheat-sheet/) is a good write up on the essential Docker commands you will find useful from the start.

## Automation tools
Quick overview and categorization (configuration management, orchestrators)
You don't necessarily need to know how to code, but it's so much better when you do.

### NAPALM
### Ansible (framework)
* Why so popular for network automation?
* Project structure: inventory, playbooks, roles
* Network modules (https://docs.ansible.com/ansible/latest/modules/list_of_network_modules.html)
### Nornir
### PyATS & Genie

## Monitoring
* SNMP vs Streaming Telemetry
* Logging
* State monitoring with PyATS
* Modern Tools (influxdb, grafana, ELK)

## Testing and modeling tools
* [Batfish](https://www.batfish.org/)

## Code editors
* VS Code (for projects)
* SublimeText (ad-hoc editing)



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
* [6 Docker Basics You Should Completely Grasp When Getting Started](https://vsupalov.com/6-docker-basics/) by Vladislav Supalov
