# Parsing

## TextFSM and NTC Templates

[TextFSM](https://github.com/google/textfsm) is a Python module created by Google which purpose is to parse semi-formatted text (i.e. CLI output). It takes a template file and text as input and produces structured output. [NTC templates](https://github.com/networktocode/ntc-templates) is a collection of TextFSM templates for a variety of networking vendors. TextFSM can be used in conjunction with [netmiko](https://pynet.twb-tech.com/blog/automation/netmiko-textfsm.html) and [scrapli](https://github.com/carlmontanari/scrapli#textfsmntc-templates-integration).

## TTP (Template Text Parser)

[TTP](https://ttp.readthedocs.io/en/latest/Overview.html) is the newest addition to the text parsing tools. It's also based on templates that resemble Jinja2 syntax but work in reverse. A simple TTP template looks much like the text it is aimed to parse but the parts you want to extract are put in {{ curly braces }}. It doesn't have a collection of prebuilt templates but given its relative ease of use, you can quickly create your own.

## PyATS & Genie

[These internal Cisco tools](https://developer.cisco.com/docs/pyats/) were publicly released a few years back and continue to develop rapidly. PyATS is a testing and automation framework. It has a lot to it and I encourage you to learn about it on Cisco DevNet resources. Here I would like to focus on two libraries within the PyATS framework: [Genie parser](https://github.com/CiscoTestAutomation/genieparser) and [Dq](https://pubhub.devnetcloud.com/media/genie-docs/docs/userguide/utils/index.html#dq). The first one as the name implies is aimed to parse CLI output and has a [huge collection](https://pubhub.devnetcloud.com/media/genie-feature-browser/docs/#/parsers) (2000+) of ready-made parsers for various devices (not limited to Cisco). The second one, Dq, is a great time saver when you need to access the parsed data. Often parsers such as Genie return data in complex data structures (e.g. nested dictionaries) and to access something you would need loops if statements and a strong understanding of where to look. With Dq, you can make queries without much caring of where in a nested structure your data resides.