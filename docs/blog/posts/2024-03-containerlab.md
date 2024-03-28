---
title: "Running BSD in containerlab"
description: "How to run OpenBSD and FreeBSD nodes in containerlab."
categories:
- Tutorial
tags:
- openbsd
- freebsd
- containerlab
date: 2024-03-28
authors:
  - dteslya
draft: false
comments: true
---

# Running BSD in containerlab

<figure markdown>
  [![feature](images/2024-03-containerlab.jpg)](https://unsplash.com/@sieuwert)
  <figcaption>Cover photo by Sieuwert Otterloo on Unsplash</figcaption>
</figure>

A few months ago I started tinkering with OpenBSD and wrote a [post](2023-11-openbsd.md) about it. Now, I'd like to share how to easily run not only OpenBSD but also FreeBSD nodes in a lab environment with [IaC](https://en.wikipedia.org/wiki/Infrastructure_as_code) approach.

<!-- more -->

## Enter containerlab

[Containerlab](https://containerlab.dev/) is my go-to tool when it comes to networking labs. It allows me to declaratively define lab topologies and run container and VM-based NOSes from different vendors and open-source projects. It's like `docker compose`, but with the ability to create "wires" between containers. All you need to start a lab is to prepare a [topology definition](https://containerlab.dev/manual/topo-def-file/) file in YAML and run `containerlab deploy`.

Unfortunately, containerlab didn't support OpenBSD at the time. So at first, I resorted to [Vagrant](https://app.vagrantup.com/twingly/boxes/openbsd-7.3-amd64) to spin up multi-node labs on my laptop. It did the trick, but the [Vagrantfiles](https://developer.hashicorp.com/vagrant/docs/multi-machine) were huge and hard to navigate. I also couldn't easily port those labs to a more powerful host due to VirtualBox dependency. That's when I decided to try and add OpenBSD support to containerlab myself. I had my doubts about adding a general-purpose OS to containerlab, so I've reached out to [Roman Dodin](https://twitter.com/ntdvps), project maintainer, to confirm if he is comfortable with the idea. To my surprise, he was and also gave me some useful hints regarding the implementation.

!!! note
    To run VM-based NOSes containerlab utilizes [vrnetlab](https://github.com/hellt/vrnetlab) integration. What it essentially does is start a VM inside a container with `qemu` and stitch VM interfaces with container interfaces allowing it to connect to other containerlab nodes. More details [here](https://github.com/hellt/vrnetlab?tab=readme-ov-file#container-native-networking) and [here](https://netdevops.me/2021/transparently-redirecting-packetsframes-between-interfaces/).

Fast forward one month and a new version of containerlab with [OpenBSD](https://github.com/hellt/vrnetlab/pull/151) [support](https://github.com/srl-labs/containerlab/pull/1762) has been [released](https://containerlab.dev/rn/0.49/).

Later, Roman approached me to add [FreeBSD support](https://containerlab.dev/rn/0.53/), and I [did](https://github.com/hellt/vrnetlab/pull/179) [so](https://github.com/srl-labs/containerlab/pull/1953) with pleasure.

## Building BSD images

The first thing you need is contanerlab-compatible Docker images with OpenBSD and FreeBSD inside. To build them you need to clone [`hellt/vrnetlab`](https://github.com/hellt/vrnetlab) and run `make download` and `make` in the corresponding directories.

=== "OpenBSD"

    ``` hl_lines="1 9 10 16"
    $ git clone https://github.com/hellt/vrnetlab
    Cloning into 'vrnetlab'...
    remote: Enumerating objects: 4538, done.
    remote: Counting objects: 100% (1528/1528), done.
    remote: Compressing objects: 100% (449/449), done.
    remote: Total 4538 (delta 1203), reused 1255 (delta 1079), pack-reused 3010
    Receiving objects: 100% (4538/4538), 2.05 MiB | 6.85 MiB/s, done.
    Resolving deltas: 100% (2772/2772), done.
    $ cd vrnetlab/openbsd
    $ make download
    /bin/bash download.sh
      % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed
    100  673M  100  673M    0     0  9884k      0  0:01:09  0:01:09 --:--:-- 10.5M
    Download complete: openbsd-7.3-2023-04-22.qcow2
    $ make
    for IMAGE in openbsd-7.3-2023-04-22.qcow2; do \
            echo "Making $IMAGE"; \
            make IMAGE=$IMAGE docker-build; \
    done
    Making openbsd-7.3-2023-04-22.qcow2
    make[1]: Entering directory '/tmp/vrnetlab/openbsd'
    rm -f docker/*.qcow2* docker/*.tgz* docker/*.vmdk* docker/*.iso
    Building docker image using openbsd-7.3-2023-04-22.qcow2 as vrnetlab/vr-openbsd:7.3
    cp ../common/* docker/
    make IMAGE=$IMAGE docker-build-image-copy
    make[2]: Entering directory '/tmp/vrnetlab/openbsd'
    cp openbsd-7.3-2023-04-22.qcow2* docker/
    make[2]: Leaving directory '/tmp/vrnetlab/openbsd'
    (cd docker; docker build --build-arg http_proxy= --build-arg https_proxy= --build-arg IMAGE=openbsd-7.3-2023-04-22.qcow2 -t vrnetlab/vr-openbsd:7.3 .)
    [+] Building 12.8s (11/11) FINISHED                                                                                                                                                                                                                                                                                         docker:default
     => [internal] load .dockerignore                                                                                                                                                                                                                                                                                                     0.1s
     => => transferring context: 2B                                                                                                                                                                                                                                                                                                       0.0s
     => [internal] load build definition from Dockerfile                                                                                                                                                                                                                                                                                  0.1s
     => => transferring dockerfile: 635B                                                                                                                                                                                                                                                                                                  0.0s
     => [internal] load metadata for docker.io/library/debian:bookworm-slim                                                                                                                                                                                                                                                               3.5s
     => [1/6] FROM docker.io/library/debian:bookworm-slim@sha256:ccb33c3ac5b02588fc1d9e4fc09b952e433d0c54d8618d0ee1afadf1f3cf2455                                                                                                                                                                                                         0.0s
     => [internal] load build context                                                                                                                                                                                                                                                                                                     3.3s
     => => transferring context: 706.65MB                                                                                                                                                                                                                                                                                                 3.2s
     => CACHED [2/6] RUN apt-get update -qy    && apt-get upgrade -qy    && apt-get install -y    bridge-utils    iproute2    python3-ipy    socat    qemu-kvm    tcpdump    ssh    inetutils-ping    dnsutils    iptables    nftables    telnet    cloud-utils    sshpass    && rm -rf /var/lib/apt/lists/*                              0.0s
     => [3/6] COPY openbsd-7.3-2023-04-22.qcow2* /                                                                                                                                                                                                                                                                                        1.5s
     => [4/6] COPY *.py /                                                                                                                                                                                                                                                                                                                 0.1s
     => [5/6] COPY --chmod=0755 backup.sh /                                                                                                                                                                                                                                                                                               0.1s
     => [6/6] RUN qemu-img resize /openbsd-7.3-2023-04-22.qcow2 4G                                                                                                                                                                                                                                                                        1.2s
     => exporting to image                                                                                                                                                                                                                                                                                                                2.8s
     => => exporting layers                                                                                                                                                                                                                                                                                                               2.8s
     => => writing image sha256:85d70742e8958d56ef186b34c09296f93a4f7c6e63bbe964a0995ec4ab23c6b8                                                                                                                                                                                                                                          0.0s
     => => naming to docker.io/vrnetlab/vr-openbsd:7.3                                                                                                                                                                                                                                                                                    0.0s
    make[1]: Leaving directory '/tmp/vrnetlab/openbsd'
    ```

=== "FreeBSD"

    ``` hl_lines="1 9 10 16"
    $ git clone https://github.com/hellt/vrnetlab
    Cloning into 'vrnetlab'...
    remote: Enumerating objects: 4538, done.
    remote: Counting objects: 100% (1528/1528), done.
    remote: Compressing objects: 100% (449/449), done.
    remote: Total 4538 (delta 1203), reused 1255 (delta 1079), pack-reused 3010
    Receiving objects: 100% (4538/4538), 2.05 MiB | 6.85 MiB/s, done.
    Resolving deltas: 100% (2772/2772), done.
    $ cd vrnetlab/freebsd
    $ make download
    /bin/bash download.sh
      % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed
    100  704M  100  704M    0     0  9626k      0  0:01:14  0:01:14 --:--:-- 10.1M
    Download complete: freebsd-13.2-zfs-2023-04-21.qcow2
    $ make
    for IMAGE in freebsd-13.2-zfs-2023-04-21.qcow2; do \
            echo "Making $IMAGE"; \
            make IMAGE=$IMAGE docker-build; \
    done
    Making freebsd-13.2-zfs-2023-04-21.qcow2
    make[1]: Entering directory '/tmp/vrnetlab/freebsd'
    rm -f docker/*.qcow2* docker/*.tgz* docker/*.vmdk* docker/*.iso
    Building docker image using freebsd-13.2-zfs-2023-04-21.qcow2 as vrnetlab/vr-freebsd:13.2
    cp ../common/* docker/
    make IMAGE=$IMAGE docker-build-image-copy
    make[2]: Entering directory '/tmp/vrnetlab/freebsd'
    cp freebsd-13.2-zfs-2023-04-21.qcow2* docker/
    make[2]: Leaving directory '/tmp/vrnetlab/freebsd'
    (cd docker; docker build --build-arg http_proxy= --build-arg https_proxy= --build-arg IMAGE=freebsd-13.2-zfs-2023-04-21.qcow2 -t vrnetlab/vr-freebsd:13.2 .)
    [+] Building 5.4s (11/11) FINISHED                                                                                                                                                                                                                                                                                          docker:default
     => [internal] load build definition from Dockerfile                                                                                                                                                                                                                                                                                  0.0s
     => => transferring dockerfile: 635B                                                                                                                                                                                                                                                                                                  0.0s
     => [internal] load .dockerignore                                                                                                                                                                                                                                                                                                     0.0s
     => => transferring context: 2B                                                                                                                                                                                                                                                                                                       0.0s
     => [internal] load metadata for docker.io/library/debian:bookworm-slim                                                                                                                                                                                                                                                               2.0s
     => [1/6] FROM docker.io/library/debian:bookworm-slim@sha256:ccb33c3ac5b02588fc1d9e4fc09b952e433d0c54d8618d0ee1afadf1f3cf2455                                                                                                                                                                                                         0.0s
     => [internal] load build context                                                                                                                                                                                                                                                                                                     3.2s
     => => transferring context: 738.53MB                                                                                                                                                                                                                                                                                                 3.2s
     => CACHED [2/6] RUN apt-get update -qy    && apt-get upgrade -qy    && apt-get install -y    bridge-utils    iproute2    python3-ipy    socat    qemu-kvm    tcpdump    ssh    inetutils-ping    dnsutils    iptables    nftables    telnet    cloud-utils    sshpass    && rm -rf /var/lib/apt/lists/*                              0.0s
     => CACHED [3/6] COPY freebsd-13.2-zfs-2023-04-21.qcow2* /                                                                                                                                                                                                                                                                            0.0s
     => CACHED [4/6] COPY *.py /                                                                                                                                                                                                                                                                                                          0.0s
     => CACHED [5/6] COPY --chmod=0755 backup.sh /                                                                                                                                                                                                                                                                                        0.0s
     => CACHED [6/6] RUN qemu-img resize /freebsd-13.2-zfs-2023-04-21.qcow2 4G                                                                                                                                                                                                                                                            0.0s
     => exporting to image                                                                                                                                                                                                                                                                                                                0.0s
     => => exporting layers                                                                                                                                                                                                                                                                                                               0.0s
     => => writing image sha256:a4adc1501baed2150a7ccca6e03291c630f2e87eeeabcff6dbb5aa3ca9f860b7                                                                                                                                                                                                                                          0.0s
     => => naming to docker.io/vrnetlab/vr-freebsd:13.2                                                                                                                                                                                                                                                                                   0.0s
    make[1]: Leaving directory '/tmp/vrnetlab/freebsd'
    ```

To check if the images are available run:

``` hl_lines="1"
$ docker images | grep bsd
vrnetlab/vr-openbsd                                 7.3            85d70742e895   9 minutes ago   2.36GB
vrnetlab/vr-freebsd                                 13.2           a4adc1501bae   5 days ago      2.42GB
```

## Installing containerlab

Containerlab is written in Go and comes as a single binary file. The easiest way to install it is by running the official installation script:

``` hl_lines="1"
$ bash -c "$(curl -sL https://get.containerlab.dev)"
Downloading https://github.com/srl-labs/containerlab/releases/download/v0.53.0/containerlab_0.53.0_linux_amd64.deb
Preparing to install containerlab 0.53.0 from package
Selecting previously unselected package containerlab.
(Reading database ... 221124 files and directories currently installed.)
Preparing to unpack .../containerlab_0.53.0_linux_amd64.deb ...
Unpacking containerlab (0.53.0) ...
Setting up containerlab (0.53.0) ...
 ____ ___  _   _ _____  _    ___ _   _ _____ ____  _       _
/ ___/ _ \| \ | |_   _|/ \  |_ _| \ | | ____|  _ \| | __ _| |__
| |  | | | |  \| | | | / _ \  | ||  \| |  _| | |_) | |/ _` | '_ \
| |__| |_| | |\  | | |/ ___ \ | || |\  | |___|  _ <| | (_| | |_) |
\____\___/|_| \_| |_/_/   \_\___|_| \_|_____|_| \_\_|\__,_|_.__/

   version: 0.53.0
    commit: 7ce0afa2
      date: 2024-03-25T16:31:05Z
    source: https://github.com/srl-labs/containerlab
rel. notes: https://containerlab.dev/rn/0.53/
```

You can read about other options in the [installation guide](https://containerlab.dev/install/).

## Starting a lab

To start a lab, you first need to create a topology file. Below is the topology I used for this tutorial.

``` title="Lab topology"
              ┌──────────┐            ┌──────────┐        
              │obsd1     │            │     fbsd1│        
              │          │ 10.1.1.0/30│          │        
              │       vio2────────────vtnet2     │        
              │          │.1        .2│          │        
              │          │            │          │        
              └───vio1───┘            └──vtnet1──┘        
                   │.1                   .1|
                   |                       │              
     192.168.1.0/24│                       │192.168.2.0/24
                   │                       │              
                   │.2                   .2│              
              ┌───eth1───┐            ┌───eth1───┐        
              │          │            │          │        
              │          │            │          │        
              │          │            │          │        
              │          │            │          │        
              │ client1  │            │  client2 │        
              └──────────┘            └──────────┘        
```

It's pretty simple. Two BSD nodes are acting as routers for two Linux clients.

Here is how this topology can be reflected in a topology file.

```yaml title="bsd.clab.yml"
name: bsd
topology:
nodes:
 obsd1:
   kind: openbsd
   image: vrnetlab/vr-openbsd:7.3
 fbsd1:
   kind: freebsd
   image: vrnetlab/vr-freebsd:13.2
 client1:
   kind: "linux"
   image: wbitt/network-multitool:alpine-extra
   exec:
     - ip addr add 192.168.1.2/24 dev eth1
     - ip route add 192.168.2.0/24 via 192.168.1.1
 client2:
   kind: "linux"
   image: wbitt/network-multitool:alpine-extra
   exec:
     - ip addr add 192.168.2.2/24 dev eth1
     - ip route add 192.168.1.0/24 via 192.168.2.1
links:
 - endpoints: ["obsd1:eth1", "client1:eth1"]
 - endpoints: ["fbsd1:eth1", "client2:eth1"]
 - endpoints: ["obsd1:eth2", "fbsd1:eth2"]
```

To start the lab create an empty directory (e.g. `~/clab-bsd`), cd to it, and save the above YAML code to `bsd.clab.yml` in that directory. After that, you can run `sudo containerlab deploy`.

``` hl_lines="1"
$ sudo containerlab deploy
INFO[0000] Containerlab v0.53.0 started
INFO[0000] Parsing & checking topology file: bsd.clab.yml
INFO[0000] Creating lab directory: /tmp/clab-bsd/clab-bsd
INFO[0000] Creating container: "obsd1"
INFO[0000] Creating container: "fbsd1"
INFO[0000] Creating container: "client2"
INFO[0000] Creating container: "client1"
INFO[0001] Created link: fbsd1:eth1 <--> client2:eth1
INFO[0001] Created link: obsd1:eth2 <--> fbsd1:eth2
INFO[0001] Created link: obsd1:eth1 <--> client1:eth1
INFO[0001] Executed command "ip addr add 192.168.2.2/24 dev eth1" on the node "client2". stdout:
INFO[0001] Executed command "ip route add 192.168.1.0/24 via 192.168.2.1" on the node "client2". stdout:
INFO[0001] Executed command "ip addr add 192.168.1.2/24 dev eth1" on the node "client1". stdout:
INFO[0001] Executed command "ip route add 192.168.2.0/24 via 192.168.1.1" on the node "client1". stdout:
INFO[0001] Adding containerlab host entries to /etc/hosts file
INFO[0001] Adding ssh config for containerlab nodes
+---+------------------+--------------+--------------------------------------+---------+---------+----------------+----------------------+
| # |       Name       | Container ID |                Image                 |  Kind   |  State  |  IPv4 Address  |     IPv6 Address     |
+---+------------------+--------------+--------------------------------------+---------+---------+----------------+----------------------+
| 1 | clab-bsd-client1 | 38258e33b272 | wbitt/network-multitool:alpine-extra | linux   | running | 172.20.20.7/24 | 2001:172:20:20::7/64 |
| 2 | clab-bsd-client2 | 61d4e75ce2ae | wbitt/network-multitool:alpine-extra | linux   | running | 172.20.20.5/24 | 2001:172:20:20::5/64 |
| 3 | clab-bsd-fbsd1   | 20566a209062 | vrnetlab/vr-freebsd:13.2             | freebsd | running | 172.20.20.6/24 | 2001:172:20:20::6/64 |
| 4 | clab-bsd-obsd1   | 391d5b86dfde | vrnetlab/vr-openbsd:7.3              | openbsd | running | 172.20.20.8/24 | 2001:172:20:20::8/64 |
+---+------------------+--------------+--------------------------------------+---------+---------+----------------+----------------------+
```

To check if the nodes are running normally you can check their status like this.

``` hl_lines="1"
$ docker ps | grep vrnetlab
391d5b86dfde   vrnetlab/vr-openbsd:7.3                "/launch.py --userna…"   11 minutes ago   Up 11 minutes (healthy)   22/tcp, 5000/tcp, 10000-10099/tcp           clab-bsd-obsd1
20566a209062   vrnetlab/vr-freebsd:13.2               "/launch.py --userna…"   11 minutes ago   Up 11 minutes (healthy)   22/tcp, 5000/tcp, 10000-10099/tcp           clab-bsd-fbsd1
```

Look for the `(healthy)` keyword in the output.

## Configuring nodes

Now when the lab is up you can proceed with the node configuration. Client nodes were already configured at the start (`exec` lines in the topology file), but the BSD nodes need manual attention.

To keep things simple I'm going to just add IP addresses to the interfaces, enable IPv4 forwarding, and configure static routing on both BSD nodes.

!!! note
    The default user credentials for both BSD nodes: `admin:admin`.

=== "OpenBSD"

    ``` hl_lines="1 14 15 16 23 25"
    ssh clab-bsd-obsd1
    Warning: Permanently added 'clab-bsd-obsd1,172.20.20.8' (ECDSA) to the list of known hosts.
    admin@clab-bsd-obsd1's password:
    OpenBSD 7.3 (GENERIC.MP) #1125: Sat Mar 25 10:36:29 MDT 2023

    Welcome to OpenBSD: The proactively secure Unix-like operating system.

    Please use the sendbug(1) utility to report bugs in the system.
    Before reporting a bug, please try to reproduce it with the latest
    version of the code.  With bug reports, please try to ensure that
    enough information to reproduce the problem is enclosed, and if a
    known fix for it exists, include that as well.

    obsd1$ sudo ifconfig vio1 192.168.1.1/24
    obsd1$ sudo ifconfig vio2 10.1.1.1/30
    obsd1$ ping 192.168.1.2
    PING 192.168.1.2 (192.168.1.2): 56 data bytes
    64 bytes from 192.168.1.2: icmp_seq=0 ttl=64 time=3.639 ms
    ^C
    --- 192.168.1.2 ping statistics ---
    1 packets transmitted, 1 packets received, 0.0% packet loss
    round-trip min/avg/max/std-dev = 3.639/3.639/3.639/0.000 ms
    obsd1$ sudo sysctl net.inet.ip.forwarding=1
    net.inet.ip.forwarding: 0 -> 1
    obsd1$ sudo route add 192.168.2.0/24 10.1.1.2
    add net 192.168.2.0/24: gateway 10.1.1.2
    obsd1$
    ```

=== "FreeBSD"

    ``` hl_lines="1 28 29 30 37 39 41"
    ssh clab-bsd-fbsd1
    Warning: Permanently added 'clab-bsd-fbsd1,172.20.20.6' (ECDSA) to the list of known hosts.
    Password for admin@fbsd1:
    FreeBSD 13.2-RELEASE releng/13.2-n254617-525ecfdad597 GENERIC

    Welcome to FreeBSD!

    Release Notes, Errata: https://www.FreeBSD.org/releases/
    Security Advisories:   https://www.FreeBSD.org/security/
    FreeBSD Handbook:      https://www.FreeBSD.org/handbook/
    FreeBSD FAQ:           https://www.FreeBSD.org/faq/
    Questions List:        https://www.FreeBSD.org/lists/questions/
    FreeBSD Forums:        https://forums.FreeBSD.org/

    Documents installed with the system are in the /usr/local/share/doc/freebsd/
    directory, or can be installed later with:  pkg install en-freebsd-doc
    For other languages, replace "en" with a language code like de or fr.

    Show the version of FreeBSD installed:  freebsd-version ; uname -a
    Please include that output and any error messages when posting questions.
    Introduction to manual pages:  man man
    FreeBSD directory layout:      man hier

    To change this login announcement, see motd(5).
    Ever wonder what those numbers after command names were, as in cat(1)?  It's
    the section of the manual the man page is in.  "man man" will tell you more.
                    -- David Scheidt <dscheidt@tumbolia.com>
    admin@fbsd1:~ % sudo ifconfig vtnet1 192.168.2.1/24
    admin@fbsd1:~ % sudo ifconfig vtnet2 10.1.1.2/30
    admin@fbsd1:~ % ping 192.168.2.2
    PING 192.168.2.2 (192.168.2.2): 56 data bytes
    64 bytes from 192.168.2.2: icmp_seq=0 ttl=64 time=1.328 ms
    ^C
    --- 192.168.2.2 ping statistics ---
    1 packets transmitted, 1 packets received, 0.0% packet loss
    round-trip min/avg/max/stddev = 1.328/1.328/1.328/0.000 ms
    admin@fbsd1:~ % sudo sysctl net.inet.ip.forwarding=1
    net.inet.ip.forwarding: 0 -> 1
    admin@fbsd1:~ % sudo route add 192.168.1.0/24 10.1.1.1
    add net 192.168.1.0: gateway 10.1.1.1
    admin@fbsd1:~ % ping 10.1.1.1
    PING 10.1.1.1 (10.1.1.1): 56 data bytes
    64 bytes from 10.1.1.1: icmp_seq=0 ttl=255 time=2.481 ms
    ^C
    --- 10.1.1.1 ping statistics ---
    1 packets transmitted, 1 packets received, 0.0% packet loss
    round-trip min/avg/max/stddev = 2.481/2.481/2.481/0.000 ms
    admin@fbsd1:~ %
    ```

Now `client1` should be able to ping `client2`. Let's check.

=== "client1"

    ``` hl_lines="1 2 10"
    $ docker exec -it clab-bsd-client1 ash
    / # ping 192.168.2.2
    PING 192.168.2.2 (192.168.2.2) 56(84) bytes of data.
    64 bytes from 192.168.2.2: icmp_seq=1 ttl=62 time=2.21 ms
    64 bytes from 192.168.2.2: icmp_seq=2 ttl=62 time=0.475 ms
    ^C
    --- 192.168.2.2 ping statistics ---
    2 packets transmitted, 2 received, 0% packet loss, time 1001ms
    rtt min/avg/max/mdev = 0.475/1.343/2.212/0.868 ms
    / # traceroute -n 192.168.2.2
    traceroute to 192.168.2.2 (192.168.2.2), 30 hops max, 46 byte packets
     1  192.168.1.1  0.788 ms  0.541 ms  0.549 ms
     2  10.1.1.2  1.405 ms  0.304 ms  0.275 ms
     3  192.168.2.2  0.361 ms  0.300 ms  0.313 ms
    / #
    ```

=== "client2"

    ``` hl_lines="1 2 10"
    $ docker exec -it clab-bsd-client2 ash
    / # ping 192.168.1.2
    PING 192.168.1.2 (192.168.1.2) 56(84) bytes of data.
    64 bytes from 192.168.1.2: icmp_seq=1 ttl=62 time=2.45 ms
    64 bytes from 192.168.1.2: icmp_seq=2 ttl=62 time=0.715 ms
    ^C
    --- 192.168.1.2 ping statistics ---
    2 packets transmitted, 2 received, 0% packet loss, time 1002ms
    rtt min/avg/max/mdev = 0.715/1.582/2.450/0.867 ms
    / # traceroute -n 192.168.1.2
    traceroute to 192.168.1.2 (192.168.1.2), 30 hops max, 46 byte packets
     1  192.168.2.1  0.746 ms  0.650 ms  0.220 ms
     2  10.1.1.1  0.447 ms  0.284 ms  0.233 ms
     3  192.168.1.2  0.281 ms  0.290 ms  0.265 ms
    / #
    ```

As you can see from the `traceroute` output traffic is traversing both BSD nodes.

## Conclusion

In this post, I gave a quick introduction to containerlab and showed how you can use it to build labs with OpenBSD and FreeBSD nodes. I hope you find it useful and wish you happy labbing!
