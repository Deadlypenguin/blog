---
post_id: 604
title: Service Breach Time on Cases
date: 2015-07-29T22:42:25+00:00
author: pcon
layout: post
permalink: /2015/07/29/service-breach-time-displaying-it-on-the-case/
redirect_from:
- /blog/2015/07/29/service-breach-time-displaying-it-on-the-case/
dsq_thread_id:
- "3985058114"
categories:
- development
- salesforce
tags:
- apex
- entitlements
- servicecloud
---
Service Level Agreements (SLAs) are very common in the support industry.  Salesforce makes these very easy to apply and manage via the built in [Entitlement Processes](https://help.salesforce.com/HTViewHelpDoc?id=entitlements_process_overview.htm&language=en_US).  These entitlement processes will generate Case Milestones that are associated with your case.  These milestones will have a Target Date that shows you when your Case Milestones have to be completed.  Typically the date itself is fairly difficult to use however if you convert this into the number of minutes remaining then you get a tangible count down for an action that has to be done on the case.  This number is called your Service Breach Time (SBT).

Unfortunately there is no easy way to transfer the Target Date from your Case Milestones to your Case and generate your SBT.  These fields cannot be pulled into a formula and you cannot write triggers against [Case Milestones](https://success.salesforce.com/ideaView?id=08730000000YbZsAAK).  You can however use Apex to get the data onto your Case object.
<!--more-->

# Strategy to Copy the Service Breach Time to Your Case

We know that we cannot write triggers on Case Milestones so we have to come up with another way to do it.  If we do it in an Apex trigger, we have access to all of the data.  So, let's just write a trigger!  Unfortunately the [Case Milestone calculation](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_order_of_execution.htm) occurs after the triggers fire on the Case.  Because of this we'll have to do it after everything has "settled" on the Case.  This means well have to use an @future call.

# Problems With Using @future

Using the @future annotation is not a silver bullet, it does have it's problems but they are not show stoppers.

* **Future calls happen sometime in the future:** Due to the nature of future calls, they may not happen immediately after you make them.  This can leave your case in a unexpected state where the SBT hasn't updated until the future call has completed
* **Future calls get queued:** If your org is using future calls for other things, or update bunches of cases in a short period of time, the future queue can get backed up (sometimes by hours) causing the scenario above to occur.
* **Future calls are tough to wrap your head around:** If your a new developer to the platform future calls can be difficult to understand how the code interaction occurs

# Setting it up

In our fictitious support org our Case Milestones are updated when the Status changes to &#8216;Waiting on Support', when the Priority changes or when a Case Comment is added by the case's owner.  We only care about the &#8216;Ongoing Response' milestone and that is the only one whose TargetDate should be copied to the case.

## Case Fields

We'll need to add the following fields to the Case object

* **TargetDate__c** &#8211; _DateTime_ &#8211; This will be when the case will breach SLA
* **SBT__c** &#8211; _Formula (Decimal)_&#8211; This will be the number of real world minutes we have until breach

```text
CASE(
	TEXT(Status),
	'Closed', NULL,
	'Waiting on Customer', NULL,
	IF(ISNULL(TargetDate__c),
		NULL,
		FLOOR((TargetDate__c - NOW())*24*60)
	)
)
```

## Utility Class

Below is the utility code that we'll use to actually query the Case Milestones and update the case records.

```apex
public class CaseMilestoneUtils {
	private static String MILESTONE_NAME = 'Ongoing Response';

	@future
	public static void copyTargetDate(Set<Id> caseIds) {
		List<Case> casesToUpdate = new List<Case>();

		for (CaseMilestone milestone : [
			select CaseId,
				MilestoneType.Name,
				TargetDate
			from CaseMilestone
			where CaseId in :caseIds and
				MilestoneType.Name = :MILESTONE_NAME
		]) {
			casesToUpdate.add(new Case(
				Id = milestone.CaseId,
				TargetDate__c = milestone.TargetDate
			));
		}

		if (!casesToUpdate.isEmpty()) {
			update casesToUpdate;
		}
	}
}
```

## Triggers

This trigger will call our utility class whenever the status or priority has changed.  I would really recommend that you [classify your triggers](/2012/02/13/classifying-triggers-in-salesforce/ "Classifying Triggers in Salesforce") so that you can have this occur last (and / or be able to control if it fires at all)

```apex
trigger UpdateTargetDate on Case (after update) {
	Set<Id> casesToUpdate = new Set<Id>();

	for (Case c : Trigger.new) {
		Case oldCase = Trigger.oldMap.get(c.Id);

		if (
			(
				c.Status == 'Waiting on Support' &&
				c.Status != oldCase.Status
			) ||
			c.Priority != oldCase.Priority
		) {
			casesToupdate.add(c.Id);
		}
	}

	if (!casesToUpdate.isEmpty()) {
		CaseMilestoneUtils.copyTargetDate(casesToUpdate);
	}
}
```

This trigger will fire anytime we insert a new Case Comment and the creator of the comment is the case owner.

```apex
trigger UpdateTargetDate on CaseComment (after insert) {
	Set<Id> casesToUpdate = new Set<Id>();
	Set<Id> caseIds = new Set<Id>();

	for (CaseComment cc : Trigger.new) {
		caseIds.add(cc.ParentId);
	}

	Map<Id, Case> caseMap = new Map<Id, Case>([
		select OwnerId
		from Case
		where Id in :caseIds
	]);

	for (CaseComment cc : Trigger.new) {
		Case c = caseMap.get(cc.ParentId);

		if (cc.CreatedById == c.OwnerId) {
			casesToUpdate.add(cc.ParentId);
		}
	}

	if (!casesToUpdate.isEmpty()) {
		CaseMilestoneUtils.copyTargetDate(casesToUpdate);
	}
}
```

This code should get you started.  It is important to note that when writing test methods for these that the @future will not complete until you run a Test.startTest() or a Test.stopTest().  So you'll want to stop your test then query your Case object to verify that the new TargetDate is set.