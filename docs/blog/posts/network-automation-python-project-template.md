---
title: Network Automation Python Project Template
description: "How to create a reusable template to enforce best practices and consistency across your network automation Python projects."
categories:
- Tutorial
tags:
- python
- copier
- poetry
- templating
links:
  - blog/posts/dockerize-python-cli.md
date: 2023-04-24
authors:
  - dteslya
draft: true
comments: true
---

# Building a Template for a Network Automation Project

<figure markdown>
  [![feature](images/2023-04-python-project-template.jpg)](https://unsplash.com/@brizmaker)
  <figcaption>Cover photo by Alex on Unsplash</figcaption>
</figure>

Using templates for device configurations is a common practice and it has obvious benefits, such as speed and consistency. Working on many small Python automation projects made me think of employing the same approach. Previously I had to copy and adjust a lot of code-related things such as directory structure, poetry settings, CI/CD pipelines, etc. Templating all of this allowed me to reduce the initial scaffolding overhead to a minimum and jump straight into writing code. In this article, I want to share my experience in building such a template.

<!-- more -->

But first, let's focus more on the whys of project templating. Here is what I make of it:

* It brings consistency to the projects, especially when working in a team (and there are always at least you and your future self).
* It enforces the use of best practices, such as linting and formatting.
* It saves a lot of time for initial project scaffolding.

!!! info
    You can find the source code of the template in this [:material-github: repository](https://github.com/dteslya/network-automation-template).

??? tip "TL;DR"
    To use the template just run:
    ```
    copier gh:dteslya/network-automation-template /path/to/your/new/project
    ```

Before going further with the implementation details, I want to clearly define the scope of the template I'm sharing.

## Goals and requirements

I didn't have a goal of creating an all-encompassing template to cover every possible use case. This template is heavily opinionated and tailored to my needs. But I believe you can adapt it to your needs without much effort.

Below are the assumptions I kept in mind while creating the template.

### Functional requirements

* The project intended use is fairly simple network automation scripting.
* It must be consumed as a CLI tool ([Typer](https://typer.tiangolo.com/) and [Rich](https://github.com/Textualize/rich)).
* It can be run either as a Python script or as a Docker container (see my previous [post](dockerize-python-cli.md)).
* It can be run either locally (when developing) or as a CI/CD job on a self-hosted [Gitlab CI](https://docs.gitlab.com/ee/ci/) instance.
* It's supposed to connect to network devices and query the Source of Truth system, in my case [Nautobot](https://www.networktocode.com/nautobot/) ([Nornir](https://nornir.tech/) and [Netmiko](https://github.com/ktbyers/netmiko)).
* Because it interacts with external data sources, data must be parsed and validated ([Pydantic](https://docs.pydantic.dev/)).

### Code management requirements

* Packaging and dependency management must be automated ([Poetry](https://python-poetry.org/)).
* The resulting project must adhere to the [src layout](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/).
* Common housekeeping tasks must be automated ([Invoke](https://www.pyinvoke.org/)).
* The code must be type-hinted and checked with [mypy](https://mypy-lang.org/).
* Linting and formatting must be applied to code before committing to Git ([pre-commit](https://pre-commit.com/)).
* Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification ([Commitizen](https://commitizen-tools.github.io/commitizen/)).
* Changelog must be created automatically and follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) specification. Also covered by Commitizen.
* There should be a choice of license when creating a project. Currently, I included only APL 2.0, GPLv3, and MIT. Easily extendable.

### What was left out of the scope

At least for now, this template doesn't include:

* Documentation building tools
* Test automation tools
* `CODE_OF_CONDUCT.md`
* `CONTRIBUTING.md`

## Choice of tooling

A quick googling for project templating software gives not so many options.

This is the list I've been stumbling upon here and there:

* [Cookiecutter](https://www.cookiecutter.io/). Probably the most popular one, with lots of pre-made templates. Written in Python.
* [Yeoman](https://yeoman.io/). A bit less popular, and focused on web apps. Written in JS.
* [Copier](https://copier.readthedocs.io/en/stable/). The least popular, but modern and has some unique features. Written in Python.

I chose Copier because of my irrational desire to try everything new and shiny. The ability to apply updated templates to already created projects also had its appeal.

The project's documentation features a nice [comparison table](https://copier.readthedocs.io/en/stable/comparisons/) where you can find key differences from other templating tools.

## Project structure

Now that we know what we want let's look closer at the template implementation.

Below is the project structure of the template. Click :material-plus-circle: for more details.

```bash
.
├── project # (1)!
│   ├── docker
│   │   ├── Dockerfile.jinja # (2)!
│   │   └── docker-entrypoint.sh.jinja # (3)!
│   ├── src # (4)!
│   │   └── {{python_package_import_name}} # (5)!
│   │       ├── __init__.py.jinja
│   │       ├── cli.py.jinja # (6)!
│   │       ├── data_models.py.jinja # (7)!
│   │       ├── logger.py.jinja # (8)!
│   │       ├── py.typed # (9)!
│   │       ├── run.py.jinja # (10)!
│   │       └── settings.py.jinja # (11)!
│   ├── tests # (12)!
│   │   └── test_version.py.jinja
│   ├── .gitignore
│   ├── .gitlab-ci.yml.jinja # (13)!
│   ├── .pre-commit-config.yaml.jinja # (14)!
│   ├── LICENSE.md.jinja
│   ├── README.md.jinja
│   ├── pyproject.toml.jinja # (15)!
│   ├── run-in-docker.sh # (16)!
│   ├── tasks.py.jinja # (17)!
│   └── {{_copier_conf.answers_file}}.jinja # (18)!
├── .cz.toml # (19)!
├── .gitignore
├── .pre-commit-config.yaml # (20)!
├── CHANGELOG.md
├── LICENSE.md
├── README.md
├── copier.yml # (21)!
└── tasks.py # (22)!
```

1. Project template directory. I prefer to store all the template files in a separate directory.
2. `Dockerfile` used to build a docker image to run the script as a container.
3. Docker image [entrypoint](https://docs.docker.com/engine/reference/builder/#entrypoint) script
4. Where the Python package code resides. See [src layout](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/).
5. You can use Jinja variables to generate directory and file names.
6. Python package [entrypoint](https://packaging.python.org/en/latest/specifications/entry-points/) (i.e., what executes when you run the package).
7. A place for Pydantic [datamodels](https://docs.pydantic.dev/usage/models/).
8. Custom logger is defined here.
9. A marker file indicating that the package is [type-hinted](https://peps.python.org/pep-0561/). See [this post](https://blog.whtsky.me/tech/2021/dont-forget-py.typed-for-your-typed-python-package/) for more details.
10. Example module where the main logic is supposed to reside.
11. Script settings, such as API access tokens.
12. Where tests should go. I included a simple test to check the package version just as a placeholder.
13. [Gitlab CI/CD](https://docs.gitlab.com/ee/ci/yaml/gitlab_ci_yaml.html) configuration.
14. Project pre-commit configuration.
15. Project meta-information. Used mostly by Poetry, but also includes settings for linters and formatters.
16. Helper script to run the script as a container.
17. Invoke housekeeping tasks.
18. Copier answers file. Used for updating the project with a new version of the template.
19. Template repository commitizen configuration.
20. Template repository pre-commit configuration.
21. Copier configuration file.
22. Invoke housekeeping tasks for the template repository.

!!! Info
    A few words on how Copier works. On a basic level, it's pretty straightforward: a user runs `copier` command, answers configured questions, Copier renders the target files from Jinja2 templates, substituting the variables with values provided by a user.

This layout differs a bit from what Copier expects by default by placing the template in a separate directory called `project`(1). This enables a clear separation of the template and its metadata.
{ .annotate }

1. `_subdirectory` setting in `copier.yml`

## Gitlab CI requirements

The `.gitlab-ci.yml` configuration supplied with this template expects the following from your self-hosted Gitlab CI instance:

* A [runner](https://docs.gitlab.com/runner/#use-self-managed-runners) with the Docker [executor](https://docs.gitlab.com/runner/executors/) tagged with `docker`.
* A runner with the Linux shell executor tagged with `shell`.
* Because the `shell` runner is used to run your automation script it is supposed to have network access to the external resources your script interacts with (e.g., ssh access to network devices).

The following environment variables are supposed to be set and accessible by your Gitlab project:

| Variable | Description |
| --- | --- |
| `DOCKER_REGISTRY_RO_PASSWORD` | Account password with read-only access to the private Docker registry |
| `DOCKER_REGISTRY_RO_USER` | Account username with read-only access to the private Docker registry |
| `DOCKER_REGISTRY_RW_PASSWORD` | Account password with read-write access to the private Docker registry |
| `DOCKER_REGISTRY_RW_USER` | Account username with read-write access to the private Docker registry |
| `DOCKER_REGISTRY_URL` | Private Docker registry URL |

Of course, you are free to adjust anything to your needs. Just make sure that the environment variables used in the `.gitlab-ci.yml` match those configured in Gitlab.

## Demo

Now let's generate a project out of this template.

<div id="copier_create_from_template" style="z-index: 1; position: relative; max-width: 100%;"></div>
<script>
  window.onload = function(){
    AsciinemaPlayer.create('/asciinema/copier_create_from_template.cast', document.getElementById('copier_create_from_template'), data={poster: 'npt:0:52'});
    AsciinemaPlayer.create('/asciinema/copier_run_script.cast', document.getElementById('copier_run_script'), data={poster: 'npt:0:15'});
}
</script>

This created the project directory with all the needed files.

Now we can install the dependencies and check that the `hello_world` function from the included script works.

<div id="copier_run_script" style="z-index: 1; position: relative; max-width: 100%;"></div>

!!! warning
    I deliberately included a couple of dummy secrets in `settings.py` file just for the demo to work out of the box. Otherwise, I'd have to define them as environment variables before running the demo. Don't forget to remove them before committing your changes.

At this point, you're ready to proceed with the development of your script.

## Acknowledgments

1. [How to use copier to create project templates](https://haseebmajid.dev/posts/2022-12-01-how-to-use-copier-to-create-project-templates/) by Haseeb Majid
2. [Copier Poetry](https://github.com/pawamoy/copier-poetry) template by Timothée Mazzucotelli
3. [Python Packages Project Generator](https://github.com/TezRomacH/python-package-template) by Roman Tezikov