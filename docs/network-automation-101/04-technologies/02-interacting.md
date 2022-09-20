# Interacting with network devices

There are two major ways of accessing network devices programmatically: CLI and API.

## CLI

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
>[Quotes from the Cloudiest WebScaliest DevOps Teams](https://daily-devops.tumblr.com/post/155993696387/i-dont-know-who-you-are-i-dont-know-what-you)

Fortunately, there are a lot of tools and libraries today that make [CLI scraping](#connection-management-and-cli-scraping) easier by doing a lot of the [regex heavy lifting](#parsing).

## APIs

If you are lucky and devices in your network have an API or maybe are even driven by SDN controller this section is for you. Network APIs fall into two major categories: HTTP-based and NETCONF-based.

### RESTful APIs

[REST](https://en.wikipedia.org/wiki/Representational_state_transfer) stands for Representational State Transfer and defines a set of properties and constraints which an API must conform to in order to be called RESTful.

<figure markdown>
  [![geek & poke - Insulting made easy](../images/2020-10-not-restful.jpg){ width="400" }](http://geek-and-poke.com/geekandpoke/2013/6/14/insulting-made-easy)
  <figcaption>Insulting made easy</figcaption>
</figure>

!!! note ""
    HTTP-based APIs may be RESTful and non-RESTful. Non-RESTful HTTP-based APIs are left out of scope because they are less common.

RESTful APIs are quite easy to use and understand because they are based on HTTP protocol. Basically, RESTful API is just a set of HTTP URLs on which you can make GET and/or POST requests except for returned data is encoded in JSON or XML, not HTML. Since RESTful APIs are HTTP-based they are stateless by nature. This means each request is independent of another and has to supply all the needed information to be properly processed.

To explore RESTful APIs you can use tools such as [cURL](https://curl.haxx.se/) or [Postman](https://www.postman.com/), but when you are ready to write some code utilizing RESTful API you can use a Python library called [requests](https://requests.readthedocs.io/en/master/).

There are several mock REST APIs online which you can use for practice. For example, [kanye.rest](https://kanye.rest/) and [JSONPlaceholder](https://jsonplaceholder.typicode.com/).

### NETCONF & RESTCONF

[NETCONF](https://tools.ietf.org/html/rfc6241) is a protocol specifically designed for managing network devices. Unlike REST it uses SSH as transport and is stateful as a result. The other key differences of NETCONF are clear delineation between configurational and operational data and the concept of configuration datastores. NETCONF defines three datastores: running configuration, startup configuration, and candidate configuration. You may be familiar with all three of them in the context of network devices. The candidate configuration concept allows to deliver a configuration change consisting of many commands as one transaction. This means that if only one command in a transaction fails the transaction does not succeed avoiding a situation when the partial configuration is applied.

Exploring NETCONF APIs is not as easy and straightforward as with RESTful APIs. To do so you need to establish an interactive SSH session to a device and send lengthy XML-encoded commands. To access NETCONF APIs programmatically there is a [ncclient](https://github.com/ncclient/ncclient) Python library.

[RESTCONF](https://tools.ietf.org/html/rfc8040) is another standard protocol which implements a subset of NETCONF functionality (e.g. transactions are not supported) and uses HTTP as transport and is RESTful.

When choosing between [NETCONF and RESTCONF](https://www.ipspace.net/kb/CiscoAutomation/070-netconf.html) it's [advised](https://www.claise.be/netconf-versus-restconf-capabilitity-comparisons-for-data-model-driven-management-2/) to use the former for direct interactions with network devices and the latter for interactions with SDN-controllers and/or orchestrators.

### gRPC & gNMI

[gNMI](https://tools.ietf.org/html/draft-openconfig-rtgwg-gnmi-spec-01) is a new addition to network management protocols based on Google's [gRPC](https://en.wikipedia.org/wiki/GRPC) and developed by [OpenConfig](https://www.openconfig.net/) working group. It is considered to be a more robust successor of NETCONF and supports [streaming telemetry](https://blogs.cisco.com/developer/getting-started-with-model-driven-telemetry).

Because gNMI is not yet as mature as NETCONF it is not very well supported in Python. Though there are a couple of libraries you can look into: [cisco-gnmi](https://github.com/cisco-ie/cisco-gnmi-python) and [pygnmi](https://github.com/akarneliuk/pygnmi).

### Summary

Here is a summary table representing the key properties of network API types.

|                     | REST       | NETCONF  | RESTCONF | gNMI |
| ------------------- | ----       | -------  | -------- | ---   |
| RFC                 | -          | [RFC 6241](https://tools.ietf.org/html/rfc6241) | [RFC 8040](https://tools.ietf.org/html/rfc8040) | [Draft](https://tools.ietf.org/html/draft-openconfig-rtgwg-gnmi-spec-01) |
| Transport           | HTTP       | SSH      | HTTP | gRPC (HTTP/2.0) |
| Data encoding       | XML, JSON  | XML     | XML, JSON | ProtoBuf (binary) |
| Transaction support | ❌          | ✅        | ❌          | ✅  |
| Python libs         | [requests](https://requests.readthedocs.io/en/master/) | [ncclient](https://github.com/ncclient/ncclient) | [requests](https://requests.readthedocs.io/en/master/) | [cisco-gnmi](https://github.com/cisco-ie/cisco-gnmi-python), [pygnmi](https://github.com/akarneliuk/pygnmi) |