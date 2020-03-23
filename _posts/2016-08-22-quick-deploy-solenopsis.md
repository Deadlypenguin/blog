---
post_id: 1069
title: Quick Deploy with Solenopsis
date: 2016-08-22T08:00:20+00:00
author: pcon
layout: post
permalink: /2016/08/22/quick-deploy-solenopsis/
redirect_from:
- /blog/2016/08/22/quick-deploy-solenopsis/
thumbnail: /assets/img/2016/08/22/post_thumbnail.png
dsq_thread_id:
- "5084086502"
categories:
- development
- salesforce
tags:
- deployment
- solenopsis
---
In Spring '15 Salesforce released a feature called "[Quick Deploy](http://releasenotes.docs.salesforce.com/en-us/spring15/release-notes/rn_quick_deployment_ga.htm)" that allows you to only run a small subset of tests when you do your deployment instead of running all the tests.  When you're in an org like ours that running all tests can take upwards of 5hrs (or longer if the moon is aligned incorrectly) this is wonderful.  Let's take a look at how quick deploy works and how you can use quick deploy with Solenopsis.

# How Quick Deploy Works

Quick deploy simply runs a provided list of tests when you run your deployment.  This deployment is then staged under your Deployment Status in setup.  Once the all the tests have run you'll get a button that let's you quick deploy.

<!--more-->

![quick deploy status](/assets/img/2016/08/22/quickDeployStatus.png)

In order for the deployment to succeed, you have to meet the code coverage requirements for the classes you are deploying.  For example, if we are deploying BaseTrigger.cls we have to run enough tests to get at least 75% code coverage for that class.

Caveats

* You have to have the correct amount of code coverage for the deployed code
* You do not have to include the tests (if they haven't been updated) in your package, but you do have to mention them in the XML (Solenopsis handles the mentioning bit)
* The deployment expires after 96hrs and must be re-run after that timeframe
* Any changes to the org's metadata can invalidate the deployment and will require the deployment to happen again
* Quick deploy only works against production orgs and cannot be used against a sandbox or developer org

# Quick Deploy with Solenopsis

Shortly after this feature came out of pilot, we added it to [Solenopsis](http://solenopsis.org/Solenopsis/).  We have been using this as our primary way of deploying code to production and it's great.  We went from having a deployment window on the day of from 5hrs to less than 30min.  The amount of time the job runs to do the deployment varies from deployment to deployment but that time doesn't require any real downtime or notification for our users.

## Prep Work

To get your code ready to use the quick deployment feature you'll need to add a javadoc annotation to denote what test classes need to be run.  For this example, we'll be taking a look at the code our [Escalations](https://github.com/RedHatSalesforce/escalations) application.

### Trigger

```apex
/**
* Trigger for escalation cases
*
* @author Patrick Connelly (patrick@deadlypenguin.com)
* @testClasses EscalationCaseTrigger_Test
*/
trigger EscalationCase on EscalationCase__c (before insert, before update, before delete, after insert, after update, after delete) {
	EscalationCaseTrigger t = new EscalationCaseTrigger(Trigger.oldMap, Trigger.new, Trigger.isBefore);
}
```

### Class

```apex
/**
* Trigger work for escalation cases
*
* @author Patrick Connelly (patrick@deadlypenguin.com)
* @testClasses EscalationCaseTrigger_Trigger
*/
public with sharing class EscalationCaseTrigger extends BaseTrigger {
    // Code removed for brevity
}
```

### Explanation

In the code above, you can see that we've added the `@testClasses` annotation.  This is a comma separated list of class names to run.

## Usage

Any of the standard Solenopsis commands can be run with the `--fast` parameter.  The most useful of the commands is the `delta-push` as it will determine what is different on disk from what is in the target org and then only add the tests needed to cover those classes.

Doing the deployment is as simple as

```bash
solenopsis --fast delta-push
```

This will generate our destructive changes xml as well as parse the `@testClasses` and generate the correct XML to denote the test classes.