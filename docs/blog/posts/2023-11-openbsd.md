---
title: "My Introduction to OpenBSD"
description: "How I embraced OpenBSD as an alternative to Linux-based routers."
categories:
- Misc
tags:
- openbsd
date: 2023-11-16
authors:
  - dteslya
draft: false
comments: true
---

# My Introduction to OpenBSD

<figure markdown>
  [![feature](images/2023-11-openbsd.jpg)](https://unsplash.com/@mavicprovzla)
  <figcaption>Cover photo by Stelio Puccinelli on Unsplash</figcaption>
</figure>

In this post, I'd like to share why I consider [OpenBSD](https://www.openbsd.org/) a viable but often overlooked platform for building routers and firewalls. I tried to highlight the networking features of OpenBSD that in my opinion make this OS stand out.

Please, treat this post more as a collection of my personal notes and findings. It doesn't claim to be objective and comprehensive.

<!-- more -->

## Preface

Recently I was looking for an open-source routing solution to build site-to-site VPN gateways and stateful firewalls. My considerations included ease of support and automation, feature richness, and low resource footprint. I dismissed such options as [VyOS](https://vyos.io/) and [pfSense](https://www.pfsense.org/) quite early because I enjoy [building things myself](https://blog.ipspace.net/2021/10/build-buy-router.html) and prefer to have more control over the system. So I continued my search among Linux distributions. But as much as I love Linux, its "batteries not included" approach still seemed to require too much effort. I was looking for more balance between freedom of choice and the convenience of ready-made functionality. This made me look around for other open-source alternatives and eventually led to OpenBSD.

## First impressions

The first thing I noticed when I started working with OpenBSD was the sense of a complete and well-designed system. All my humble networking needs were covered by the [base system](https://www.over-yonder.net/~fullermd/rants/bsd4linux/03). That included BGP, OSPF, IPSec, and a packet filter. The daemons implementing the above protocols had very similar configuration syntax and philosophy which made me feel comfortable around the system quickly.

My next discovery was that OpenBSD had everything to build a high-availability appliance out of the box. There is [CARP](https://en.wikipedia.org/wiki/Common_Address_Redundancy_Protocol) which covers [FHRP](https://en.wikipedia.org/wiki/First-hop_redundancy_protocol), [pfsync](https://man.openbsd.org/pfsync.4) to keep packet filter state tables synchronized across nodes, and even [sasyncd](https://man.openbsd.org/sasyncd) to synchronize IPSec SAs (although I didn't try the latter).

And since I've touched `CARP` and `pfsync` I can't help but mention the use of pseudo interfaces in OpenBSD. Many things in OpenBSD are done via interfaces. For instance, you don't need a daemon to export flow data. You just configure the [pflow](https://man.openbsd.org/pflow.4) interface with `ifconfig` and that's it. Or if you need to access firewall logs, you just point `tcpdump` to a [pflog](https://man.openbsd.org/pflog) interface. How cool is that?

## Simplicity and coherence

To me, [`systemd`](https://www.reddit.com/r/unix/comments/9qk07w/humor_all_refugees_are_welcome/) and `netplan` feel like overkill when it comes to managing network interfaces of a server, especially a router. OpenBSD keeps all network interface configs in separate [/etc/hostname.<if>](https://man.openbsd.org/hostname.if.5) files which contain parameters for `ifconfig`. And if you need to make sure that the config is always applied to the right interface you can use `/etc/hostname.<lladr>` to bind it to the link-layer address (e.g., `/etc/hostname.00:00:5e:00:53:af`).

Same with the service management. The most complex case of service management on a router that comes to my mind is running multiple instances of the same daemon in different VRFs (1). That can be easily achieved with the [rcctl](https://man.openbsd.org/rcctl.8) tool even for daemons not natively aware of rdomains by passing the `rtable` option. More on that later.
{ .annotate }

1. From here on I will refer to VRFs as routing domains or rdomains as a more idiomatic OpenBSD term.

I also like how OpenBSD network daemons follow the [low coupling](https://en.wikipedia.org/wiki/Coupling_(computer_programming)) and [high cohesion](https://en.wikipedia.org/wiki/Cohesion_(computer_science)) design principles. A good example of that would be the utilization of kernel features such as route labels and packet tags.

I was puzzled at first about how to configure route redistribution between BGP and OSPF because I couldn't find the `redistribute bgp` command in the [ospfd.conf](https://man.openbsd.org/ospfd.conf.5) man page. But soon I realized I could mark BGP routes with an arbitrary label in [bgpd.conf](https://man.openbsd.org/bgpd.conf) and then match that label in `ospfd` config.

## Packet filter

The big part of the OpenBSD networking stack is of course PF, or packet filter. I don't want to dive much into technical details here. There are plenty of articles on the Internet and even a [book](https://www.amazon.com/Book-PF-3rd-No-Nonsense-Firewall-ebook/dp/B00O9A7E88) dedicated to PF.

In terms of traffic filtering functionality, PF is on par with iptables. Although its syntax is very straightforward and human-friendly, it takes some time to wrap your head around its operation principles if you come from iptables or traditional firewalls. PF is the only firewall I know where the last matching rule determines the outcome. This forces you to start with broad common rules, such as `block all`, and then add more and more specific ones.

As already mentioned OpenBSD features [pfsync](https://man.openbsd.org/pfsync.4) protocol. It enables you to build highly available firewall clusters, similar to those offered by big vendors.

## Routing

OpenBSD supports OSPF and BGP out of the box with [OpenOSPFD](https://en.wikipedia.org/wiki/OpenOSPFD) and [OpenBGPD](https://www.openbgpd.org/) respectively. [FRRouting](https://frrouting.org/) and [BIRD](https://bird.network.cz/) can also be installed as external packages, but I yet haven't tried them.

Both BGPD and OSPFD have accompanying CLI tools, namely [bgpctl](https://man.openbsd.org/bgpctl), and [ospfctl](https://man.openbsd.org/ospfctl.8), which allow you to extract operational data (i.e., show commands) and make runtime changes such as clearing neighbors.

As I've mentioned before OpenBSD supports virtual routing with [rtables and rdomains](https://man.openbsd.org/rdomain.4). Since you can assign multiple rtables only to the default rdomain both terms are often interchangeable. But they should not be confused. Separate rtables in the default rdomain can be used for policy routing. This is done by matching packets with `pf` and sending them to a specific rtable where route lookup should happen. Rdomains can be used to assign interfaces and are like VRFs. I recommend [this article](https://unfriendlygrinch.info/posts/openbsd-routing-tables-and-routing-domains/) to learn more about this topic.

## IPSec

IPSec support is provided by [iked](https://man.openbsd.org/iked) for IKEv2 and [isakmpd](https://man.openbsd.org/isakmpd.8) for IKEv1 protocols. Unfortunately, you can't run them both on the same machine, because they listen on the same UDP ports (500 and 4500). Perhaps this can be circumvented by running `iked` and `isakmpd` in different rdomains, but you'll still need two public IPs for that.

Both `iked` and `isakmpd` need only one config file to describe both Phase 1 and Phase 2. Though I find it a bit confusing that while the `iked` config is called `/etc/iked.conf`, it's `/etc/ipsec.conf` for `isakmpd`.

OpenBSD IPSec stack utilizes a special [enc](https://man.openbsd.org/enc.4) pseudo-interface. It allows you to apply `pf` rules to IPSec encapsulated traffic and monitor traffic going to or from an IPSec tunnel before encryption and after decryption with `tcpdump`. In my opinion, this contributes significantly to the process of troubleshooting.

With the recent [7.4 release](https://www.openbsd.org/74.html), OpenBSD got [support](https://undeadly.org/cgi?action=article;sid=20230704094238) for route-based IPSec which looks very promising, but I haven't had a chance to try it yet.

## Monitoring

I used Zabbix to monitor OpenBSD boxes by installing `zabbix-agent` from packages. There is an official OpenBSD [template](https://git.zabbix.com/projects/ZBX/repos/zabbix/browse/templates/os/openbsd?at=refs%2Fheads%2Frelease%2F6.4) that can be used as a starting point.

There is also `node_exporter` available in packages if you prefer Prometheus.

## Automation

OpenBSD is supported by all major configuration management systems, such as [Puppet](https://forge.puppet.com/modules?os=openbsd), [Chef](https://supermarket.chef.io/cookbooks?q=&platforms%5B%5D=openbsd), [Ansible](https://galaxy.ansible.com/ui/search/?keywords=openbsd), and [Salt](https://cse.google.com/cse?cx=011515552685726825874:ht0p8miksrm&q=openbsd). Although the availability of ready-made modules is not as abundant as with various Linux distributions.

In my case, I used Puppet to automate almost all aspects of system configuration. I relied on the [`bsd`](https://forge.puppet.com/modules/zleslie/bsd/readme) module to manage network interfaces and the [`pf`](https://forge.puppet.com/modules/zleslie/pf/readme) module to manage PF rules. For daemons like BGPD, IKED, and OSPFD, I created my own modules.

## Documentation

Compared to Linux, there are relatively few articles and blog posts about OpenBSD. This is expected given the comparatively small user base. However, it is compensated by the quality and completeness of the manual pages.

## Performance

Up to this point, it may seem like it's too good to be true. However, I found network performance considerably lower than that of Linux when I was testing IPSec.

I was passing iperf traffic through two OpenBSD VMs running on the same KVM host. There was a GRE over IPSec tunnel between them with AES256 GCM encryption which is [hardware accelerated](https://en.wikipedia.org/wiki/AES_instruction_set#x86_architecture_processors) on both OpenBSD and Linux. A separate KVM host connected via 1 Gbit/s network was running 2 VMs with iperf which generated traffic. This wasn't the best test topology since the physical gigabit connection between hosts created a bottleneck. But unfortunately, OpenBSD didn't even hit that bottleneck as you can see in the results below.

=== "OpenBSD"

      ```
      $ iperf3 -B 172.16.2.11 -c 172.16.2.10
      Connecting to host 172.16.2.10, port 5201
      [  5] local 172.16.2.11 port 42727 connected to 172.16.2.10 port 5201
      [ ID] Interval           Transfer     Bitrate         Retr  Cwnd
      [  5]   0.00-1.00   sec  69.4 MBytes   582 Mbits/sec   35    189 KBytes
      [  5]   1.00-2.00   sec  67.5 MBytes   566 Mbits/sec   43    189 KBytes
      [  5]   2.00-3.00   sec  63.6 MBytes   533 Mbits/sec   48    178 KBytes
      [  5]   3.00-4.00   sec  63.0 MBytes   529 Mbits/sec   38    195 KBytes
      [  5]   4.00-5.00   sec  64.0 MBytes   536 Mbits/sec   17    245 KBytes
      [  5]   5.00-6.00   sec  64.3 MBytes   540 Mbits/sec   48    218 KBytes
      [  5]   6.00-7.00   sec  60.9 MBytes   511 Mbits/sec   32    253 KBytes
      [  5]   7.00-8.00   sec  61.7 MBytes   518 Mbits/sec   32    280 KBytes
      [  5]   8.00-9.00   sec  60.0 MBytes   503 Mbits/sec   48    218 KBytes
      [  5]   9.00-10.00  sec  61.1 MBytes   513 Mbits/sec   43    245 KBytes
      - - - - - - - - - - - - - - - - - - - - - - - - -
      [ ID] Interval           Transfer     Bitrate         Retr
      [  5]   0.00-10.00  sec   636 MBytes   533 Mbits/sec  384             sender
      [  5]   0.00-10.00  sec   634 MBytes   531 Mbits/sec                  receiver

      iperf Done.
      ```

=== "Linux"

     ```
     $ iperf3 -B 172.16.2.11 -c 172.16.2.10
     Connecting to host 172.16.2.10, port 5201
     [  5] local 172.16.2.11 port 58431 connected to 172.16.2.10 port 5201
     [ ID] Interval           Transfer     Bitrate         Retr  Cwnd
     [  5]   0.00-1.00   sec   112 MBytes   937 Mbits/sec  107    346 KBytes
     [  5]   1.00-2.00   sec   110 MBytes   923 Mbits/sec    6    324 KBytes
     [  5]   2.00-3.00   sec   109 MBytes   912 Mbits/sec   12    233 KBytes
     [  5]   3.00-4.00   sec   109 MBytes   912 Mbits/sec    9    250 KBytes
     [  5]   4.00-5.00   sec   109 MBytes   912 Mbits/sec   36    376 KBytes
     [  5]   5.00-6.00   sec   109 MBytes   912 Mbits/sec    5    254 KBytes
     [  5]   6.00-7.00   sec   109 MBytes   912 Mbits/sec   25    282 KBytes
     [  5]   7.00-8.00   sec   109 MBytes   912 Mbits/sec   11    326 KBytes
     [  5]   8.00-9.00   sec   106 MBytes   892 Mbits/sec   13    292 KBytes
     [  5]   9.00-10.00  sec   108 MBytes   902 Mbits/sec    9    319 KBytes
     - - - - - - - - - - - - - - - - - - - - - - - - -
     [ ID] Interval           Transfer     Bitrate         Retr
     [  5]   0.00-10.00  sec  1.06 GBytes   913 Mbits/sec  233             sender
     [  5]   0.00-10.00  sec  1.06 GBytes   910 Mbits/sec                  receiver

     iperf Done.
     ```

=== "Topology"

      ```
      ┌────────────────────────────────────────────┐
      │ KVM01                                      │
      │     ┌────────────┐        ┌────────────┐   │
      │     │openbsd01   │        │openbsd02   │   │
      │     │            │        │            │   │
      │     │          vio1──────vio1          │   │
      │     │            │        │            │   │
      │     │            │        │            │   │
      │     └────vio2────┘        └────vio2────┘   │
      │           │                     │          │
      │           └────────bridge───────┘          │
      │                      │                     │
      │                      │                     │
      └─────────────────────eth0───────────────────┘
                             │
                        ┌────┴─────┐
                        │  switch  │ 1 Gbit/s
                        └────┬─────┘
                             │
      ┌─────────────────────eth0───────────────────┐
      │                      │                     │
      │                      │                     │
      │           ┌────────bridge───────┐          │
      │           │                     │          │
      │     ┌────eth0────┐        ┌────eth0────┐   │
      │     │            │        │            │   │
      │     │lo0:        │        │lo0:        │   │
      │     │172.16.2.11 │        │172.16.2.10 │   │
      │     │            │        │            │   │
      │     │iperf vm    │        │iperf vm    │   │
      │     └────────────┘        └────────────┘   │
      │ KVM02                                      │
      └────────────────────────────────────────────┘
      ```

This was a quick test without any kernel tuning or anything, so maybe I've missed something. Such performance was sufficient for my use case though. However, for many, it may be a deal breaker.

## Cloud and virtualization support

I run my OpenBSD boxes on KVM hosts and utilize [cloud-init](https://cloudinit.readthedocs.io/en/latest/) for the initial provisioning. Cloud-init is not a part of the base system, but, fortunately, there are prebuilt OpenBSD images with cloud-init installed available for [download](https://bsd-cloud-image.org/).

The only issue I still have with my setup is that I can't get QEMU guest agent to communicate with the virtualization host. Because of this VMs can't be gracefully shut down which can be quite inconvenient. There is a [workaround](https://undeadly.org/cgi?action=article;sid=20200514073852) for this for Proxmox setups, but I couldn't adapt it to pure KVM.

Running OpenBSD on the public cloud might also present some challenges from what I've gathered. You will need to build your own images if you want to run OpenBSD on [AWS](https://github.com/ajacoutot/aws-openbsd), [Azure](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/create-upload-openbsd), or [GCP](https://findelabs.com/post/openbsd-on-gce/). However, you can find native OpenBSD support on some smaller hosting providers, such as [Vultr](https://www.vultr.com/) and [openbsd.amsterdam](https://openbsd.amsterdam/). The latter donates a small amount from each VM to the [OpenBSD Foundation](https://www.openbsdfoundation.org/).

## Conclusion

I hope this post will encourage more network engineers familiar with Linux to try OpenBSD. I believe it's a very strong candidate for the role of a network gateway or a highly available firewall. It brings diversity to the Linux-dominated open-source landscape and gives a different perspective on how things can be done.

## Resources

* [Absolute OpenBSD, 2nd Edition](https://www.amazon.com/Absolute-OpenBSD-Unix-Practical-Paranoid/dp/1593274769) by Michael W. Lucas
* [The Book of PF, 3rd Edition](https://www.amazon.com/Book-PF-3rd-No-Nonsense-Firewall-ebook/dp/B00O9A7E88) by Peter N.M. Hansteen
* [PF: Firewall Ruleset Optimization](https://undeadly.org/cgi?action=article;sid=20060927091645)
* [A collection of prebuilt BSD cloud images](https://bsd-cloud-image.org/)
* [OpenBSD Handbook](https://www.openbsdhandbook.com/)
* [OpenBSD FAQ](https://www.openbsd.org/faq/)
* [Highly Available WANs With OpenBSD](https://youtu.be/2-GwlUFG6oA) by Marko Cupać