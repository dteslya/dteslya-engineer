---
title:  August 2020 Update
description: "Blog migration and future plans"
categories:
  - Blog
tags:
  - blog
date: 2020-08-11
authors:
  - dteslya
comments: true
---

# August 2020 Update

<figure markdown>
  ![feature](images/2020_aug_update.png)
</figure>

It's been a while since my last post and I want to shed some light on what I've been up to and what are my plans for the future of this site.
A lot of things happened in 2019 and 2020 in my professional life and the two most important ones were changing job and becoming a CCIE R&S this February (just before the lockdown).
Both of these activities were the main reason why I've been silent here for so long (not to mention living through the lockdown with a toddler).

<!-- more -->

## Blog migration

A few days ago I've come up with an idea of a new post and began to dust off my blog which was built with [Jekyll](https://jekyllrb.com/) and hosted on [Github Pages](https://pages.github.com/).
I had a really hard time updating the theme and all the dependencies and finally found out that GH Pages didn't support Jekyll 4.0 (yes, I know it can be done with [Github Actions](https://jekyllrb.com/docs/continuous-integration/github-actions/)).
That's when I decided to look for alternatives.

## Choosing static site generator
It was easy with a hosting solution as I've already wanted to try out [Netlify](https://www.netlify.com/) and this was a perfect opportunity.
Choosing the static site generator to replace Jekyll was not so straightforward. After some research, my two main options were [Hugo](https://gohugo.io/) and [Gatsby](https://www.gatsbyjs.org/).
At first, I thought it would be reasonable to go with Gatsby because it's based on [React](https://reactjs.org/) which I use in my projects, but after some digging, I found it overly complex for my fairly unsophisticated needs.
Hugo on the other side seemed really simple (single binary) and had a better (to my taste) theme gallery.
So after hours of choosing the right theme and more hours of tweaking it I ended up with what you can see now.
My theme of choice was [Axiom](https://www.axiomtheme.com/) and I really like how it renders code snippets.
I hope now it's more clear and readable than before, although [HydeJack](https://hydejack.com/) theme I used with Jekyll was also great.

## Problems
The only unsolved problem here is Disqus comments.
Because the URL path for posts has changed (*https://dteslya.engineer/automation/post1* became *https://dteslya.engineer/post1*) I need to perform a thread migration which can be done with [Disqus URL Mapper](https://help.disqus.com/en/articles/1717129-url-mapper).
Unfortunately, it doesn't work and now I'm waiting for the support team to help me.
I suspect that it doesn't recognize `.engineer` as a valid TLD.
I hope this will be resolved soon.

**⚡ UPDATE**
Disqus support turned out to be useless (they simply never responded), so I migrated my commenting system to [Staticman](https://staticman.net/). I spent a couple of days integrating it with my blog and importing existing comments from Disqus but it was totally worth it. Now all the comments are stored as `yaml` files in blog repo.

I used these guides to complete my migration:  
[Running Staticman on Hugo Blog With Nested Comments](https://yasoob.me/posts/running_staticman_on_static_hugo_blog_with_nested_comments/)  
[HUGO + STATICMAN: NESTED REPLIES AND E-MAIL NOTIFICATIONS](https://dancwilliams.com/hugo-staticman-nested-replies-and-email-notifications/)

The next step is to add Captcha and Email notifications to comments.

## Plans

My focus for the last half-year was learning Python by developing a web app for our team.
Its main purpose is to take putty session logs from network devices as an input and produce structured reports in xlsx format.
It's based heavily on [Cisco Genie Parsers](https://github.com/CiscoTestAutomation/genieparser) and uses [Flask](https://flask.palletsprojects.com/en/1.1.x/) as a backend and [React](https://reactjs.org/) + [Grommet](https://grommet.io) on the front.
Developing this app gave me a real boost in coding and I hope it will also give me new ideas for this blog.
As for the near future I hope to produce a new post very soon. It's about using [Cisco Support API](https://developer.cisco.com/site/support-apis/) which can be very handy if you run a Cisco shop.
I also have some ideas on making a guide for network engineers who want to dive into automation and programming and don't know where to start.