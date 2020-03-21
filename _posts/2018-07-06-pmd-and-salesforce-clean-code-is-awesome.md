---
post_id: 1259
title: 'PMD and Salesforce: Clean Code is Awesome'
date: 2018-07-06T15:00:11+00:00
author: pcon
layout: post
permalink: /2018/07/06/pmd-and-salesforce-clean-code-is-awesome/
redirect_from:
- /blog/2018/07/06/pmd-and-salesforce-clean-code-is-awesome/
dsq_thread_id:
- "6777289162"
categories:
- development
- salesforce
tags:
- salesforce
---
If you're not aware, having clean code is more than just about readability.  It's about sustainability, re-usability and knowing that your code is doing what you want it to do.  This is where [PMD](https://pmd.github.io/) comes into the picture.  PMD is a static code analysis tool that takes code from many different languages, analyzes it and provides you with feedback.  Fortunately for the Salesforce world PMD now supports Apex as one of it's languages.  So, let's dive into how to set it up, run it and then how to use some of the rules included.

<!--more-->

# PMD Setup

Setup of PMD is pretty simple.  Follow the quickstart guide on the homepage of the project for your distribution.  For our team's usage of PMD, I downloaded the zip file and copied the `bin` and `lib` directories into a `pmd` folder inside our git repo.  This way everyone will always be running the same version and we can update it easily.  This will also come into play if you want to run it via your CI process (hint: you do).

# Configuring PMD

Configuring is where you are going to spend most of your ongoing time and effort picking which rules you want to apply.  If you're starting with a small code base or no code yet, I'd recommend doing all of the ones listed under "Best Practices" "Performance" and "Security"  If you're working on a well established code base, I'd recommend the ones under "Best Practices" to start with, then once you've fixed all those issues then start adding more rules.

To start, you'll need to generate your configuration file with the list of rules you want to use

```xml
<?xml version="1.0"?>

<ruleset name="Custom Rules"
    xmlns="http://pmd.sourceforge.net/ruleset/2.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://pmd.sourceforge.net/ruleset/2.0.0 http://pmd.sourceforge.net/ruleset_2_0_0.xsd">
    <description>Custom Ruleset for Apex code</description>

    <rule ref="category/apex/bestpractices.xml/ApexUnitTestShouldNotUseSeeAllDataTrue" />
    <rule ref="category/apex/bestpractices.xml/ApexUnitTestClassShouldHaveAsserts" />
</ruleset>
```

To add more rules, simply add a new `rule` line with the path to the xml and rule name.  In the documentation, each section has a "Use this rule by referencing it" section.  Copy and paste that into your configuration file.

# Running PMD

To help with running PMD consistantly and making it so I don't have to remember all the flags, we added a pmd.sh file to our git repo as well.  This will allow us to easily make modifications and have the whole team / CI get those updates.

```bash
if [ -z ${PMD_CACHE+x} ]
then
    export PMD_CACHE="/tmp/pmd.cache"
fi

sh pmd/bin/run.sh pmd -dir ../src/ -f text -language apex -R ../conf/pmd.xml -cache $PMD_CACHE
```

The key takeaways from this are the `-dir` which points to the root where your classes and triggers directory lives.  The `-R` which points to your configuration file and `-cache` which is a cache directory for PMD.  I **highly** recommend using a cache directory since it will dramatically speed up subsequent runs.  And while you're implementing this (or new rules) for the first time, you will be running it frequently.

After running, you'll get a list of lines that need to be addressed and the rules that they violate.

So, go forth and clean up your code!