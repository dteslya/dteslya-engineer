---
icon: simple/databricks
---

# Data Models and Encodings

Understanding how data can be structured and encoded is very important in programming in general and network automation in particular.

## YANG & Openconfig

YANG (Yet Another Next Generation) is a data modeling language originally developed for [NETCONF](#netconf--restconf) and defined in [RFC 6020](https://tools.ietf.org/html/rfc6020) and then updated in [RFC 7950](https://tools.ietf.org/html/rfc7950). YANG and NETCONF can be considered as successors to [SMIng](https://tools.ietf.org/html/rfc3780) and [SNMP](https://en.wikipedia.org/wiki/Simple_Network_Management_Protocol) respectively. 

>YANG provides a format-independent way to describe a data model that can be represented in XML or JSON.
>
> <cite>Jason Edelman, Scott S. Lowe, Matt Oswalt. Network Programmability and Automation, p. 183</cite>

There are [hundreds](https://github.com/YangModels/yang) of YANG data models available both [vendor-neutral](https://github.com/openconfig/public) and vendor-specific. The [YANG catalog](https://yangcatalog.org/) web site can be helpful if you need to find data models relevant to your tasks.

Because of this abundance of data models and lack of coordination between standards developing organizations and vendors it seems that YANG and NETCONF are going the same path SNMP went (i.e. used only for data retrieval, but not configuration). [OpenConfig](https://www.openconfig.net/) workgroup tries to solve this by providing vendor-neutral data models, but I think that [Ivan Pepelnjak's](https://blog.ipspace.net/2018/01/use-yang-data-models-to-configure.html) point from 2018 stating that "*seamless multi-vendor network device configuration is still a pipe dream*" still holds in 2020.

## XML

[XML](https://en.wikipedia.org/wiki/XML) (eXtensible Markup Language) although a bit old is still widely used in various APIs. It uses tags to encode data hence is a bit hard to read by humans. It was initially designed for documents but is suitable to represent arbitrary data structures.

You can refer to this [tutorial](https://www.w3schools.com/xml/) to learn more about XML.

Let's see how this sample CLI output of Cisco IOS `show vlan` command can be encoded with XML:

=== "CLI output"

    ```cisco
    VLAN Name                             Status    Ports
    ---- -------------------------------- ---------   -------------------------------
    1    default                          active    Gi3/4, Gi3/5, Gi4/11

    <...>

    VLAN Type  SAID       MTU   Parent RingNo BridgeNo Stp  BrdgMode Trans1 Trans2
    ---- ----- ---------- ----- ------ ------ -------- ---- -------- ------ ------
    1    enet  100001     1500  -      -      -        -    -        0      0
    ```

=== "XML"

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

## YAML

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

## JSON

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

## Summary

Here is a summary table representing the key properties of the described data formats.

|  | XML | YAML | JSON |
| --- | --- | --- | --- |
| Human readable | not really | yes | yes |
| Purpose | documents, APIs | configuration files | APIs |
| Python libs | [xml](https://docs.python.org/3/library/xml.html), [lxml](https://lxml.de/) | [PyYAML](https://pyyaml.org/wiki/PyYAMLDocumentation) | [json](https://docs.python.org/3/library/json.html) |

There are online tools like [this one](https://codebeautify.org/yaml-to-json-xml-csv) to convert data between all three formats.