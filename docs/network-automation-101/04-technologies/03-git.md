# Git

This section covers basic Git usage and terminology. But first, I'd like to highlight several reasons why you should care about Git and version control in the first place.

<figure markdown>
  [![xkcd - Git](https://imgs.xkcd.com/comics/git.png)](https://xkcd.com/1597/)
  <figcaption>Git</figcaption>
</figure>

## Why use Git?

* **Visibility & control**  
  By placing your scripts, configuration templates, or even device configurations in Git you can start tracking all the changes and rollback to previous versions if needed.
* **Experimenting**  
  When working on a new feature it's very convenient to create a new branch in the same Git repository rather than copy the whole working directory to a new place.
* **Teamwork**  
  Sooner or later you'll need to share your work with your teammates. Git is the best tool to collaborate without the need to send each other file copies.
* **CI/CD**  
  CI/CD processes are based around source control. Events such as commits or branch merging trigger CI/CD pipelines.

## Terminology

### Repository

Git repository is a project's directory containing all the project files plus a hidden directory named `.git` where all the Git metadata (change history, configuration, etc.) resides. In the example below `example-repo` is a Git repository.

```bash
example-repo
├── .git
│   ├── ...
├── file1
└── file2
...
```

Git repository consists of three "trees". The first one is your `Working Directory` or `Working Tree` where all the files you work with stay. The second one is the `Index` where you put files to be committed by issuing a `git add` command and finally the `HEAD` which points to the last commit you've made. `Index` and `HEAD` are stored in a `.git` subdirectory and you never interact with them directly.

Git repository can be local or remote. All the changes you make to the working directory are stored in a local repository. The synchronization between local and remote repositories is always done manually.

### Working directory

Think of a Git working directory as a sandbox where you make changes to your project's files. Here is a good explanation from the [official documentation](https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified#_git_reset):
>Finally, you have your working directory (also commonly referred to as the “working tree”). The other two trees store their content in an efficient but inconvenient manner, inside the .git folder. The working directory unpacks them into actual files, which makes it much easier for you to edit them. Think of the working directory as a sandbox, where you can try changes out before committing them to your staging area (index) and then to history.

### Staging

When you want to put your changes to Git history, i.e. make a commit, you choose which files you want to commit and issue a `git add` on them. This way you can put changes in different files to different commits thus grouping them by their function or meaning. Staging also enables you to review your changes before committing.

### Commit

Commit saves staged changes to the local Git repository. It also includes metadata such as the author, the date of the commit, and a [commit message](https://chris.beams.io/posts/git-commit/).

### Branch

When you feel like adding a new feature or want to [refactor](https://en.wikipedia.org/wiki/Code_refactoring) the existing code it's a good idea to create a new branch, do your work there, and then merge it back to the main branch. This gives you confidence that you wouldn't break the existing code. It also allows different developers to work on the same codebase without blocking each other.

Git [branching](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell) is extremely lightweight and allows to create new branches and switch between them almost instantaneously.

### Pull (merge) request

[Pull](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/about-pull-requests) (GitHub) or [merge](https://docs.gitlab.com/ee/user/project/merge_requests/) (GitLab) request is a feature specific to web-based Git-repository managers that provides a simple way to submit your work to the project. There is a lot of confusion about why it's called a pull request and not a push request as you want to add your changes to the repo. The reasoning behind this naming is simple. When you create a pull request you actually request the project's maintainer to pull your submitted changes to the repository.

## Basic usage

### Command line

To start using Git in the command line I recommend taking a look at [this](https://rogerdudler.github.io/git-guide/) simple but useful guide for the beginners by Roger Dudler.

### Dealing with mistakes

Eventually, you will screw something up (e.g. make a commit to the wrong branch). For such situations, there is a good [resource](https://ohshitgit.com/) that can help with common Git headaches.

### .gitignore

To make Git [ignore](https://git-scm.com/docs/gitignore) specific files or even subdirectories you can list them in a special file called `.gitignore`. This is extremely useful when you want to keep your remote repository clean of temporary files or files containing sensitive information (e.g. passwords).
