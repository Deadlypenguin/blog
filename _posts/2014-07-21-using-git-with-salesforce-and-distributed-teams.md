---
post_id: 365
title: Using Git with Salesforce and distributed teams
date: 2014-07-21T10:00:08+00:00
author: pcon
layout: post
permalink: /2014/07/21/using-git-with-salesforce-and-distributed-teams/
redirect_from:
- /blog/2014/07/21/using-git-with-salesforce-and-distributed-teams/
dsq_thread_id:
- "3310387879"
categories:
- development
- salesforce
tags:
- solenopsis
---
# Introduction

I've been asked several times (and have [presented](http://pcon.github.io/presentations/ci/ "CI & CD for Force.com") a couple of times) on how our team handles doing Continuous Integration (CI) and Continuous Deployment (CD) with a distributed team. However one of the points that I'm always asked is specifically how we use Software Configuration Management (SCM) with this processes.  For this blog post I'm going to do a deep dive into our process.

_NOTE: This process is by no means the end-all-be-all process for everyone.  This is just what we have come up with (generalized for public consumption) over several years of developing on the Force.com platform_

<!--more-->

# Prerequisites

## Git

Get yourself a git repository. This can be a [self-hosted](http://git-scm.com/book/en/Git-on-the-Server-Setting-Up-the-Server "How to set up a git server") git repository or it can be one of any number of cloud-based hosting [<sup>1</sup>](https://github.com/ "Github") [<sup>2</sup>](https://bitbucket.org/ "Bitbucket") [<sup>3</sup>](https://about.gitlab.com/ "Gitlab").  You'll need this because this is where ALL of your code an configuration should live. For the most part, if it doesn't exist in git, it doesn't exist. In other words, don't expect something that is not in git to stick around for a while.

Now git is not the only SCM out there (I don't want to start an internet argument over if it's the best/worst/etc) but it's what we are using and it's what all my examples will be in. If you are comfortable with another SCM the process should be fairly easy to adapt.

## Development sandboxes

You should have a communal development sandbox that all of your testing and verification of new features occurs.  This should be a full sandbox with all the data from your production org.  If you can't get a full sandbox, this should at least contain a sampling of production like data.

Every one of your developers should have their own developer sandboxes. These should just be "developer" and I would recommend you have some test data that you put in there.

## A way for developers to pull updates from the sandbox

There are lots of different ways to do this, but the biggest thing is the data that comes back needs to be consistent. We use [Solenopsis](http://solenopsis.org/Solenopsis/), but you can use [Mavensmate](http://mavensmate.com/) the [Force.com IDE](https://github.com/forcedotcom/idecore "force.com ide") or even roll your own [Ant tool](http://www.salesforce.com/us/developer/docs/apexcode/Content/apex_deploying_ant.htm).  Not every developer has to use the same tool, but it's important that you are able to do a destructive change push that overwrites both objects and code.

## Automated build process

While this is not **_required_** it is highly suggested. Not only will this ensure that your development environment is always updated, and will save some poor sap from having to do this manually. We use a combination of [Jenkins](http://jenkins-ci.org/) and [Solenopsis](http://solenopsis.org/Solenopsis/) to do all of our pushes from CI development instance all the way to our release to production.  Once you get it into your development sandbox, however you want to get it to production is up to you.

# Workflow

This is where the day to day workflow is done.  The following shows the life-cycle of a feature being developed on the platform.  For the examples I will be including the [Solenopsis](http://solenopsis.org/Solenopsis/) commands. Where this command is, feel free to replace with whatever the equivalent is with your build application.

## Push to sandbox

Every feature should start with a clean slate. You should pull from git to make sure you have the most recent feature set and then push all the changes to your developer sandbox

```bash
git pull
solenopsis destructive-push
```

## Create a feature branch

In order to make sure that all work is cordoned off and multiple commits can be made without dirtying up the master git log

```bash
git checkout -b myfeaturebranch
```

## Do config work

While this can be done at any point in the feature development, I prefer to do this first.  This way when you pull down your configuration work you do not have to worry about other things accidentally being overwritten.

After the configuration work is done, pull the changes down to your local machine and commit them. I like to commit them after pulling them down because that way I have a cleaner repo listing for when I use Solenopsis' _git-push_ command.

```bash
solenopsis pull-full-to-master
git add objects/MyObject__c.object
git add objectTranslations/MyObject__c-en_US.objectTranslation
git checkout .
git commit -a -m "My configuration changes"
```

_NOTE: While not necessary, I prefer to use git add to add the individual files I changed and then use git checkout to remove the others.  The keeps me from accidentally making unwanted changes._

## Do development work

If you're a developer, this is where you will spend most of your time (surprise!).  After you have your code where you like it and all your tests are written (you did write tests didn't you?) then commit that code to git.  The steps below can be done as many times as you see fit. I often will do a commit and change things and then checkout my old commit if I don't like where the new code is going.

```bash
git add classes/MyNewClass.cls
git commit -a -m "My coding work"
```

NOTE: Any new files that you create will have to be specifically added with a git add, files that are already in git but just modified will be added with the -a flag for the git commit.

## Rebase

If there is a tricky bit in this whole process, rebasing your code is it.  Depending on the size of your team, the length of your feature or the timing with the rest of your team, odds are pretty good that someone else will have finished their feature and pushed it to git before you've finished yours.  Now before you are ready to push your code out, you need to rebase with master.

Rebasing will take the commits you have done during the feature development and re-play them over the top of the code that exists in git.  Most of the time this will go great (assuming you are working on new code or parts of the code that nobody else is working on), however, sometimes you'll get the dreaded merge-conflict.  I have found that the best way to handle merge conflicts is to prevent them whenever possible.  Here are some of my tips on how to prevent merge conflicts with apex code

* Whenever possible, coordinate with other team members about which classes you will be modifying.  If you can, try to stay away from the same code someone else is working on
* Add new methods to the bottom of your class file.  This won't necessarily mean you won't get a conflict, but it will make cleaning the conflict much easier
* Have a good understanding of what the code you are modifying does. If you don't understand how the code you are modifying works then it makes doing merges much harder to tease apart.

```bash
git checkout master
git pull
git checkout myfeaturebranch
git rebase master
```

The git prompts are pretty straight-forward when it comes to dealing with conflicts, and there is some pretty good [reading](http://git-scm.com/book/en/Git-Branching-Basic-Branching-and-Merging#Basic-Merge-Conflicts) on how to fix it.  What I do is look for the "&gt;&gt;&gt;" string in the code that the conflict occurs and then combine the code myself.  Most of the time it's as simple as just removing the markers and occasionally adding a new closing brace.  Sometimes it's much more time consuming.

> Rebase early and rebase often

If you can take away one lesson from this, it's "rebase early and rebase often."  There is zero harm in rebasing every time someone else pushes a commit to master.  To be honest, it will probably make your life much easier.  The more work you have done and the more that has been committed to master, the more you'll have to deal with on a rebase.

## Push the rebase

This step is only required if there was something to rebase.  If you got lucky and there have been no changes to master since you first branched, you can go ahead and skip to the next step.  Otherwise, go ahead and do a full push to your sandbox and then re-run all your tests, making sure that you didn't break someone else' tests and they didn't break yours.

## Commit to master

This is the moment you've been waiting for.  You've got your feature complete, you've rebased and all your tests pass.  Let's merge! Now before you get all silly and just do a plain merge, ask yourself some questions:

* "Self, have I made all of my commit messages cleanly and not something like &#8216;adding code'"
* "Self, do I only have one commit?"
* "Self, do I like a sloppy commit log?"
* "Self, do I want to cherry-pick out 20 commits to roll this feature back if I broke something?"

<span style="font-size: medium;">If you answered "no" to any of these questions then guess what! squashing the commit is for you!  Squash committing takes all of your commits and condenses them down into a single commit.  Not only does this look better in the git log, but it also makes it much easier to tease apart if something goes sideways and you have to roll back a commit, or if you have to cherry-pick a commit to go to production before the entirety master is ready to go.</span>

```bash
git checkout master
git merge --squash myfeaturebranch
git commit -m "UID - The awesome new feature"
git push
```

Take this opportunity to add any sort of tracking information for your feature.  We put the UID of the story in front of the commit message so we can track it to a unit of work

## Cleanup

After you're done with the merge it's time to clean up that local branch.  No point in keeping it around anymore.  If you need to do more work on it, you should re-branch off of master and start the whole process over again.

```bash
git branch -D myfeaturebranch
```

_NOTE: You will have to use the -D flag because we did a --squash merge.  Because of this the history tracking of all your intermediary commits are lost and thus the branch appears to be un-merged._

## Automated push

At this point whatever automated system you set up should be monitoring your git repo, see there is a new commit, and do the push.

I would recommend that you also set your automated system to run the tests associated with your organization.  Because our tests can take in excess of 2 hours to run, we disable this run on ever push to the development sandbox.  However, we do have jobs that run twice daily that just run the tests in our development sandbox and notify us if there are failures.

# Caveats

## Things not stored in git

Unfortunately, not everything can be stored in git.  The things that cannot should be tracked and done manually in your development sandbox.  We make it the responsibility of one person and have it tracked in a document that follows along with the full release process

## Config in git

One of the biggest hurdle for any team switching to using git is to also have their configuration in git.  If the configuration changes are not in git then you have the problem of either clobbering configuration changes in your development sandbox, or having all of your users having to make the same configuration changes in their personal sandboxes.  While it will take a bit of work to get any admins that are not very savvy with git up to speed, I've found it doesn't take long and you'll find that your admins will get the hang of it quickly.  Also, since most configuration changes happen in the XML files there are rarely any merge conflicts that occur.

## Somethings cannot be removed with ANT

Unfortunately there are just some things that cannot be removed without manual intervention such as picklist values or tags.  These will have to be done manually to every sandbox as well as to a production org.  To help with this, we keep a document for each release that denotes the manual changes that must occur after the release is done.