---
title:  Network Automation 101
description: "A comprehensive guide to network automation: where to start, tools, technologies, and approaches"
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
  - automation
  - iac
  - devops
  - netdevops
  - docker
  - ansible
  - nornir
  - napalm
date: "2020-10-05"
draft: false
toc: false
maxWidthTitle: "max-w-4xl"
maxWidthContent: "max-w-4xl"
feature: "images/2020-10-Network-Automation-101_feature.png"
---
- [Introduction](#introduction)
- [DevOps](#devops)
  - [Infrastructure as Code](#infrastructure-as-code)
  - [CI/CD](#cicd)
  - [Version control](#version-control)
  - [Summary](#summary)
- [NetDevOps](#netdevops)
- [Data Models and Encodings](#data-models-and-encodings)
    - [YANG & Openconfig](#yang--openconfig)
    - [XML](#xml)
    - [YAML](#yaml)
    - [JSON](#json)
    - [Summary](#summary-1)
- [Technologies](#technologies)
  - [Python](#python)
  - [Ways of interacting with network devices programmatically](#ways-of-interacting-with-network-devices-programmatically)
    - [CLI](#cli)
    - [APIs](#apis)
      - [RESTful APIs](#restful-apis)
      - [NETCONF & RESTCONF](#netconf--restconf)
      - [gRPC & gNMI](#grpc--gnmi)
      - [Summary](#summary-2)
  - [Git](#git)
    - [Why use Git?](#why-use-git)
    - [Terminology](#terminology)
      - [Repository](#repository)
      - [Working directory](#working-directory)
      - [Staging](#staging)
      - [Commit](#commit)
      - [Branch](#branch)
      - [Pull (merge) request](#pull-merge-request)
    - [Basic usage](#basic-usage)
      - [Command line](#command-line)
      - [Dealing with mistakes](#dealing-with-mistakes)
      - [.gitignore](#gitignore)
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
- [Automation Tools](#automation-tools)
  - [Connection Management and CLI Scraping](#connection-management-and-cli-scraping)
    - [Netmiko](#netmiko)
    - [Scrapli](#scrapli)
  - [Parsing](#parsing)
    - [TextFSM and NTC Templates](#textfsm-and-ntc-templates)
    - [TTP (Template Text Parser)](#ttp-template-text-parser)
    - [PyATS & Genie](#pyats--genie)
  - [Configuring devices](#configuring-devices)
    - [NAPALM](#napalm)
      - [Supported devices](#supported-devices)
      - [Working with device configuration](#working-with-device-configuration)
      - [Validating deployment](#validating-deployment)
      - [Integration with other tools](#integration-with-other-tools)
    - [Ansible](#ansible)
      - [Ansible Galaxy](#ansible-galaxy)
      - [Terminology](#terminology-1)
        - [Inventory](#inventory)
        - [Playbooks](#playbooks)
        - [Roles](#roles)
      - [Pros & Cons](#pros--cons)
    - [Nornir](#nornir)
  - [Summary](#summary-3)
- [Text editors](#text-editors)
  - [VS Code](#vs-code)
  - [Atom](#atom)
  - [PyCharm](#pycharm)
  - [Sublime Text](#sublime-text)
  - [Summary](#summary-4)
- [Conclusion](#conclusion)
- [Social Media Resources](#social-media-resources)
- [References and further reading](#references-and-further-reading)
<hr>

# Introduction
In this post, I gathered most of what I'd learned about network automation so far in a structured and concise manner. The main audience of this guide are engineers who want to start automating their networks but are overwhelmed by the abundance of terms, tools, and concepts.

{{< figure src="https://imgs.xkcd.com/comics/automation.png" alt="xkcd - Automation" caption="Automation" attr="xkcd" attrlink="https://xkcd.com/1319/">}}

# DevOps
When trying to grasp a new concept or technology I find it helpful to spend some extra time learning about the subject's origins. It gives context and perspective which are crucial for grasping something complex. So before diving into the network automation topic I'd like to drop a few lines about where it all came from.

Of course, in some way network automation has been around for quite a long time. You can remember such examples as using [Expect](https://en.wikipedia.org/wiki/Expect) to connect to network devices and issue commands or writing [EEM](https://en.wikipedia.org/wiki/Embedded_event_manager) scripts on Cisco routers, or maybe running scripts which retrieve useful information from network devices via SNMP. So what has changed since then? Why network automation is such a hot topic right now? My answer is &mdash; the rise of [DevOps](https://en.wikipedia.org/wiki/DevOps) movement.

{{< figure src="images/2020-10-devops-loop.png" alt="DevOps" caption="DevOps Lifecycle" >}}

DevOps term first emerged somewhere around 2008 and 2009 and is attributed to Patrick Debois. In 2009 he held an event called [DevOpsDays](https://devopsdays.org/) which main purpose was to bring together developers and system administrators and discuss the ways of how to bridge the gap between the two. This gained enough traction and the DevOps became a buzzword.

But what is DevOps? There is no academic definition, but the most common one states that it is a set of tools, practices, and philosophies aimed to bridge the gap between the development and operational teams in order to build quality software faster.

{{< alert message="If you want to learn more about DevOps I recommend this 👉  [awesome list](https://github.com/AcalephStorage/awesome-devops)." type="info" badge="Note" >}}

DevOps has many aspects to it but I'd like to focus on three key practices which it brings: [Infrastructure as Code](#infrastructure-as-code), [CI/CD](#cicd), and [version control](#version-control).

## Infrastructure as Code
According to [Wikipedia](https://en.wikipedia.org/wiki/Infrastructure_as_code), IaC is ...
>... the process of managing and provisioning computer data centers through machine-readable definition files, rather than physical hardware configuration or interactive configuration tools.

What this really means is that you have a bunch of text files where you define the desired state of your infrastructure: number of VMs, their properties, virtual networks, IP addresses etc. etc. Then these files are processed by IaC tool or framework ([Terraform](https://www.terraform.io/), [SaltStack](https://www.saltstack.com/), [Ansible](#ansible) are just a few examples) which translates that declared state into actual API calls and configuration files and applies it to the infrastructure in order to bring it to the desired state. This gives you a level of abstraction since you focus only on the resulting state and not on how to achieve it. Here I should mention one of the key features of the IaC approach which is [idempotence](https://en.wikipedia.org/wiki/Idempotence). This feature allows you to run an IaC tool repeatedly and if something is already in the desired state it won't touch it. For example, if you declare that a certain VLAN should be configured on a switch and it is already there when you run an IaC tool against that switch it won't try to configure anything.

Treating your infrastructure as text files enables you to apply the same tools and practices to infrastructure as one would apply to any other software project. CI/CD and version control are the main examples here.

## CI/CD
CI/CD stands for Continuous Integration / Continuous Delivery or Deployment. Let's look into each component in more detail.

**Continuous Integration** &mdash; a process of frequent (up to several times a day) merges of code changes to the main code repository. These merges are accompanied by various tests and quality control processes such as unit and integration tests, [static code analysis](https://en.wikipedia.org/wiki/Static_program_analysis), extraction of documentation from the source code, etc. This approach allows to integrate code changes frequently by different developers therefore mitigating risks of integration conflicts.

**Continuous Delivery** &mdash; extension of CI which takes care of automating the release process (e.g. packaging, image building, etc). Continuous delivery allows you to deploy your application to the production environment at any time.

**Continuous Deployment** &mdash; extension of continuous delivery, but this time deployment to production is also automated.

## Version control
A version control system is a foundation for any automation project. It tracks changes in your project files (source code), logs who made those changes, and enables CI/CD workflows.

Today [Git](#git) is the de facto standard in version control systems. Essentially Git is just a command-line tool (though very powerful) that manages project versioning by creating and manipulating metadata kept in a separate hidden directory in the project's [working directory](https://en.wikipedia.org/wiki/Working_directory). But all the magic comes with web-based source control systems such as [GitHub](https://github.com/) or [GitLab](https://about.gitlab.com/) among others.

{{< alert message="Many people confuse Git and GitHub because the latter became a [generic term](https://en.wikipedia.org/wiki/Generic_trademark) for version control systems." type="info" badge="Note" >}}

Let's suppose you are on a team of developers working on a project hosted on GitHub. Your typical [workflow](https://guides.github.com/introduction/flow/)  will go like this:
* You want to make changes to the source code. It may be a bug fix or a new feature. You create a new branch from the main one and start making [commits](#commit). This doesn't affect the main branch in any way.
* When the work seems to be done it's time to create a [pull request](#pull-merge-request). PR is a way to tell other developers (project maintainers) that you want to merge your branch with the main one. PR creation can trigger CI tests if they are configured. After all CI tests pass successfully the code is reviewed by other team members. If CI tests fail or something needs to be improved the PR will be rejected. Then you can fix your code in the same branch and create another PR. 
{{< alert message="Usually, PR's are never merged automatically and someone needs to make the final decision." type="info" badge="Note" >}}
* If everything is good your branch will be merged with the main one.
* If CD is configured merging with the main branch triggers deployment to the production environment.

## Summary
In this section, I gave a brief overview of what DevOps is and it's main tools and practices. In the next section, I'll try to explain how it can be applied to networks and network automation.

# NetDevOps
Now that you've read the previous section you should guess that NetDevOps is just a DevOps approach applied to networking. All of the aforementioned key DevOps practices can be aligned with the network: device configurations can be templated (IaC) and put into a version control system where CI/CD processes are applied.

Below is the sample diagram representing the whole process.

{{< figure src="images/2020-10-netdevops-pipeline.png" alt="DevOps" caption="NetDevOps Pipeline" >}}

The workflow starts with a network operator introducing a change (1) either to the *Source of Truth* or to the *configuration templates*. So what are those exactly?

**Source of Truth** is a database (e.g. SQL DB or plain text files) where constants such as VLAN numbers and IP addresses are stored. Actually, this can be several databases &mdash; you can get your IP information from [IPAM](https://en.wikipedia.org/wiki/IP_address_management) and interface descriptions from [DCIM](https://en.wikipedia.org/wiki/Data_center_management#Data_center_infrastructure_management) ([Netbox](https://netbox.readthedocs.io/en/stable/) is a great example that can do both). The key idea here is that each database must be the [single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth) for the particular piece of information, so when you need to change something you change it only in one place.

**Configuration templates** are just text files written in a templating language of choice (I guess [Jinja2](https://jinja.palletsprojects.com/en/2.11.x/) is the most popular one). When combined with the info from the SoT they produce device-specific config files. Templating allows you to break down device configurations into separate template files each one representing a specific config section and then mix and match them to produce configurations for different network devices. Some templates may be reused across multiple devices and some may be created for specific software versions or vendors.

Making changes to the SoT or the templates triggers (2) the rest of the process. First, both those sources of information are used by the configuration management system (e.g. Ansible, more on this later) to generate the resulting configuration files to be applied to the network devices. These configs then must be validated (3). Validation usually includes several automated tests (syntax check, use of [modeling software](https://www.batfish.org/), spinning up virtual devices) and a peer review. If validation fails some form of feedback is given to the initiator of change (4) so they can remediate and start the whole process again. If validation is passed resulting configs can be deployed to the production network (5).

Of course, the presented workflow is rather schematic and aims to give a general idea of the network automation process and the role of the core components in it.

In the next section, I'm going to look at the tools and technologies one can utilize in network automation workflows.

# Data Models and Encodings
Understanding how data can be structured and encoded is very important in programming in general and network automation in particular.

### YANG & Openconfig
YANG (Yet Another Next Generation) is a data modeling language originally developed for [NETCONF](#netconf--restconf) and defined in [RFC 6020](https://tools.ietf.org/html/rfc6020) and then updated in [RFC 7950](https://tools.ietf.org/html/rfc7950). YANG and NETCONF can be considered as successors to [SMIng](https://tools.ietf.org/html/rfc3780) and [SNMP](https://en.wikipedia.org/wiki/Simple_Network_Management_Protocol) respectively. 

>YANG provides a format-independent way to describe a data model that can be represented in XML or JSON.
>
> <cite>Jason Edelman, Scott S. Lowe, Matt Oswalt. Network Programmability and Automation, p. 183</cite>

There are [hundreds](https://github.com/YangModels/yang) of YANG data models available both [vendor-neutral](https://github.com/openconfig/public) and vendor-specific. The [YANG catalog](https://yangcatalog.org/) web site can be helpful if you need to find data models relevant to your tasks.

Because of this abundance of data models and lack of coordination between standards developing organizations and vendors it seems that YANG and NETCONF are going the same path SNMP went (i.e. used only for data retrieval, but not configuration). [OpenConfig](https://www.openconfig.net/) workgroup tries to solve this by providing vendor-neutral data models, but I think that [Ivan Pepelnjak's](https://blog.ipspace.net/2018/01/use-yang-data-models-to-configure.html) point from 2018 stating that "*seamless multi-vendor network device configuration is still a pipe dream*" still holds in 2020.

### XML
[XML](https://en.wikipedia.org/wiki/XML) (eXtensible Markup Language) although a bit old is still widely used in various APIs. It uses tags to encode data hence is a bit hard to read by humans. It was initially designed for documents but is suitable to represent arbitrary data structures.

You can refer to this [tutorial](https://www.w3schools.com/xml/) to learn more about XML.

Let's see how this sample CLI output of Cisco IOS `show vlan` command can be encoded with XML:
```
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi3/4, Gi3/5, Gi4/11

<...>

VLAN Type  SAID       MTU   Parent RingNo BridgeNo Stp  BrdgMode Trans1 Trans2
---- ----- ---------- ----- ------ ------ -------- ---- -------- ------ ------
1    enet  100001     1500  -      -      -        -    -        0      0
```

This is how it looks in XML:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<root>
	<vlans>
		<1>
			<interfaces>GigabitEthernet3/4</interfaces>
			<interfaces>GigabitEthernet3/5</interfaces>
			<interfaces>GigabitEthernet4/11</interfaces>
			<mtu>1500</mtu>
			<name>default</name>
			<said>100001</said>
			<shutdown>false</shutdown>
			<state>active</state>
			<trans1>0</trans1>
			<trans2>0</trans2>
			<type>enet</type>
			<vlan_id>1</vlan_id>
		</1>
	</vlans>
</root>
```


### YAML
[YAML](https://en.wikipedia.org/wiki/YAML) (YAML Ain’t Markup Language) is a human-friendly data serialization format. Because YAML is really easy to read and write it is widely used in modern automation tools  for configuration files and even for defining automation tasks logic (see Ansible).

You can refer to this [tutorial](https://rollout.io/blog/yaml-tutorial-everything-you-need-get-started/) to learn more about YAML.

Here is a `show vlan` output from previous subsection encoded in YAML:
```yaml
---
vlans:
  '1':
    interfaces:
    - GigabitEthernet3/4
    - GigabitEthernet3/5
    - GigabitEthernet4/11
    mtu: 1500
    name: default
    said: 100001
    shutdown: false
    state: active
    trans1: 0
    trans2: 0
    type: enet
    vlan_id: '1'
```
Bonus: a [collection](https://noyaml.com/) of YAML shortcomings.

### JSON
JSON (JavaScript Object Notation) is a modern data encoding format defined in [RFC 7159](https://tools.ietf.org/html/rfc7159.html) and widely used in web APIs. It's lightweight, human-readable, and is more suited for data models of modern programming languages than XML.

You can refer to this [tutorial](https://www.w3schools.com/js/js_json_intro.asp) to learn more about JSON.

Here is the sample data from previous sections encoded in JSON:

```json
{
	"vlans": {
		"1": {
			"interfaces": [
				"GigabitEthernet3/4",
				"GigabitEthernet3/5",
				"GigabitEthernet4/11"
			],
			"mtu": 1500,
			"name": "default",
			"said": 100001,
			"shutdown": false,
			"state": "active",
			"trans1": 0,
			"trans2": 0,
			"type": "enet",
			"vlan_id": "1"
		}
	}
}
```
As you can see it's almost as easy to read as YAML, however, native JSON doesn't support comments making it not very suitable for configuration files.

### Summary
Here is a summary table representing the key properties of the described data formats.

|  | XML | YAML | JSON |
| --- | --- | --- | --- |
| Human readable | not really | yes | yes |
| Purpose | documents, APIs | configuration files | APIs |
| Python libs | [xml](https://docs.python.org/3/library/xml.html), [lxml](https://lxml.de/) | [PyYAML](https://pyyaml.org/wiki/PyYAMLDocumentation) | [json](https://docs.python.org/3/library/json.html) |

There are online tools like [this one](https://codebeautify.org/yaml-to-json-xml-csv) to convert data between all three formats.

# Technologies
This section is quite opinionated and aims to introduce you to the essential tools leaving behind many others for the sake of brevity. I highly recommend to take a look at the [Awesome Network Automation](https://github.com/networktocode/awesome-network-automation) list later.

## Python
Python is a go-to programming language when it comes to network automation. All of the popular network automation tools and libraries are written in Python.

{{< figure src="https://imgs.xkcd.com/comics/python.png" alt="xkcd - Python" caption="Python" attr="xkcd" attrlink="https://xkcd.com/353/">}}

Due to its gentle learning curve and immense popularity (second most used language on GitHub after JavaScript as of the time of writing), Python is a great choice to get started with programming.

Python basics are out of the scope of this guide. I've supplied several online resources that can help with learning Python in the [References and further reading](#references-and-further-reading) section.

To effectively use Python to solve basic network automation problems you will need to learn this set of skills:
* Setting up Python on your system
* Using virtual environments and installing packages with Pip
* Understanding of the basic Python concepts such as:
  * Variables
  * Data structures
  * Functions
  * Imports

As you can see it's not overwhelming and I encourage you to spend some time on it because it'll make your automation journey so much easier.

## Ways of interacting with network devices programmatically
There are two major ways of accessing network devices programmatically: CLI and API.
### CLI
For a long time, the only API of network devices was CLI which is designed to be used by humans and not automation scripts. These are the main drawbacks of using CLI as an API:
* **Inconsistent output**  
  The same command outputs may differ from one NOS (Network Operating System) version to another.
* **Unstructured data**  
  Data returned by command execution in CLI is plain text, which means you have to manually parse it (i.e. CLI scraping)
* **Unreliable command execution**  
  You don't get a status code of an executed command and have to parse the output to determine whether the command succeeded or failed.

Despite more and more networking vendors begin to include API support in their products it's unlikely that you won't have to deal with CLI during your network automation journey.

To parse CLI output [regular expressions](https://en.wikipedia.org/wiki/Regular_expression) are used. Not a very user-friendly technology to put it mildly.

>“I don’t know who you are. I don’t know what you want. If you are looking for technical help, I can tell you I don’t have any time. But what I do have are a very particular set of regexes. Regexes I have acquired over a very long career. Regexes that are a nightmare for people like you to debug. If you leave me alone now, that’ll be the end of it. I will not look for you, I will not pursue you, but if you don’t, I will look for you, I will find you and I will use them in your code.”
>
><cite>[Quotes from the Cloudiest WebScaliest DevOps Teams](https://daily-devops.tumblr.com/post/155993696387/i-dont-know-who-you-are-i-dont-know-what-you)</cite>

Fortunately, there are a lot of tools and libraries today that make [CLI scraping](#connection-management-and-cli-scraping) easier by doing a lot of the [regex heavy lifting](#parsing).

### APIs
If you are lucky and devices in your network have an API or maybe are even driven by SDN controller this section is for you. Network APIs fall into two major categories: HTTP-based and NETCONF-based.

#### RESTful APIs
[REST](https://en.wikipedia.org/wiki/Representational_state_transfer) stands for Representational State Transfer and defines a set of properties and constraints which an API must conform to in order to be called RESTful.

{{< figure src="images/2020-10-not-restful.jpg" width=400 alt="geek & poke - Insulting made easy" caption="Insulting made easy" attr="geek & poke" attrlink="http://geek-and-poke.com/geekandpoke/2013/6/14/insulting-made-easy">}}

{{< alert message="HTTP-based APIs may be RESTful and non-RESTful. Non-RESTful HTTP-based APIs are left out of scope because they are less common." type="info" badge="Note" >}}

RESTful APIs are quite easy to use and understand because they are based on HTTP protocol. Basically, RESTful API is just a set of HTTP URLs on which you can make GET and/or POST requests except for returned data is encoded in JSON or XML, not HTML. Since RESTful APIs are HTTP-based they are stateless by nature. This means each request is independent of another and has to supply all the needed information to be properly processed.

To explore RESTful APIs you can use tools such as [cURL](https://curl.haxx.se/) or [Postman](https://www.postman.com/), but when you are ready to write some code utilizing RESTful API you can use a Python library called [requests](https://requests.readthedocs.io/en/master/).

There are several mock REST APIs online which you can use for practice. For example, [kanye.rest](https://kanye.rest/) and [JSONPlaceholder](https://jsonplaceholder.typicode.com/).

#### NETCONF & RESTCONF
[NETCONF](https://tools.ietf.org/html/rfc6241) is a protocol specifically designed for managing network devices. Unlike REST it uses SSH as transport and is stateful as a result. The other key differences of NETCONF are clear delineation between configurational and operational data and the concept of configuration datastores. NETCONF defines three datastores: running configuration, startup configuration, and candidate configuration. You may be familiar with all three of them in the context of network devices. The candidate configuration concept allows to deliver a configuration change consisting of many commands as one transaction. This means that if only one command in a transaction fails the transaction does not succeed avoiding a situation when the partial configuration is applied.

Exploring NETCONF APIs is not as easy and straightforward as with RESTful APIs. To do so you need to establish an interactive SSH session to a device and send lengthy XML-encoded commands. To access NETCONF APIs programmatically there is a [ncclient](https://github.com/ncclient/ncclient) Python library.

[RESTCONF](https://tools.ietf.org/html/rfc8040) is another standard protocol which implements a subset of NETCONF functionality (e.g. transactions are not supported) and uses HTTP as transport and is RESTful.

When choosing between [NETCONF and RESTCONF](https://www.ipspace.net/kb/CiscoAutomation/070-netconf.html) it's [advised](https://www.claise.be/netconf-versus-restconf-capabilitity-comparisons-for-data-model-driven-management-2/) to use the former for direct interactions with network devices and the latter for interactions with SDN-controllers and/or orchestrators.

#### gRPC & gNMI
[gNMI](https://tools.ietf.org/html/draft-openconfig-rtgwg-gnmi-spec-01) is a new addition to network management protocols based on Google's [gRPC](https://en.wikipedia.org/wiki/GRPC) and developed by [OpenConfig](https://www.openconfig.net/) working group. It is considered to be a more robust successor of NETCONF and supports [streaming telemetry](https://blogs.cisco.com/developer/getting-started-with-model-driven-telemetry).

Because gNMI is not yet as mature as NETCONF it is not very well supported in Python. Though there are a couple of libraries you can look into: [cisco-gnmi](https://github.com/cisco-ie/cisco-gnmi-python) and [pygnmi](https://github.com/akarneliuk/pygnmi).

#### Summary
Here is a summary table representing the key properties of network API types.

|                     | REST       | NETCONF  | RESTCONF | gNMI |
| ------------------- | ----       | -------  | -------- | ---   |
| RFC                 | -          | [RFC 6241](https://tools.ietf.org/html/rfc6241) | [RFC 8040](https://tools.ietf.org/html/rfc8040) | [Draft](https://tools.ietf.org/html/draft-openconfig-rtgwg-gnmi-spec-01) |
| Transport           | HTTP       | SSH      | HTTP | gRPC (HTTP/2.0) |
| Data encoding       | XML, JSON  | XML     | XML, JSON | ProtoBuf (binary) |
| Transaction support | ❌          | ✅        | ❌          | ✅  |
| Python libs         | [requests](https://requests.readthedocs.io/en/master/) | [ncclient](https://github.com/ncclient/ncclient) | [requests](https://requests.readthedocs.io/en/master/) | [cisco-gnmi](https://github.com/cisco-ie/cisco-gnmi-python), [pygnmi](https://github.com/akarneliuk/pygnmi) |

## Git
This section covers basic Git usage and terminology. But first, I'd like to highlight several reasons why you should care about Git and version control in the first place.

{{< figure src="https://imgs.xkcd.com/comics/git.png" alt="xkcd - Git" caption="Git" attr="xkcd" attrlink="https://xkcd.com/1597/">}}

### Why use Git?

* **Visibility & control**  
  By placing your scripts, configuration templates, or even device configurations in Git you can start tracking all the changes and rollback to previous versions if needed.
* **Experimenting**  
  When working on a new feature it's very convenient to create a new branch in the same Git repository rather than copy the whole working directory to a new place.
* **Teamwork**  
  Sooner or later you'll need to share your work with your teammates. Git is the best tool to collaborate without the need to send each other file copies.
* **CI/CD**  
  CI/CD processes are based around source control. Events such as commits or branch merging trigger CI/CD pipelines.

### Terminology
#### Repository
Git repository is a project's directory containing all the project files plus a hidden directory named `.git` where all the Git metadata (change history, configuration, etc.) resides. In the example below `example-repo` is a Git repository.
```
example-repo
├── .git
│   ├── ...
├── file1
└── file2
...
```
Git repository consists of three "trees". The first one is your `Working Directory` or `Working Tree` where all the files you work with stay. The second one is the `Index` where you put files to be committed by issuing a `git add` command and finally the `HEAD` which points to the last commit you've made. `Index` and `HEAD` are stored in a `.git` subdirectory and you never interact with them directly.

Git repository can be local or remote. All the changes you make to the working directory are stored in a local repository. The synchronization between local and remote repositories is always done manually.

#### Working directory
Think of a Git working directory as a sandbox where you make changes to your project's files. Here is a good explanation from the [official documentation](https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified#_git_reset):
>Finally, you have your working directory (also commonly referred to as the “working tree”). The other two trees store their content in an efficient but inconvenient manner, inside the .git folder. The working directory unpacks them into actual files, which makes it much easier for you to edit them. Think of the working directory as a sandbox, where you can try changes out before committing them to your staging area (index) and then to history.
#### Staging
When you want to put your changes to Git history, i.e. make a commit, you choose which files you want to commit and issue a `git add` on them. This way you can put changes in different files to different commits thus grouping them by their function or meaning. Staging also enables you to review your changes before committing.
#### Commit
Commit saves staged changes to the local Git repository. It also includes metadata such as the author, the date of the commit, and a [commit message](https://chris.beams.io/posts/git-commit/).
#### Branch
When you feel like adding a new feature or want to [refactor](https://en.wikipedia.org/wiki/Code_refactoring) the existing code it's a good idea to create a new branch, do your work there, and then merge it back to the main branch. This gives you confidence that you wouldn't break the existing code. It also allows different developers to work on the same codebase without blocking each other.

Git [branching](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell) is extremely lightweight and allows to create new branches and switch between them almost instantaneously.
#### Pull (merge) request
[Pull](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/about-pull-requests) (GitHub) or [merge](https://docs.gitlab.com/ee/user/project/merge_requests/) (GitLab) request is a feature specific to web-based Git-repository managers that provides a simple way to submit your work to the project. There is a lot of confusion about why it's called a pull request and not a push request as you want to add your changes to the repo. The reasoning behind this naming is simple. When you create a pull request you actually request the project's maintainer to pull your submitted changes to the repository.
### Basic usage
#### Command line
To start using Git in the command line I recommend taking a look at [this](https://rogerdudler.github.io/git-guide/) simple but useful guide for the beginners by Roger Dudler.
#### Dealing with mistakes
Eventually, you will screw something up (e.g. make a commit to the wrong branch). For such situations, there is a good [resource](https://ohshitgit.com/) that can help with common Git headaches.

#### .gitignore
To make Git [ignore](https://git-scm.com/docs/gitignore) specific files or even subdirectories you can list them in a special file called `.gitignore`. This is extremely useful when you want to keep your remote repository clean of temporary files or files containing sensitive information (e.g. passwords).

## Docker and containers
Linux containers have been around for quite a long time (and [chroot and jail](https://en.wikipedia.org/wiki/Chroot) even longer) but Docker was what made it popular and accessible.

{{< figure src="https://imgs.xkcd.com/comics/containers.png" alt="xkcd - Containers" caption="Containers" attr="xkcd" attrlink="https://xkcd.com/1988/">}}

Containers allow to run software in an isolated environment, but contrary to VMs each container doesn't need a full-blown OS to run. This makes containers more resource-effective in terms of CPU, RAM, and storage not to mention that you don't need to maintain a separate OS for each container as with VMs.

Docker (Docker Engine, to be precise) is a software that creates, deletes, and runs containers. You can think of it as similar to ESXi. Docker's ease of use is what made containers so popular.

### Why use Docker?
What are the main reasons to use containers in general:
* **Isolation**  
  An application running inside a container has all the libraries of specific versions it needs. If another application needs other versions of the same libraries just use another container image.
* **Portability**  
  This comes as a result of the previous point. If you've managed to run your application inside a container you can easily run it anywhere where Docker is installed because the application environment doesn't change.
* **Scalability**  
  You can easily create lots of containers to distribute load between them (see [Kubernetes](https://en.wikipedia.org/wiki/Kubernetes))
* **Performance**  
  Faster to create, quicker to start, consume fewer resources.
* **Community**  
  There are millions of ready-made docker images on [dockerhub](https://hub.docker.com/) which you can use directly or build your own images upon them.

### Basic Terminology
To familiarize yourself with Docker you need to know the basic terminology and tools.

{{< alert message="Containerization topic is really huge and I don't want to go deep into technicalities here. If you want to learn more about Docker and containers I can recommend a book called [Docker Deep Dive](https://www.amazon.com/Docker-Deep-Dive-Nigel-Poulton-ebook-dp-B01LXWQUFF/dp/B01LXWQUFF/) by Nigel Poulton" type="info" badge="Note" >}}

#### Images
  To continue the VM analogy you can think of Docker images as VM templates. An image contains all the necessary files to run a container and can hold predefined parameters, such as which TCP ports to expose. When you start a container you can override these parameters and add your own. You can run multiple containers from a single image. It is crucial to understand that containers themselves are ephemeral or stateless. This means that when you make any changes to the container's filesystem when it's running it won't persist after you restart that container. If you need persistency you should use external storage solutions such as volumes.
#### Layers
  Docker images are made of layers. Essentially, a layer is a bunch of files created after running a command in a Dockerfile. If to build another image you use the same commands in a Dockerfile Docker will just reuse the previously created layer. This speeds up image building and saves storage space.
#### Tags
  When you are using different versions of the same image you need a way to distinguish between them. That's where tags come in handy. When creating an image or pulling one from a repository you should specify a tag (e.g. python:3.8.5-slim-buster where 3.8.5-slim-buster is a tag), if you don't the `latest` tag will be used. Please note that `latest` has no special meaning, it's just a tag which not necessarily denotes the latest version of the image.
#### Volumes
  When starting a container you can specify directories or files to be mounted inside the container filesystem. Each such directory or file is called a volume. Volumes come in handy when you need the data to persist or to be shared among different containers. It's also an easy way to insert a custom config file into a container, or to use a container as a runtime environment for your script which is mounted inside a container so you can test it without the need to rebuild the container image.

#### Dockerfiles
  [Dockerfile]((https://docs.docker.com/engine/reference/builder/)) is a text file with a set of instructions on how to build an image. It consists of the commands specifying such things as what another image should be used as a base image, what files to copy into the image, what packets to install, and so on.

#### Docker Compose
  [Docker-compose](https://docs.docker.com/compose/) is a simple orchestrator for Docker containers. To start several containers without docker-compose you need to type a lot of long commands with a multitude of arguments. Docker-compose allows you to specify all those arguments in a simple and clean manner of the YAML file. It also allows you to specify dependencies between containers, i.e. in what order they should start. But even if you need to run only one container it's better to write a `docker-compose.yml` just to place all those arguments on record.

### Docker use cases for network automation
When talking about network automation Docker can come in handy in two major ways:
* You can build your own automation tools to run in Docker making them portable and automating the packaging process as a result.
* Most modern tools have dockerized versions that you can run by entering just one command. This one is really useful when you want to follow a tutorial or to try out a new tool but doesn't want to waste time on setup (which can be quite nontrivial)

Here is a simple workflow to build and run your own Docker container:
* Write a `Dockerfile`
* Write a `docker-compose.yml` file
* Run `docker-compose up`

There are tons of articles on how to write Dockerfiles and use docker-compose. But I guess at first you will use prebuilt images just to get familiar with Docker and you will need to know some basic CLI commands to start, stop. and monitor Docker containers. [Here](https://pagertree.com/2020/01/06/docker-cheat-sheet/) is a good write up on the essential Docker commands you will find useful from the start.

# Automation Tools
Here I would like to give you a quick overview of the most popular and prominent network automation tools.

## Connection Management and CLI Scraping
### Netmiko  
[Netmiko](https://github.com/ktbyers/netmiko) is a Python library based on [paramiko](http://www.paramiko.org/) and aimed to simplify SSH access to network devices. Created by Kirk Byers in 2014 this Python library stays the most popular and widely used tool for managing SSH connections to network devices.

### Scrapli 
[Scrapli](https://github.com/carlmontanari/scrapli) is a somewhat new python library (first release in 2019) that solves the same problems as Netmiko but aims to be "*as fast and flexible as possible"*.

## Parsing
### TextFSM and NTC Templates
[TextFSM](https://github.com/google/textfsm) is a Python module created by Google which purpose is to parse semi-formatted text (i.e. CLI output). It takes a template file and text as input and produces structured output. [NTC templates](https://github.com/networktocode/ntc-templates) is a collection of TextFSM templates for a variety of networking vendors. TextFSM can be used in conjunction with [netmiko](https://pynet.twb-tech.com/blog/automation/netmiko-textfsm.html) and [scrapli](https://github.com/carlmontanari/scrapli#textfsmntc-templates-integration).

### TTP (Template Text Parser)
[TTP](https://ttp.readthedocs.io/en/latest/Overview.html) is the newest addition to the text parsing tools. It's also based on templates that resemble Jinja2 syntax but work in reverse. A simple TTP template looks much like the text it is aimed to parse but the parts you want to extract are put in {{ curly braces }}. It doesn't have a collection of prebuilt templates but given its relative ease of use, you can quickly create your own.

### PyATS & Genie
[These internal Cisco tools](https://developer.cisco.com/docs/pyats/) were publicly released a few years back and continue to develop rapidly. PyATS is a testing and automation framework. It has a lot to it and I encourage you to learn about it on Cisco DevNet resources. Here I would like to focus on two libraries within the PyATS framework: [Genie parser](https://github.com/CiscoTestAutomation/genieparser) and [Dq](https://pubhub.devnetcloud.com/media/genie-docs/docs/userguide/utils/index.html#dq). The first one as the name implies is aimed to parse CLI output and has a [huge collection](https://pubhub.devnetcloud.com/media/genie-feature-browser/docs/#/parsers) (2000+) of ready-made parsers for various devices (not limited to Cisco). The second one, Dq, is a great time saver when you need to access the parsed data. Often parsers such as Genie return data in complex data structures (e.g. nested dictionaries) and to access something you would need loops if statements and a strong understanding of where to look. With Dq, you can make queries without much caring of where in a nested structure your data resides.

## Configuring devices
### NAPALM
As the official documentation states
>NAPALM (Network Automation and Programmability Abstraction Layer with Multivendor support) is a Python library that implements a set of functions to interact with different network device Operating Systems using a unified API.

#### Supported devices
As of the time of writing NAPALM supported the following network operating systems:

* Arista EOS
* Cisco IOS
* Cisco IOS-XR
* Cisco NX-OS
* Juniper JunOS

#### Working with device configuration
With NAPALM you can push [configuration](https://napalm.readthedocs.io/en/latest/tutorials/first_steps_config.html) and retrieve operational data from  devices. When manipulating device configuration you have two options:
* **Replace** the entire running configuration with a new one
* **Merge** the existing running configuration with a new one

Replace and merge operations don't apply at once. Before committing the new configuration you can compare it to the currently running configuration and then either commit or discard it. And even after applying the new config, you have an option to rollback to the previously committed configuration if the network OS supports it. 

#### Validating deployment
The ability to retrieve operational data from devices brings a powerful NAPALM feature called compliance report or [deployment validation](https://napalm.readthedocs.io/en/latest/validate/index.html). To get a compliance report you need to write a YAML file describing the desired state of the device and tell NAPALM to use it against the device with a `compliance_report` method.

#### Integration with other tools
Being a Python library NAPALM can be used directly in Python scripts or integrated with Ansible ([napalm-ansible](https://github.com/napalm-automation/napalm-ansible) module), Nornir ([nornir_napalm](https://github.com/nornir-automation/nornir_napalm) plugin) or SaltStack (native support).

### Ansible
[Ansible](https://en.wikipedia.org/wiki/Ansible_(software)) is a comprehensive automation [framework](https://www.geeksforgeeks.org/software-framework-vs-library/) initially developed to provision Linux servers. Due to its agentless nature, Ansible soon became very popular among network engineers. Contrary to the agent-based systems like [Chef](https://en.wikipedia.org/wiki/Chef_(software)) and [Puppet](https://en.wikipedia.org/wiki/Puppet_(company)), Ansible executes Python code on the target systems to perform its tasks. Therefore it only requires the target system to run SSH and Python. But how does it align with the network devices which cannot execute Python code? To solve this Ansible executes its network modules locally on the [control node](https://docs.ansible.com/ansible/latest/network/getting_started/basic_concepts.html#control-node). 

#### Ansible Galaxy
To interact with different network platforms Ansible uses plugins grouped in [collections](https://docs.ansible.com/ansible/latest/collections/index.html#list-of-collections). To install these collections you can use [Ansible Galaxy](https://galaxy.ansible.com/search?deprecated=false&tags=networking&keywords=&order_by=-download_count&page=1) which is like [DockerHub](https://hub.docker.com/) or [PyPi](https://pypi.org/) for Ansible, where users can share Ansible [roles](#roles) and plugins.

#### Terminology
Typical Ansible automation project consists of the following building blocks.

##### Inventory
Inventory file lists managed network devices, their hostnames or IP addresses, and optionally other variables like access credentials. Ansible can use Netbox as an inventory information source via a [plugin](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html).
##### Playbooks
A playbook defines an ordered list of tasks to be performed against managed devices. It also can define which roles should be applied to devices.
##### Roles
As the [official documentation](https://docs.ansible.com/ansible/latest/network/getting_started/network_roles.html#understanding-roles) states
>Ansible roles are basically playbooks broken up into a known file structure.

Roles allow you to group tasks and variables in separate directories. This makes an Ansible project more organized and lets you reuse those roles on different groups of managed hosts more easily.

You can create roles according to different configuration sections: one for routing, another for basic settings such as NTP and DNS servers, etc. etc. Then you can apply those roles to different groups of devices. For example, routing is needed only on the core switches, and basic settings should be applied to all devices.

#### Pros & Cons
Ansible uses its own [DSL](https://en.wikipedia.org/wiki/Domain-specific_language) based on [YAML](#yaml) to describe its playbooks logic. This design decision can be considered a two-edged sword. It requires minimal learning to solve simple tasks, but when you need to write something more complex it quickly becomes quite cumbersome and hard to debug.

Speed and scalability are other aspects where Ansible doesn't shine in the context of network automation. 

In my opinion, Ansible is a great starting point for your network automation journey, as it is easy to learn and gives you a good idea of what modern automation tools are about. As John McGovern from CBT Nuggets [said](https://youtu.be/uQAaA_-lb7k?t=177) "Ansible is like a CCNA for network automation".

Another Ansible advantage is that it can be used as a single automation solution for the whole IT infrastructure.

### Nornir
Nornir was initially created by David Barroso, author of NAPALM.
>Nornir is an automation framework written in python to be used with python.
>
><cite>Official Nornir [documentation](https://nornir.readthedocs.io/en/latest/index.html)</cite>

The last part of the definition is key here. Unlike Ansible, Nornir uses pure Python for describing its tasks (Nornir tasks are essentially Python functions). This makes Nornir far more flexible, [fast](https://networklore.com/ansible-nornir-speed/), and easy to [debug](https://nornir.readthedocs.io/en/latest/howto/ipdb_how_to_use_it_with_nornir.html).

{{< alert message="Another aspect of Nornir being purely Python is that when you learn Nornir you also learn Python." type="info" badge="Note" >}}


Nornir is a pluggable system and starting with version 3.0 it comes only with the very basic plugins. A list of Nornir plugins can be found [here](https://nornir.tech/nornir/plugins/). Plugins are installed with Python's standard package manager [pip](https://pip.pypa.io/en/stable/).

Like Ansible, Nornir has a concept of inventory, which also can be written in YAML ([YAMLInventory](https://github.com/nornir-automation/nornir_utils) plugin), where you put host and group variables. You can also use existing Ansible inventory files ([nornir_ansible](https://github.com/carlmontanari/nornir_ansible)) or take your inventory information directly from Netbox with [nornir_netbox](https://github.com/wvandeun/nornir_netbox).

To interact with network devices, Nornir can leverage [NAPALM](#napalm), [netmiko](#netmiko), and [scrapli](#scrapli) libraries via respective plugins.

## Summary
All of the described tools have their advantages and use cases. I would recommend starting with more high-level tools such as NAPALM, Ansible, or Nornir.

# Text editors
A text editor is a piece of software you will spend most of your time with while automating networks. Here I would like to make an overview of the most popular modern text editors.
## VS Code
Good or bad, but today's text editor market is clearly [dominated](https://blog.robenkleene.com/2020/09/21/the-era-of-visual-studio-code/) by [Visual Studio Code](https://code.visualstudio.com/). It has a great and ever-expanding collection of plugins, nice UI, built-in Git support, intelligent code completion, you name it.

VS Code is a free and open-source text editor built on [Electron](https://www.electronjs.org/) and owned by Microsoft. It was initially released in 2015.

## Atom
[Atom](https://atom.io/) is another highly customizable open-source text editor created by GitHub. Since GitHub was acquired by Microsoft, Atom now is also a Microsoft product.

Atom also is free, open-source, and built on Electron. It was initially released in 2014.

## PyCharm
[PyCharm](https://www.jetbrains.com/pycharm/) is a full-blown Python IDE by JetBrains. I've heard a lot of praise towards it in the context of Python development, but never tried it myself. PyCharm is shipped in two versions: full-featured Professional ($89/year subscription license) and less functional but free Community Edition.

PyCharm was initially released in 2010.

## Sublime Text
[Sublime](https://www.sublimetext.com/) is the oldest text editor on the list. It has some great features to itself like multiline editing and "Go To Anything" command which allows to quickly jump to the specific part of the text in any open tab. It also can be extended with plugins, but the package manager is not included by default and you'll have to install it manually first.

Sublime Text is a proprietary paid software written in C++ and initially released in 2008. It has a 30 day trial period. After that, you will be kindly reminded from time to time to buy an $80 license.

## Summary
Learning to use a new text editor with all its shortcuts and plugins is a long-term time investment. If you haven't used any of these text editors I recommend picking VS Code as the most future-proof and well-rounded solution.

# Conclusion
I hope this guide gave you a good overview of the network automation landscape. If you decide to learn more I encourage you to set up a lab and get some hands-on experience. Then when you are ready to apply your new skills in daily work I recommend to [start small](https://blog.networktocode.com/post/netdevops-concepts-mvp) and look for the low hanging fruits. For example, you can automate information gathering from your network devices (e.g. config backup) and then, when you feel more comfortable, begin to configure devices programmatically.

# Social Media Resources
To keep up with the ever changing automation landscape I recommend to follow these fine people on Twitter:

* [@ccurtis584](https://twitter.com/ccurtis584)
* [@damgarros](https://twitter.com/damgarros)
* [@danieldibswe](https://twitter.com/danieldibswe)
* [@dbarrosop](https://twitter.com/dbarrosop)
* [@dmfigol](https://twitter.com/dmfigol)
* [@IPvZero](https://twitter.com/IPvZero)
* [@jeaubin5](https://twitter.com/jeaubin5)
* [@jedelman8](https://twitter.com/jedelman8)
* [@jstretch85](https://twitter.com/jstretch85)
* [@kirkbyers](https://twitter.com/kirkbyers)
* [@lykinsb](https://twitter.com/lykinsb)
* [@mirceaulinic](https://twitter.com/mirceaulinic)
* [@natenka_says](https://twitter.com/natenka_says)
* [@networktocode](https://twitter.com/networktocode)
* [@ntdvps](https://twitter.com/ntdvps)
* [@nwkautomaniac](https://twitter.com/nwkautomaniac)
* [@rickjdon](https://twitter.com/rickjdon)
* [@simingy](https://twitter.com/simingy)
* [@tahigash3](https://twitter.com/tahigash3)
* [@vanderaaj](https://twitter.com/vanderaaj)

# References and further reading
* [Network Programmability and Automation](https://www.oreilly.com/library/view/network-programmability-and/9781491931240/) a book by Jason Edelman, Scott S. Lowe, Matt Oswalt
* [Hands-on with NetDevOps](https://github.com/juliogomez/netdevops) by Julio Gomez
* [What is NetDevOps?](https://www.packetflow.co.uk/what-is-netdevops/) by Rick Donato
* [A practical approach to building a network CI/CD pipeline](https://www.intentionet.com/blog/a-practical-approach-to-building-a-network-ci-cd-pipeline/) by Samir Parikh
* [NetDevOps: what does it even mean?](https://cumulusnetworks.com/blog/netdevops-meaning/) by Madison Emery (Cumulus Networks)
* [Awesome Network Automation](https://github.com/networktocode/awesome-network-automation) &mdash; curated Awesome list about Network Automation
* [6 Docker Basics You Should Completely Grasp When Getting Started](https://vsupalov.com/6-docker-basics/) by Vladislav Supalov
* [First Steps With Python](https://realpython.com/python-first-steps/) by Derrick Kearney
* [Python Cheatsheet](https://www.pythoncheatsheet.org/) &mdash; handy one-page website with examples
* [Fluent Python](https://www.oreilly.com/library/view/fluent-python/9781491946237/) &mdash; a book by Luciano Ramalho
* [Learning Python](https://pynet.twb-tech.com/email-signup.html)  &mdash; a free email Python course by Kirk Byers specifically intended for network engineers
* [Data Structures And Algorithms In Python](https://www.youtube.com/playlist?list=PLeo1K3hjS3uu_n_a__MI_KktGTLYopZ12) &mdash; a video tutorial by Dhaval Patel