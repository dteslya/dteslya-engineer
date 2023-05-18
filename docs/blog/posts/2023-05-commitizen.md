---
title: Automating Python project releases with commitizen
description: "How to write meaningful commit messages, generate changelog and bump versions automatically."
categories:
- Tutorial
tags:
- git
- versioning
- semver
links:
  - blog/posts/network-automation-python-project-template.md
date: 2023-05-18
authors:
  - dteslya
draft: false
comments: true
---

# Automating Python project releases with commitizen

<figure markdown>
  [![feature](images/2023-05-commitizen.jpg)](https://unsplash.com/@brett_jordan)
  <figcaption>Cover photo by Brett Jordan on Unsplash</figcaption>
</figure>

In my [previous post](network-automation-python-project-template.md), I mentioned various tools meant to help implement code management best practices, but I didn't go into much detail about any of them. This time I'd like to focus on [Commitizen](https://commitizen-tools.github.io/) which introduced me to the concept of conventional commit messages and automatic versioning.

<!-- more -->

This post is meant to help you address the following concerns:

* Keeping a consistent [changelog](https://keepachangelog.com/en/1.0.0/) of your Python project.
* Versioning your project.
* Writing consistent meaningful commit messages.
* Automating all of the above.

This post is divided into two parts: theoretical and practical. First, I'll go through the concepts behind Semantic Versioning and Conventional Commits. Then I'll show you how those concepts can be integrated into your project with the help of Commitizen.

Let's get started!

## Semantic Versioning

[Semantic versioning](https://semver.org/), often abbreviated as SemVer, might be the most popular approach to versioning Python packages. It is quite simple and gives a clear idea about the underlying changes with each new version release.

In essence, Semantic Versioning uses a three-part version number like this:

`MAJOR.MINOR.PATCH`

Each of these components is incremented based on the type of changes that occur in the software:

1. `MAJOR` (0.2.0 -> 1.0.0): This is incremented when there is a change that is not backward-compatible. Major version zero is a special case. During the early stage of development, you could be making backward-incompatible changes every day, but you shouldn't increment the major version until your API is stable. That's why version 1.0.0 is usually used for the first stable release. After that incrementing the major version number means introducing breaking changes. For example, that could be removing or modifying the behavior of an existing feature. In other words, code that depends on your package would no longer work if you upgrade your package to a new major version.
2. `MINOR` (0.1.1 -> 0.2.0): This is incremented when new functionality is added in a backward-compatible manner. That means new features or significant improvements have been added, but they won't disrupt the existing functionality of the software. Users can expect new features, but their current workflow won't be disrupted.
3. `PATCH` (0.1.0 -> 0.1.1): This is incremented when backward-compatible bug fixes are made. These are changes that fix something that wasn't working as intended in the previous version, without adding any new features or changing the software's overall behavior.

For instance, if a software version is 2.3.1, the next version could be 2.3.2 if a bug was fixed, 2.4.0 if a new feature was added, or 3.0.0 if there were breaking changes.

!!! tip
    Usually, most of the changes happen within the PATCH and MINOR version increments. Having 2-digit PATCH or MINOR versions is fine.

An important aspect of Semantic Versioning is that it provides a contract for dependency management. Tools like [Poetry](https://python-poetry.org/) can rely on that to [restrict](https://python-poetry.org/docs/dependency-specification/) which updates can be automatically installed. This way, unexpected breaking changes can be avoided.

## Conventional Commits

From the official site:

>The Conventional Commits specification is a lightweight convention on top of commit messages. It provides an easy set of rules for creating an explicit commit history; which makes it easier to write automated tools on top of. This convention dovetails with SemVer, by describing the features, fixes, and breaking changes made in commit messages.

A conventional commit message follows this simple format:

```plaintext
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Each part of the commit message serves a specific purpose:

1. **Type**: This denotes the type of changes being made in the commit. There are two main types: `feat` (for a new feature, corresponds to `MINOR` in [SemVer](#semantic-versioning)) and `fix` (for a bug fix, corresponds to `PATCH`). Other types such as `docs` (for documentation changes), `style` (for code style changes, e.g., formatting, missing semicolons), `refactor` (for refactoring existing code), etc. are also allowed. Any type/scope appended with `!` is considered a `BREAKING CHANGE` and corresponds to a `MAJOR` version change.
2. **Scope**: This is optional and specifies the part of the codebase affected by the change, such as a module, function, or component.
3. **Description**: This is a brief, concise description of the change, written in the imperative, present tense.
4. **Body**: Also optional, the body provides a more detailed description of the change. It's separated from the subject by a blank line.
5. **Footer**: A footer prefixed with `BREAKING CHANGE:` corresponds to a `MAJOR` version change. It must follow the [git trailer convention](https://git-scm.com/docs/git-interpret-trailers) and can also be used, for example, for issue reference.

!!! info
    See the [full specification](https://www.conventionalcommits.org/en/v1.0.0/#specification) for more details.

You can find [examples](https://www.conventionalcommits.org/en/v1.0.0/#examples) of conventional commit messages on the official site.

Following the Conventional Commits specification when writing commit messages enables tools like Commitizen to automate version bumping and changelog generation.

## Commitizen

Now when we're done with the theory let's put it into practice. As an example, I'll be using the project that was generated from the [template](https://github.com/dteslya/network-automation-template) described in the [previous post](network-automation-python-project-template.md).

I will skip the steps of creating a project here. Let's assume the following prerequisites are met:

* Project directory is created
* It's initialized as a git repository
* All dependencies are installed, including the commitizen tool
* Remote repository is not configured yet

First, let's check the current version that we have after initializing the project.

```
cz version -p
0.0.1
```

Now, let's assume that we've made some changes and are ready to make an initial commit.

<div id="01_commitizen_initial_commit" style="z-index: 1; position: relative; max-width: 100%;"></div>
<script>
  window.onload = function(){
    AsciinemaPlayer.create('/asciinema/commitizen/01_commitizen_initial_commit.cast', document.getElementById('01_commitizen_initial_commit'), data={poster: 'npt:0:5'});
    AsciinemaPlayer.create('/asciinema/commitizen/02_commitizen_first_bump.cast', document.getElementById('02_commitizen_first_bump'), data={poster: 'npt:0:5'});
    AsciinemaPlayer.create('/asciinema/commitizen/03_commitizen_breaking_change.cast', document.getElementById('03_commitizen_breaking_change'), data={poster: 'npt:0:35'});
}
</script>

Let's bump the version and see what happens.

<div id="02_commitizen_first_bump" style="z-index: 1; position: relative; max-width: 100%;"></div>

As you can see, commitizen detected the `MINOR` version change and updated the `pyproject.toml` with the new version `0.1.0`. It also created a changelog file. After that it committed those changes and created a `0.1.0` tag.

What if we introduce a breaking change?

<div id="03_commitizen_breaking_change" style="z-index: 1; position: relative; max-width: 100%;"></div>

Apparently, a breaking change should have incremented the `MAJOR` version, but it didn't happen. The `MINOR` version was incremented instead. This is because the [`major-version-zero`](https://commitizen-tools.github.io/commitizen/bump/#major_version_zero) option was set to `true` in the commitizen configuration. This option is very handy during the initial rapid development stage, where a lot of breaking changes might be introduced. When you feel ready to release the first stable version, you can set this option to `false`. After that, `cz bump` will increment the `MAJOR` version as it should.

To follow the conventional commits specification, it's important to use [`cz commit`](https://commitizen-tools.github.io/commitizen/commit/) instead of `git commit` after incorporating commitizen into your workflow. It may take some time to adjust to the new process, but it ensures consistency.

After you introduce commitizen into your workflow, you need to make new commits with [`cz commit`](https://commitizen-tools.github.io/commitizen/commit/) instead of `git commit`. This might need some getting used to at first, but it guarantees that you're adhering to the conventional commits specification.

To guarantee that no unconventional commits are added to your repository, you can use the `pre-commit` message hook that will utilize [`cz check`](https://commitizen-tools.github.io/commitizen/check/) to lint your commit messages. This hook is already included in my [project template](https://github.com/dteslya/network-automation-template).

## GitLab CI

To go even further with versioning automation, we can make it in a Gitlab pipeline.

Each time there is a push or merge to the main branch a pipeline job will run `cz bump` and push the changes and the new tag back to the repository.

Below is the example of such job taken from the [`.gitlab-ci.yml`](https://github.com/dteslya/network-automation-template/blob/main/project/.gitlab-ci.yml.jinja) of my project template.

```yaml
version-bump:
  stage: version-bump
  image: python:3.11
  tags:
    - docker
  rules: # (1)!
    - if: '$CI_COMMIT_BRANCH == "main" && $GITLAB_USER_LOGIN != $CI_USERNAME && ($CI_PIPELINE_SOURCE == "push" || $CI_PIPELINE_SOURCE == "merge_request_event")' 
  before_script:
    - pip3 install -U commitizen
  script:
    - git config user.email $CI_EMAIL && git config user.name $CI_USERNAME
    - git config http.sslVerify false # (2)!
    - git remote rm origin && git remote add origin https://oauth2:$PROJECT_ACCESS_TOKEN@gitlab.example.com/$CI_PROJECT_NAMESPACE/$CI_PROJECT_NAME.git
    - git checkout -B "$CI_COMMIT_REF_NAME" "$CI_COMMIT_SHA"
    - cz bump --yes # execute auto bump and push to main
    - git push --follow-tags origin $CI_COMMIT_BRANCH:$CI_COMMIT_BRANCH # (3)!
    - cz version -p > version # get the new software version and save into artifacts
  artifacts:
    paths:
      - version # (4)!
```

1. `$GITLAB_USER_LOGIN != $CI_USERNAME` ensures that this job won't produce an infinite loop by triggering itself when pushing back to the main branch.
2. Connecting to the internal self-hosted GitLab instance from a docker container will most probably cause an SSL error.
3. For `--follow-tags` option to work and actually push a new tag to the repo you need to configure commitizen to use [annotated tags](https://commitizen-tools.github.io/commitizen/config/#annotated_tag) (already done in the template).
4. You can use this artifact to get the new version number in the subsequent CI jobs (for example, to tag a Docker image).

It's based upon the example from the [Gitlab tutorial](https://commitizen-tools.github.io/commitizen/tutorials/gitlab_ci/) present in the commitizen documentation. This is my attempt to make it more clean and simple.

To get it working, you need to make some preparations in your Gitlab project settings.

First, you need to [create a project access token](https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html#create-a-project-access-token) and grant it read-write access to the repository. It's role must also have a permission to push to the main branch (`Maintainer` by default).

Go to the `Settings -> Access Tokens` to do that.

<figure markdown>
  ![Gitlab access token](images/2023-05-commitizen-01.png)
  <figcaption>GitLab project access token</figcaption>
</figure>

Second, you need to set the following environment variables in `Settings -> CI/CD -> Variables`.

<figure markdown>
  ![Gitlab access token](images/2023-05-commitizen-02.png)
  <figcaption>GitLab environment variables</figcaption>
</figure>

Use the name and value of the token created in the previous step for `CI_USERNAME` and `PROJECT_ACCESS_TOKEN`, respectively. 

`CI_EMAIL` can be anything, for example, `$CI_USERNAME@example.com`.

Now you can try and push some changes to the main branch. This should produce something like this in the CI job log:

```plaintext
<skipped>
Successfully installed MarkupSafe-2.1.2 argcomplete-3.0.8 charset-normalizer-3.1.0 colorama-0.4.6 commitizen-3.2.2 decli-0.6.0 importlib_metadata-6.6.0 jinja2-3.1.2 packaging-23.1 prompt_toolkit-3.0.38 pyyaml-6.0 questionary-1.10.0 termcolor-2.3.0 tomlkit-0.11.8 wcwidth-0.2.6 zipp-3.15.0
WARNING: Running pip as the 'root' user can result in broken permissions and conflicting behaviour with the system package manager. It is recommended to use a virtual environment instead: https://pip.pypa.io/warnings/venv
[notice] A new release of pip available: 22.3.1 -> 23.1.2
[notice] To update, run: pip install --upgrade pip
$ git config user.email $CI_EMAIL && git config user.name $CI_USERNAME
$ git config http.sslVerify false
$ git remote rm origin && git remote add origin https://oauth2:$PROJECT_ACCESS_TOKEN@gitlab.example.com/dmitry.teslya/example-project.git
$ git checkout -B "$CI_COMMIT_REF_NAME" "$CI_COMMIT_SHA"
Switched to and reset branch 'main'
$ cz bump --yes
bump(release): 0.0.1 → 0.1.0
tag to create: 0.1.0
increment detected: MINOR
[main a068c06] bump(release): 0.0.1 → 0.1.0
 2 files changed, 12 insertions(+), 2 deletions(-)
 create mode 100644 CHANGELOG.md
Done!
$ git push --follow-tags origin $CI_COMMIT_BRANCH:$CI_COMMIT_BRANCH
To https://gitlab.example.com/dmitry.teslya/example-project.git
   bf65ac3..a068c06  main -> main
 * [new tag]         0.1.0 -> 0.1.0
$ cz version -p > version
Uploading artifacts for successful job
Uploading artifacts...
version: found 1 matching files and directories    
Uploading artifacts as "archive" to coordinator... 201 Created  id=19340 responseStatus=201 Created token=64_DntRy
Cleaning up project directory and file based variables
Job succeeded
```

## Conclusion

We've taken a good look at conventional commits, semantic versioning, and the commitizen tool in this blog post, and I hope you've seen how they can really tidy things up in your coding projects.

Suppose conventional commits are the house rules for your codebase, helping everyone play nice together and keeping things tidy and easy to understand. And semantic versioning, on the other hand, is like the milestones on your project roadmap. It helps everyone know what to expect with each new update, taking the guesswork out of the question. In that case, commitizen is a faithful robot helper, always ready to ensure your commit messages follow the house rules and help steer the project along those roadmap milestones.

Embedding these into your workflow can make life easier for you and anyone else who might work on the project. It helps avoid confusion, prevents those "what just happened" moments when something changes, and it can save you a lot of headaches tracking down when a particular change was made.

## Further reading

1. [GIT - Semantic versioning and conventional commits](https://blog.opensight.ch/git-semantic-versioning-und-conventional-commits/) by Roman Hüsler
2. [Continuous Integration with Gitlab](https://marcosschroh.github.io/posts/autobumping-with-gitlab/) by Marcos Schroh
3. [Automatic Software Version Bump Using GitLab CI/CD](https://makeitnew.io/automatic-software-version-bump-using-gitlab-ci-cd-f5854a8d510c) by Emir Husic
4. [Automatic Semantic Versioning in GitLab CI](https://threedots.tech/post/automatic-semantic-versioning-in-gitlab-ci/) by Miłosz Smółka