---
title: September 2022 Update
description: "New site engine and comment system."
categories:
  - Blog
date: 2022-09-21
authors:
  - dteslya
comments: true
---

# September 2022 Update

Yesterday I migrated my blog from [Hugo](https://gohugo.io/) to [MkDocs](https://www.mkdocs.org/) static site generator, supercharged with [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme. I've been a fan of the project for some time now and was super excited when the [blog plugin](https://squidfunk.github.io/mkdocs-material/blog/2022/09/12/blog-support-just-landed/) was announced and finally released.

<!-- more -->

Aside from look and feel, this also brought some other significant changes to this blog:

* I decided to drop [Staticman](https://staticman.net/) comment system in favor of [Giscus](https://giscus.app/). Unfortunately, all the old comments had to go, also. I didn't find a quick and reliable way to transfer them to Giscus.
* [Network Automation 101](../../network-automation-101/index.md) is now a full-fledged stand-alone document divided into sections for easier reading and editing. And this brings us to the next change.
* The source code of the whole site is now hosted on the public GitHub repository meaning you can submit PRs if you want to update or add something.

There are still a few things here and there that need polishing, but overall I'm thrilled with the result.
