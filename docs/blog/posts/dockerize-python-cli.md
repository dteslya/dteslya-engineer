---
title: How to Run a Python CLI Tool Inside a Docker Container
description: "A tutorial on building a simple Python automation CLI tool and running it as a Docker container"
categories:
- Tutorial
tags:
- python
- docker
- poetry
- typer
date: 2022-07-14
authors:
  - dteslya
draft: false
comments: true
---

# How to Run a Python CLI Tool Inside a Docker Container

<figure markdown>
  [![feature](images/2022-07-python-cli-in-docker.jpg)](https://unsplash.com/@diomari)
  <figcaption>Cover photo by Diomari Madulara</figcaption>
</figure>

Have you ever faced a problem sharing your python scripts with the rest of your team? You need to ensure a lot of things for your script to run on a recipient's machine. This often involves ensuring that the Python interpreter's correct version and all the dependencies are installed among other things. To put it mildly, portability is not Python's strong suit. That's where Docker can come in handy.

<!-- more -->

There are a lot of articles on how to run Flask or FastAPI apps in Docker. But I had a hard time finding tutorials about running CLI utilities in a container in an ad-hoc fashion with the ability to pass arguments.

I relied heavily on these articles while making this tutorial:

- [Python CLI Utilities with Poetry and Typer](https://www.pluralsight.com/tech-blog/python-cli-utilities-with-poetry-and-typer) by John Walk
- [Python and Poetry on Docker](https://bmaingret.github.io/blog/2021-11-15-Docker-and-Poetry) by Baptiste Maingret
- [Hypermodern Python](https://cjolowicz.github.io/posts/hypermodern-python-01-setup/) by Claudio Jolowicz

This tutorial comes with an accompanying [GitHub repository](https://github.com/dteslya/blog-dockerize-python-cli-tool).

## Building the Python App

For this tutorial, I will use a simple command-line application that utilizes the [Nornir](https://nornir.tech/) framework to render device configurations from a Jinja2 template. It relies on the [Typer](https://typer.tiangolo.com/) library to create a command-line interface.

I use [Pyenv](https://github.com/pyenv/pyenv) and [Poetry](https://python-poetry.org/) to manage the local dev environment. Setting up and using those tools is out of the scope of this tutorial. Please, refer to the [Hypermodern Python](https://cjolowicz.github.io/posts/hypermodern-python-01-setup/) series of articles for more info.

You can clone the accompanying Git repo so it will be easier to follow this tutorial.

```bash
git clone https://github.com/dteslya/blog-dockerize-python-cli-tool
```

Let's take a look at the project structure.

```bash
├── README.md
├── configs
├── docker
│   ├── Dockerfile
│   └── docker-entrypoint.sh
├── inventory
│   └── hosts.yml
├── nornir_config.yml
├── poetry.lock
├── pyproject.toml
├── run-in-docker.sh
├── src
│   └── nornir_example
│       ├── __init__.py
│       ├── cli.py
│       └── functions.py
└── templates
    └── config.j2
```

Let's begin with the `src/nornir_example` directory where the Python app resides.
The `cli.py` is the main script we invoke in order to use the app.
It takes two arguments as commands:

- `init` which simply creates a local directory to put rendered configs to
- `create-configs` which renders the configurations and puts them in the local dir

Let's take a closer look at the `create-configs` command. Below is the source code of the function which is called by this command:

```python
@app.command()
def create_configs(
    template_dir: Optional[str] = typer.Option(
        TEMPLATE_DIR, help="Directory to look for configuration templates"
    ),
    output_dir: Optional[str] = typer.Option(
        OUTPUT_DIR, help="Directory to put resulting configs"
    ),
):
    """
    Generate device configurations and put them to local directory.
    """

    nr = InitNornir(config_file="nornir_config.yml")

    print_result(nr.run(task=render_config, template_dir=template_dir))
    print_result(nr.run(task=write_config, output_dir=output_dir))
```

It can take two options from the user:

- `--template-dir` - where to look for the Jinja2 template files
- `--output-dir` - where to put the resulting configs

If those options are not passed by the user the default values take place.

So what happens here.

**First**, a `Nornir` object is initialized with the `nornir_config.yml` configuration file. In this simple example, the sole purpose of this config is to tell Nornir where to look for the [inventory](https://nornir.readthedocs.io/en/v3.3.0/tutorial/inventory.html). I use only the `host_file` here which is `inventory/hosts.yml`.

```yaml
swtich01:
  data:
    interfaces:
      - name: Vlan10
        description: Management
        ip: 10.0.10.1
        mask: 255.255.255.0
swtich02:
  data:
    interfaces:
      - name: Vlan10
        description: Management
        ip: 10.0.10.2
        mask: 255.255.255.0
swtich03:
  data:
    interfaces:
      - name: Vlan10
        description: Management
        ip: 10.0.10.3
        mask: 255.255.255.0
```

As you can see it's quite simple and describes 3 devices and their interface data.

**Second**, the `render_config` task creates a device configuration by populating the Jinja2 template with the device data. It then puts the resulting config in the dedicated host variable `task.host['config']`.

The Jinja2 template is also very simple.

```bash
hostname {{ host }}
!
{% for interface in host.interfaces %}
interface {{ interface.name }}
 description {{ interface.description }}
 ip address {{ interface.ip }} {{ interface.mask }}
!
{% endfor %}
```

**And finally**, the `write_config` task takes the config saved in the `task.host["config"]` variable and writes it to a file in a local directory for each host in the inventory.

## Running the App in the Local Environment

Now that we figured out how our app works let's try to run it locally. First, we need to initialize a virtual environment and install dependencies.

```bash
$ poetry install
Installing dependencies from lock file

Package operations: 28 installs, 0 updates, 0 removals

  • Installing ruamel.yaml.clib (0.2.6)
  • Installing markupsafe (2.1.1)
  • Installing mypy-extensions (0.4.3)
  • Installing pyparsing (3.0.9)
  • Installing ruamel.yaml (0.17.21)
  • Installing typing-extensions (4.3.0)
  • Installing attrs (21.4.0)
  • Installing click (8.1.3)
  • Installing colorama (0.4.5)
  • Installing jinja2 (3.1.2)
  • Installing mccabe (0.6.1)
  • Installing more-itertools (8.13.0)
  • Installing nornir (3.3.0)
  • Installing packaging (21.3)
  • Installing pathspec (0.9.0)
  • Installing platformdirs (2.5.2)
  • Installing pluggy (0.13.1)
  • Installing py (1.11.0)
  • Installing pycodestyle (2.8.0)
  • Installing pyflakes (2.4.0)
  • Installing wcwidth (0.2.5)
  • Installing tomli (2.0.1)
  • Installing black (22.6.0)
  • Installing flake8 (4.0.1)
  • Installing nornir-jinja2 (0.2.0)
  • Installing nornir-utils (0.2.0)
  • Installing pytest (5.4.3)
  • Installing typer (0.4.2)

Installing the current project: nornir-example (0.1.0)
```

Then we can run the app by issuing the `poetry run cli` command.

```bash
$ poetry run cli
Usage: cli [OPTIONS] COMMAND [ARGS]...
Try 'cli --help' for help.

Error: Missing command.
```

As you can see it gives an error because we didn't supply any arguments.

With the `--help` argument we can see the help message automatically generated by `Typer`.

```bash
$ poetry run cli --help
Usage: cli [OPTIONS] COMMAND [ARGS]...

  Simple Nornir Example

Options:
  --install-completion [bash|zsh|fish|powershell|pwsh]
                                  Install completion for the specified shell.
  --show-completion [bash|zsh|fish|powershell|pwsh]
                                  Show completion for the specified shell, to
                                  copy it or customize the installation.
  --help                          Show this message and exit.

Commands:
  create-configs  Generate device configurations and put them to local...
  init            Initialize working directory
```

Let's create config files.

First, we need to create a directory where configs will be written.

```bash
$ poetry run cli init
Creating directories...
Directory 'configs' created
Init complete
```

Now we can run the `create-configs` command.

```bash
$ poetry run cli create-configs
render_config*******************************************************************
* switch01 ** changed : False **************************************************
vvvv render_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Render config ** changed : False ------------------------------------------ INFO
hostname switch01
!
interface Vlan10
 description Management
 ip address 10.0.10.1 255.255.255.0
!

^^^^ END render_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
* switch02 ** changed : False **************************************************
vvvv render_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Render config ** changed : False ------------------------------------------ INFO
hostname switch02
!
interface Vlan10
 description Management
 ip address 10.0.10.2 255.255.255.0
!

^^^^ END render_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
* switch03 ** changed : False **************************************************
vvvv render_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Render config ** changed : False ------------------------------------------ INFO
hostname switch03
!
interface Vlan10
 description Management
 ip address 10.0.10.3 255.255.255.0
!

^^^^ END render_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
write_config********************************************************************
* switch01 ** changed : True ***************************************************
vvvv write_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Save configs ** changed : True -------------------------------------------- INFO
--- configs/switch01-config.txt

+++ new

@@ -0,0 +1,6 @@

+hostname switch01
+!
+interface Vlan10
+ description Management
+ ip address 10.0.10.1 255.255.255.0
+!
^^^^ END write_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
* switch02 ** changed : True ***************************************************
vvvv write_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Save configs ** changed : True -------------------------------------------- INFO
--- configs/switch02-config.txt

+++ new

@@ -0,0 +1,6 @@

+hostname switch02
+!
+interface Vlan10
+ description Management
+ ip address 10.0.10.2 255.255.255.0
+!
^^^^ END write_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
* switch03 ** changed : True ***************************************************
vvvv write_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Save configs ** changed : True -------------------------------------------- INFO
--- configs/switch03-config.txt

+++ new

@@ -0,0 +1,6 @@

+hostname switch03
+!
+interface Vlan10
+ description Management
+ ip address 10.0.10.3 255.255.255.0
+!
^^^^ END write_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

Now, if we look at the `configs` directory, we'll find three files there.

```bash
$ ls -l configs
total 12
-rw-rw-r-- 1 dmitry.teslya dmitry.teslya 99 Jul 12 12:36 switch01-config.txt
-rw-rw-r-- 1 dmitry.teslya dmitry.teslya 99 Jul 12 12:36 switch02-config.txt
-rw-rw-r-- 1 dmitry.teslya dmitry.teslya 99 Jul 12 12:36 switch03-config.txt
```

Here is the first device config, for example.

```bash
$ cat configs/switch01-config.txt
hostname switch01
!
interface Vlan10
 description Management
 ip address 10.0.10.1 255.255.255.0
!
```

So at this point, our example app runs in the local environment as expected. Now let's put it into a container.

## Building a Docker Image

To build an image we'll use the `Dockerfile` located in the `docker` directory. This is a slightly modified version of the [Dockerfile](https://github.com/bmaingret/coach-planner/blob/main/docker/Dockerfile) from Baptiste Maingret's blog post [Python and Poetry on Docker](https://bmaingret.github.io/blog/2021-11-15-Docker-and-Poetry). Below are the main differences:

- No `development` stage
- `python:<version>-slim` base image instead of `python:<version>` to achieve smaller image size

If you wish to learn more about multi-stage builds and how each stage works I encourage you to read the [original post](https://bmaingret.github.io/blog/2021-11-15-Docker-and-Poetry). I don't see a point in repeating it all here.

Now let's try and build the image.

```bash
$ docker build --tag nornir_example --file docker/Dockerfile .
Sending build context to Docker daemon  264.7kB
Step 1/33 : ARG APP_NAME=nornir_example
Step 2/33 : ARG APP_PATH=/opt/$APP_NAME
Step 3/33 : ARG PYTHON_VERSION=3.10.5
Step 4/33 : ARG POETRY_VERSION=1.1.14
Step 5/33 : FROM python:$PYTHON_VERSION-slim as staging
3.10.5-slim: Pulling from library/python
461246efe0a7: Pull complete
e37ebf440f7f: Pull complete
07053eece5a2: Pull complete
912bc51860fb: Pull complete
40c89643d0cd: Pull complete
Digest: sha256:b208c71e1d72864460394cc648c6b5c1ddac6f8587af4a3a54b7be575353f5d0
Status: Downloaded newer image for python:3.10.5-slim
 ---> ba94a8d11761
Step 6/33 : ARG APP_NAME
 ---> Running in a776b2225274
Removing intermediate container a776b2225274
 ---> 29cdb0b73534
Step 7/33 : ARG APP_PATH
 ---> Running in 21a63ae8c42a
Removing intermediate container 21a63ae8c42a
 ---> ae644555434e
Step 8/33 : ARG POETRY_VERSION
 ---> Running in fea008b79cef
Removing intermediate container fea008b79cef
 ---> 6abfb54c244b
Step 9/33 : ENV     PYTHONDONTWRITEBYTECODE=1     PYTHONUNBUFFERED=1     PYTHONFAULTHANDLER=1
 ---> Running in 835da12b6314
Removing intermediate container 835da12b6314
 ---> 19ecf8de5dc7
Step 10/33 : ENV     POETRY_VERSION=$POETRY_VERSION     POETRY_HOME="/opt/poetry"     POETRY_VIRTUALENVS_IN_PROJECT=true     POETRY_NO_INTERACTION=1
 ---> Running in e5fd0702b6a6
Removing intermediate container e5fd0702b6a6
 ---> 9db6bc0e296f
Step 11/33 : RUN apt-get update     && apt-get install --no-install-recommends -y         curl         build-essential
 ---> Running in 3677cc0af114

<SKIPPED>

Removing intermediate container 3677cc0af114
 ---> c5bda617b63c
Step 12/33 : RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/install-poetry.py | python
 ---> Running in 3c75a7c4d1d9
The canonical source for Poetry\'s installation script is now https://install.python-poetry.org. Please update your usage to reflect this.
Retrieving Poetry metadata

# Welcome to Poetry!

This will download and install the latest version of Poetry,
a dependency and package manager for Python.

It will add the `poetry` command to Poetry\'s bin directory, located at:

/opt/poetry/bin

You can uninstall at any time by executing this script with the --uninstall option,
and these changes will be reverted.

Installing Poetry (1.1.14)
Installing Poetry (1.1.14): Creating environment
Installing Poetry (1.1.14): Installing Poetry
Installing Poetry (1.1.14): Creating script
Installing Poetry (1.1.14): Done

Poetry (1.1.14) is installed now. Great!

To get started you need Poetry\'s bin directory (/opt/poetry/bin) in your `PATH`
environment variable.

Add `export PATH="/opt/poetry/bin:$PATH"` to your shell configuration file.

Alternatively, you can call Poetry explicitly with `/opt/poetry/bin/poetry`.

You can test that everything is set up by executing:

`poetry --version`

Removing intermediate container 3c75a7c4d1d9
 ---> e68500b33d93
Step 13/33 : ENV PATH="$POETRY_HOME/bin:$PATH"
 ---> Running in 9419724f2c8f
Removing intermediate container 9419724f2c8f
 ---> d21e67124847
Step 14/33 : WORKDIR $APP_PATH
 ---> Running in b5c81bfadabc
Removing intermediate container b5c81bfadabc
 ---> 42c9d8478d01
Step 15/33 : COPY ./poetry.lock ./pyproject.toml ./
 ---> aca27919e86c
Step 16/33 : COPY ./src/$APP_NAME ./src/$APP_NAME
 ---> c0e14f41b02d
Step 17/33 : FROM staging as build
 ---> c0e14f41b02d
Step 18/33 : ARG APP_PATH
 ---> Running in 4494ee70b3d4
Removing intermediate container 4494ee70b3d4
 ---> 1a0107af91c4
Step 19/33 : WORKDIR $APP_PATH
 ---> Running in 980956355e03
Removing intermediate container 980956355e03
 ---> bc18c71f9e76
Step 20/33 : RUN poetry build --format wheel
 ---> Running in 3ae79f203263
Creating virtualenv nornir-example in /opt/nornir_example/.venv
Building nornir-example (0.1.0)
  - Building wheel
  - Built nornir_example-0.1.0-py3-none-any.whl
Removing intermediate container 3ae79f203263
 ---> 29fbb6dbc6a1
Step 21/33 : RUN poetry export --format requirements.txt --output constraints.txt --without-hashes
 ---> Running in 6e2db6b40cef
Removing intermediate container 6e2db6b40cef
 ---> e89a9d03f210
Step 22/33 : FROM python:$PYTHON_VERSION-slim as production
 ---> ba94a8d11761
Step 23/33 : ARG APP_NAME
 ---> Using cache
 ---> 29cdb0b73534
Step 24/33 : ARG APP_PATH
 ---> Using cache
 ---> ae644555434e
Step 25/33 : ENV     PYTHONDONTWRITEBYTECODE=1     PYTHONUNBUFFERED=1     PYTHONFAULTHANDLER=1
 ---> Running in eef7402691d2
Removing intermediate container eef7402691d2
 ---> a0f9365b2042
Step 26/33 : ENV     PIP_NO_CACHE_DIR=off     PIP_DISABLE_PIP_VERSION_CHECK=on     PIP_DEFAULT_TIMEOUT=100
 ---> Running in 25aca6fae069
Removing intermediate container 25aca6fae069
 ---> 5c78828a234b
Step 27/33 : WORKDIR $APP_PATH
 ---> Running in bafbe527e199
Removing intermediate container bafbe527e199
 ---> 5baf48bc673a
Step 28/33 : COPY --from=build $APP_PATH/dist/*.whl ./
 ---> 5a36bbbaff1c
Step 29/33 : COPY --from=build $APP_PATH/constraints.txt ./
 ---> 4418032f2b79
Step 30/33 : RUN pip install ./$APP_NAME*.whl --constraint constraints.txt
 ---> Running in 6dee852a57b2
Processing ./nornir_example-0.1.0-py3-none-any.whl
Collecting typer<0.5.0,>=0.4.2
  Downloading typer-0.4.2-py3-none-any.whl (27 kB)
Collecting nornir<4.0.0,>=3.3.0
  Downloading nornir-3.3.0-py3-none-any.whl (30 kB)
Collecting nornir-jinja2<0.3.0,>=0.2.0
  Downloading nornir_jinja2-0.2.0-py3-none-any.whl (7.2 kB)
Collecting nornir-utils<0.3.0,>=0.2.0
  Downloading nornir_utils-0.2.0-py3-none-any.whl (15 kB)
Collecting typing_extensions<5.0,>=4.1
  Downloading typing_extensions-4.3.0-py3-none-any.whl (25 kB)
Collecting mypy_extensions<0.5.0,>=0.4.1
  Downloading mypy_extensions-0.4.3-py2.py3-none-any.whl (4.5 kB)
Collecting ruamel.yaml>=0.17
  Downloading ruamel.yaml-0.17.21-py3-none-any.whl (109 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 109.5/109.5 KB 2.7 MB/s eta 0:00:00
Collecting jinja2<4,>=2.11.2
  Downloading Jinja2-3.1.2-py3-none-any.whl (133 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 133.1/133.1 KB 15.3 MB/s eta 0:00:00
Collecting colorama<0.5.0,>=0.4.3
  Downloading colorama-0.4.5-py2.py3-none-any.whl (16 kB)
Collecting click<9.0.0,>=7.1.1
  Downloading click-8.1.3-py3-none-any.whl (96 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 96.6/96.6 KB 5.5 MB/s eta 0:00:00
Collecting MarkupSafe>=2.0
  Downloading MarkupSafe-2.1.1-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (25 kB)
Collecting ruamel.yaml.clib>=0.2.6
  Downloading ruamel.yaml.clib-0.2.6-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.manylinux_2_24_x86_64.whl (519 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 519.3/519.3 KB 8.5 MB/s eta 0:00:00
Installing collected packages: mypy_extensions, typing_extensions, ruamel.yaml.clib, MarkupSafe, colorama, click, typer, ruamel.yaml, jinja2, nornir, nornir-utils, nornir-jinja2, nornir-example
Successfully installed MarkupSafe-2.1.1 click-8.1.3 colorama-0.4.5 jinja2-3.1.2 mypy_extensions-0.4.3 nornir-3.3.0 nornir-example-0.1.0 nornir-jinja2-0.2.0 nornir-utils-0.2.0 ruamel.yaml-0.17.21 ruame
l.yaml.clib-0.2.6 typer-0.4.2 typing_extensions-4.3.0
WARNING: Running pip as the 'root' user can result in broken permissions and conflicting behaviour with the system package manager. It is recommended to use a virtual environment instead: https://pip.
pypa.io/warnings/venv
Removing intermediate container 6dee852a57b2
 ---> 5a3be02fcc1a
Step 31/33 : COPY ./docker/docker-entrypoint.sh /docker-entrypoint.sh
 ---> 445bd843b629
Step 32/33 : RUN chmod +x /docker-entrypoint.sh
 ---> Running in 53d731f0222f
Removing intermediate container 53d731f0222f
 ---> 504187ebd4d1
Step 33/33 : ENTRYPOINT ["/docker-entrypoint.sh"]
 ---> Running in 17562594a0df
Removing intermediate container 17562594a0df
 ---> 0cab130862b5
Successfully built 0cab130862b5
Successfully tagged nornir_example:latest
```

You can see that the image was created and tagged:

```bash
$ docker images
REPOSITORY                                                      TAG           IMAGE ID       CREATED          SIZE
nornir_example                                                  latest        0cab130862b5   19 minutes ago   130MB
<none>                                                          <none>        e89a9d03f210   19 minutes ago   496MB
python                                                          3.10.5-slim   ba94a8d11761   3 hours ago      125MB
```

Now lets run it.

## Running the App Inside a Container

When you start a container, Docker looks for `CMD` or `ENTRYPOINT` instructions which tell what to execute inside a container. In our case, we specify only the `ENTRYPOINT`:

```bash
ENTRYPOINT ["/docker-entrypoint.sh"]
```

Let's take a look at this entry point script:

```bash
#!/bin/sh

set -e

if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- cli "$@"
fi

exec "$@"
```

To be honest I stole it from the [curl](https://curl.se/) Docker image [entrypoint](https://github.com/curl/curl-docker/blob/master/alpine/latest/entrypoint.sh) :sweat_smile:

So let's break it down and try to understand what it does:

- `"${1#-}" != "${1}"` checks if the first passed argument starts with a `-`
- `||` execute the second check only if the first one returned `False`
- `-z "$(command -v "${1}")"` checks if the passed argument is not a legitimate executable (`command -v` is an equivalent of `which`)
- If either of the checks returns `True` the passed arguments are added to the `cli` arguments
- Otherwise, the passed arguments are treated as a command

This allows you either to pass arguments to the `cli` app or run other commands inside the container. For example, you can list files inside the container with the `ls` command.

```bash
$ docker run nornir_example ls -l
total 8
-rw-r--r-- 1 root root 1268 Jul 13 08:00 constraints.txt
-rw-r--r-- 1 root root 2945 Jul 13 08:00 nornir_example-0.1.0-py3-none-any.whl
```

But when for instance you pass the `--help` argument it becomes the `cli` app option.

```bash
$ docker run nornir_example --help
Usage: cli [OPTIONS] COMMAND [ARGS]...

  Simple Nornir Example

Options:
  --install-completion [bash|zsh|fish|powershell|pwsh]
                                  Install completion for the specified shell.
  --show-completion [bash|zsh|fish|powershell|pwsh]
                                  Show completion for the specified shell, to
                                  copy it or customize the installation.
  --help                          Show this message and exit.

Commands:
  create-configs  Generate device configurations and put them to local...
  init            Initialize working directory
```

At this point, everything seems fine. But as you remember, our example app interacts with files and directories. So for it to be able to read and write files, we need to mount the working directory inside the container.

Let's do it and run the `init` command.

```bash
$ docker run  -v $(pwd):/opt/nornir_example nornir_example init
Creating directories...
Directory 'configs' created
Init complete
```

Ok, now we can try and create config files.

```bash
$ docker run -v $(pwd):/opt/nornir_example nornir_example create-configs
render_config*******************************************************************
* switch01 ** changed : False **************************************************
vvvv render_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Render config ** changed : False ------------------------------------------ INFO
hostname switch01
!
interface Vlan10
 description Management
 ip address 10.0.10.1 255.255.255.0
!

^^^^ END render_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
* switch02 ** changed : False **************************************************
vvvv render_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Render config ** changed : False ------------------------------------------ INFO
hostname switch02
!
interface Vlan10
 description Management
 ip address 10.0.10.2 255.255.255.0
!

^^^^ END render_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
* switch03 ** changed : False **************************************************
vvvv render_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Render config ** changed : False ------------------------------------------ INFO
hostname switch03
!
interface Vlan10
 description Management
 ip address 10.0.10.3 255.255.255.0
!

^^^^ END render_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
write_config********************************************************************
* switch01 ** changed : True ***************************************************
vvvv write_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Save configs ** changed : True -------------------------------------------- INFO
--- configs/switch01-config.txt

+++ new

@@ -0,0 +1,6 @@

+hostname switch01
+!
+interface Vlan10
+ description Management
+ ip address 10.0.10.1 255.255.255.0
+!
^^^^ END write_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
* switch02 ** changed : True ***************************************************
vvvv write_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Save configs ** changed : True -------------------------------------------- INFO
--- configs/switch02-config.txt

+++ new

@@ -0,0 +1,6 @@

+hostname switch02
+!
+interface Vlan10
+ description Management
+ ip address 10.0.10.2 255.255.255.0
+!
^^^^ END write_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
* switch03 ** changed : True ***************************************************
vvvv write_config ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
---- Save configs ** changed : True -------------------------------------------- INFO
--- configs/switch03-config.txt

+++ new

@@ -0,0 +1,6 @@

+hostname switch03
+!
+interface Vlan10
+ description Management
+ ip address 10.0.10.3 255.255.255.0
+!
^^^^ END write_config ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

Let's take a look at the resulting files.

```bash
$ ls -la configs
total 20
drwxr-xr-x 2 root          root          4096 Jul 13 09:49 .
drwxrwxr-x 9 dmitry.teslya dmitry.teslya 4096 Jul 13 09:43 ..
-rw-r--r-- 1 root          root            99 Jul 13 09:49 switch01-config.txt
-rw-r--r-- 1 root          root            99 Jul 13 09:49 switch02-config.txt
-rw-r--r-- 1 root          root            99 Jul 13 09:49 switch03-config.txt
```

As you can see the `configs` directory and config files are owned by the `root` user. This happens because the app is running as `root` inside a container. To mitigate this we can do two things: mount host user database files inside a container and tell docker to run `entrypoint` as the current user.

The resulting command will look bulky though.

```bash
docker run --user $(id -u):$(id -g) -v /etc/passwd:/etc/passwd:ro -v /etc/shadow:/etc/shadow:ro -v /etc/group:/etc/group:ro -v $(pwd):/opt/nornir_example nornir_example
```

For the sake of convenience, you can use the `run-in-docker.sh` bash script which is included in the repo.

```bash
./run-in-docker.sh init
Creating directories...
Directory 'configs' already exists
Init complete
```

## Wrapping Up

In this tutorial, we built a simple Python command-line app and packaged it in a Docker image. Then we learned how we could use `ENTRYPOINT` to pass arguments to our app running inside a container. And finally, we touched upon the problem of working with files on a host machine.

I hope this tutorial will serve you as a good starting point for your future projects. Please, don't hesitate to leave a comment if you find any mistakes or have any suggestions.
