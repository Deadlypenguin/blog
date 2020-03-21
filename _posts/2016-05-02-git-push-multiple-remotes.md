---
post_id: 902
title: Git push to multiple remotes
date: 2016-05-02T09:34:54+00:00
author: pcon
layout: post
permalink: /2016/05/02/git-push-multiple-remotes/
thumbnail: /assets/img/2016/05/02/post_thumbnail.png
redirect_from:
- /blog/2016/05/02/git-push-multiple-remotes/
dsq_thread_id:
- "4793881791"
categories:
- development
tags:
- git
- github
- heroku
- openshift
---
With today's PaSS offerings, you may find yourself in a position like I was.  Let's take the scenario of hosting an application on [Openshift](http://openshift.redhat.com), but also wanting to store that code on [Github](https://github.com/).  Historically, anytime you wanted to do a git push to both Openshift and Github, you'd have to submit two push commands.  Now, you could write your own git alias to do that for you, but I recently discovered a better way to do this.  (This also works if you are using [Heroku](http://heroku.com/))

<!--more-->

# Example Layout

Let's take the following layout as what our PaSS and git structure looks like

```
$ git remote -v
github https://github.com/OWNER/REPOSITORY.git (fetch)
github https://github.com/OWNER/REPOSITORY.git (push)
origin ssh://abc123@APP-OWNER.rhcloud.com/~/git/APP.git/ (fetch)
origin ssh://abc123@APP-OWNER.rhcloud.com/~/git/APP.git/ (push)
```

# Current git workflow

1. Make change in git
2. git push to openshift (origin remote)
3. git push to github (github remote)
4. Repeat

Where this workflow breaks down is if you forget to push to github and then try to update openshift on a second host that has pulled from github but not from openshift.  While it may seem as simple as "don't forget to do it," I've found that I'm pretty forgetful.  And in the case of this, you have two systems of record.

# Ideal git workflow

1. Make change in git
2. git push (to openshift and github)
3. Repeat

The ideal workflow would be to just run a single git push command and have the code land in both github and openshift.  Well, we can!

## Adding additional remotes to git push

The first step we will want to do is to clean up our remotes.  You goal is to have just the origin remote and have that point to Github.  If you're not familiar with removing remotes, read over [this article](https://help.github.com/articles/removing-a-remote/).  So what we want to see is

```
$ git remote -v
origin  https://github.com/OWNER/REPOSITORY.git (fetch)
origin  https://github.com/OWNER/REPOSITORY.git (push)
```

Next we want to add the Openshift repository as a push url for our remote.  As stated in [this Stack Overflow article](http://stackoverflow.com/questions/14290113/git-pushing-code-to-two-remotes), we need to set both urls.

```
$ git remote set-url --add --push origin https://github.com/OWNER/REPOSITORY.git
$ git remote set-url --add --push origin ssh://abc123@APP-OWNER.rhcloud.com/~/git/APP.git/
```

Now if we inspect our remotes, we can see that we now have two push targets

```
$ git remote -v
origin https://github.com/OWNER/REPOSITORY.git (fetch)
origin https://github.com/OWNER/REPOSITORY.git (push)
origin ssh://abc123@APP-OWNER.rhcloud.com/~/git/APP.git/ (push)
```

Now anytime we do a git push, the code will be deployed to both Github and Openshift.

### Notes

* When setting this up for the first time, make sure that both the Github and the Openshift repositories share the same base.  ie, spin up the Openshift app then create the Github repo from it, or create the Github repo and spin up the Openshift app based on it.