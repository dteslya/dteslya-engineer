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
toc: true
maxWidthTitle: "max-w-4xl"
maxWidthContent: "max-w-4xl"
feature: "images/2020-08-network_automation.png"
---
# Introduction
In this post I would like to gather everything I learned about network automation so far in a structured and concise manner. The main audience of this guide are engineers who want to start automating their networks but are overwhelmed by the abundance of terms, tools, and concepts.

# DevOps to NetDevOps
* What is DevOps and where it came from?
* How DevOps spread to networking
* CI/CD concept: waht is CI, what is CD, how it can be applied to network

# Version control and why it is so important
* Version control systems, why git is the most popular
* Difference between git and GitHub (other git based scm's)
* Git workflow: commits, pull (merge) requests, code review, ci/cd

# Containerization
* Brief history (from chroot and jail to Docker)
* Main purpose (same environment for dev and prod)
* Use cases for network automation (running scripts in docker, modern tools)

# Infrastructure as Code (IaS)
* What does this mean?
* Declarative vs imperative approach
* Idempotency principle
* Versioning

# Data formats
## JSON
## YAML
## XML

# Source of truth


# Ways of interacting with network devices
* CLI scraping vs API
* RESTful, Netconf, RESTconf, YANG, gNMI

# Monitoring
* SNMP vs Streaming Telemetry
* Logging
* State monitoring with PyATS
* Modern Tools (influxdb, grafana, ELK)

# Testing and modeling tools
* Batfish (https://www.batfish.org/)



# Automation tools
Quick overview and categorization (configuration management, orchestrators)
You don't necessarily need to know how to code, but it's so much better when you do.

## Paramiko, netmiko
## NAPALM
## Ansible (framework)
* Why so popular for network automation?
* Project structure: inventory, playbooks, roles
* Network modules (https://docs.ansible.com/ansible/latest/modules/list_of_network_modules.html)
## Chef, Puppet, Salt (honorable mentions)
## Nornir
## Scrapli
## PyATS & Genie

# Code editors
* VS Code
* Atom
* SublimeText
* PyCharm

# Vendor resources
## Cisco DevNet
## Juniper
## Arista?
## Cumulus

# Who to follow on social media
* Why it is important
* Twitter

