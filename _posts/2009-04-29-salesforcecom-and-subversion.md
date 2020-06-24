---
post_id: 72
title: Salesforce.com and Subversion
date: 2009-04-29T15:31:10+00:00
author: pcon
layout: post
permalink: /2009/04/29/salesforcecom-and-subversion/
redirect_from:
- /blog/2009/04/29/salesforcecom-and-subversion/
dsq_thread_id:
- "1800183018"
categories:
- salesforce
tags:
- subversion
---
<div class="notification is-warning is-light">Our team has since switch to git.  For more information read my <a href="/2014/07/21/using-git-with-salesforce-and-distributed-teams/">article</a> on our git workflow</div>

From what I've been able to tell, there is no real version control built into Salesforce.com and this is a problem when pushing from a sandbox instance into a production instance.  To fix this problem (at least until Salesforce does something), I think the best option is to use the Force.com plugin and the Subclipse plugin for Eclipse.  With both of these in place, it should make version control a reality.

<!--more-->

1. Install [Eclipse](http://www.eclipse.org/) for your platform (it's eclipse-platform if you are using Fedora)
2. Install both the [Force.com](http://wiki.developerforce.com/index.php/Force.com_IDE_Installation_for_Eclipse_3.3.x) and [Subclipse](http://subclipse.tigris.org/) plugin \(eclipse-subclipse\)
3. Add your Force.com project to Eclipse \([Howto](http://wiki.developerforce.com/index.php/An_Introduction_to_Force_IDE)\)
4. Add your SVN repo to Eclipse.  \([Howto](http://agile.csc.ncsu.edu/SEMaterials/tutorials/subclipse/index.html#section3_0)\)
5. Share your Force.com project (Right-click on Project name &rarr; Team &rarr; Share Project &rarr; SVN &rarr; Choose repo)
6. Then after updating a file in the Force.com project, commit the update to SVN before deploying to the server

Now if you want to use this in another Eclipse instance then, you'll want to do the first two steps to prepare your Eclipse environment.  Then:

1. Add the existing SVN repo to Eclipse \([Howto](http://agile.csc.ncsu.edu/SEMaterials/tutorials/subclipse/index.html#section5_0)\)
2. Right click on the Project Force.com &rarr; Project Properties   and update the username / password

When using this in a collaborative setting, the following workflow should be followed whenever possible.

1. Team &rarr; Update
2. Make changes to code
3. Team &rarr; Update
4. Make changes to resolve collisions if needed
5. Team &rarr; Commit
6. Force.com &rarr; Deploy to Server