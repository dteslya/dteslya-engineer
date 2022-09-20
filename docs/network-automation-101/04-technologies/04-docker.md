# Docker and containers

Linux containers have been around for quite a long time (and [chroot and jail](https://en.wikipedia.org/wiki/Chroot) even longer) but Docker was what made it popular and accessible.

<figure markdown>
  [![xkcd - Containers](https://imgs.xkcd.com/comics/containers.png)](https://xkcd.com/1988/)
  <figcaption>Containers</figcaption>
</figure>

Containers allow to run software in an isolated environment, but contrary to VMs each container doesn't need a full-blown OS to run. This makes containers more resource-effective in terms of CPU, RAM, and storage not to mention that you don't need to maintain a separate OS for each container as with VMs.

Docker (Docker Engine, to be precise) is a software that creates, deletes, and runs containers. You can think of it as similar to ESXi. Docker's ease of use is what made containers so popular.

## Why use Docker?

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

## Basic Terminology

To familiarize yourself with Docker you need to know the basic terminology and tools.

!!! note ""
    Containerization topic is really huge and I don't want to go deep into technicalities here. If you want to learn more about Docker and containers I can recommend a book called [Docker Deep Dive](https://www.amazon.com/Docker-Deep-Dive-Nigel-Poulton-ebook-dp-B01LXWQUFF/dp/B01LXWQUFF/) by Nigel Poulton"

### Images

  To continue the VM analogy you can think of Docker images as VM templates. An image contains all the necessary files to run a container and can hold predefined parameters, such as which TCP ports to expose. When you start a container you can override these parameters and add your own. You can run multiple containers from a single image. It is crucial to understand that containers themselves are ephemeral or stateless. This means that when you make any changes to the container's filesystem when it's running it won't persist after you restart that container. If you need persistency you should use external storage solutions such as volumes.

### Layers

  Docker images are made of layers. Essentially, a layer is a bunch of files created after running a command in a Dockerfile. If to build another image you use the same commands in a Dockerfile Docker will just reuse the previously created layer. This speeds up image building and saves storage space.

### Tags

  When you are using different versions of the same image you need a way to distinguish between them. That's where tags come in handy. When creating an image or pulling one from a repository you should specify a tag (e.g. python:3.8.5-slim-buster where 3.8.5-slim-buster is a tag), if you don't the `latest` tag will be used. Please note that `latest` has no special meaning, it's just a tag which not necessarily denotes the latest version of the image.

### Volumes

  When starting a container you can specify directories or files to be mounted inside the container filesystem. Each such directory or file is called a volume. Volumes come in handy when you need the data to persist or to be shared among different containers. It's also an easy way to insert a custom config file into a container, or to use a container as a runtime environment for your script which is mounted inside a container so you can test it without the need to rebuild the container image.

### Dockerfiles

  [Dockerfile]((https://docs.docker.com/engine/reference/builder/)) is a text file with a set of instructions on how to build an image. It consists of the commands specifying such things as what another image should be used as a base image, what files to copy into the image, what packets to install, and so on.

### Docker Compose

  [Docker-compose](https://docs.docker.com/compose/) is a simple orchestrator for Docker containers. To start several containers without docker-compose you need to type a lot of long commands with a multitude of arguments. Docker-compose allows you to specify all those arguments in a simple and clean manner of the YAML file. It also allows you to specify dependencies between containers, i.e. in what order they should start. But even if you need to run only one container it's better to write a `docker-compose.yml` just to place all those arguments on record.

## Docker use cases for network automation

When talking about network automation Docker can come in handy in two major ways:

* You can build your own automation tools to run in Docker making them portable and automating the packaging process as a result.
* Most modern tools have dockerized versions that you can run by entering just one command. This one is really useful when you want to follow a tutorial or to try out a new tool but doesn't want to waste time on setup (which can be quite nontrivial)

Here is a simple workflow to build and run your own Docker container:

* Write a `Dockerfile`
* Write a `docker-compose.yml` file
* Run `docker-compose up`

There are tons of articles on how to write Dockerfiles and use docker-compose. But I guess at first you will use prebuilt images just to get familiar with Docker and you will need to know some basic CLI commands to start, stop. and monitor Docker containers. [Here](https://pagertree.com/2020/01/06/docker-cheat-sheet/) is a good write up on the essential Docker commands you will find useful from the start.