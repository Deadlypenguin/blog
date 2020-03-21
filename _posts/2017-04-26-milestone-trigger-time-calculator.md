---
post_id: 1201
title: Milestone Trigger Time Calculator
description: Have you ever wanted to programatically determine the number of minutes for an entitlement process? Well, using the milestone trigger class you can!
date: 2017-04-26T16:54:04+00:00
author: pcon
layout: post
permalink: /2017/04/26/milestone-trigger-time-calculator/
redirect_from:
- /blog/2017/04/26/milestone-trigger-time-calculator/
thumbnail: /assets/img/2017/04/26/post_thumbnail.png
comments: true
dsq_thread_id:
- "5762587323"
categories:
- development
- salesforce
tags:
- apex
- entitlements
- salesforce
---
I recently stumbled upon a "new" feature in Salesforce that allows you to use an Apex class to calculate your milestone trigger time for entitlement processes.  Given a new feature that I'm working on for our entitlement process, I thought to myself that this could be a good chance to play with it and see what I could do.  If you're not familiar with the entitlement process in Salesforce, take a chance to look over (or run through) my [hands-on training](http://pcon.github.io/handsontraining/entitlements/) for entitlements so that you're familiar with the terminology and the concepts since I'll be jumping right in.

<!--more-->

# Business Needs

Let's take a look at the business requirements we're trying to fulfill here with entitlement processes and milestones.

||High|Medium|Low
|---|---|---|---|
|First Response|60 min|120 min|480 min|
|Ongoing Response|60 min|20 min|120 min|
|Resolution (Real Days)|7 days|Release Date|Release Date|

The first response and ongoing response are pretty straight forward, as is the resolution milestone for high priority cases.  Where this gets tricky is basing it on a date field on the case.  The standard milestone only takes in minutes.  However, we can use the new milestone trigger time calculator to use Apex to programatically determine the number of minutes for the milestone.

# Utility Classes

This set up requires a couple of utility classes to make the code cleaner and easier to follow.

## Generic Utils

This class just holds our text for our priorities.

```java
public class GenericUtils {
    public static String PRIO_HIGH = 'HIGH';
    public static String PRIO_MEDIUM = 'MEDIUM';
    public static String PRIO_LOW = 'LOW';
}
```

## Case Utils

This class gets our case as well as what business hours the milestone is using.  This is pulled from [How Business Hours Work in Entitlement Management](https://help.salesforce.com/articleView?id=entitlements_business_hours.htm&type=0) document.

```java
public class CaseUtils {
    /**
     * Fetches a case for a given case id
     *
     * @param caseId The case id
     * @return The case
     */
    public static Case fetchCase(Id caseId) {
        return [
            select BusinessHoursId,
            	Entitlement.BusinessHoursId,
            	Entitlement.SlaProcess.BusinessHoursId,
            	Priority,
            	ReleaseDate__c,
            	SlaStartDate,
            	(
                    select BusinessHoursId,
                    	MilestoneTypeId
                    from CaseMilestones
                )
            from Case
            where Id = :caseId
        ];
    }

    /**
     * Gets the business hour id based on the entitlement management
     * hierarchy for business hours
     *
     * @param c The case to get the hours from
     * @param milestoneTypeId The milestone type to check for
     * @return The buisniess hour id to use
     */
    public static Id getBusinessHourId(Case c, Id milestoneTypeId) {
        Map<Id, Id> milestoneToBHMap = new Map<Id, Id>();

        for (CaseMilestone cm : c.CaseMilestones) {
            milestoneToBHMap.put(cm.MilestoneTypeId, cm.BusinessHoursId);
        }

        if (
            milestoneToBHMap.containsKey(milestoneTypeId) &&
            milestoneToBHMap.get(milestoneTypeId) != null
        ) {
            return milestoneToBHMap.get(milestoneTypeId);
        }

        if (c.Entitlement.SlaProcess.BusinessHoursId != null) {
            return c.Entitlement.SlaProcess.BusinessHoursId;
        }

        if (c.Entitlement.BusinessHoursId != null) {
            return c.Entitlement.BusinessHoursId;
        }

        if (c.BusinessHoursId != null) {
            return c.BusinessHoursId;
        }

        return EntitlementUtils.DEFAULT_BUSINESSHOUR.Id;
    }
}
```

# Entitlement Utils

This class stores our mapping for hours, some static methods for milestone types / business hours and most importantly a method that gets the number of business minutes between the SLA start date and a given date.  This will be used to calculate the number of minutes that we'll have for our resolution milestone

```java
public class EntitlementUtils {
    public static String TYPE_FIRSTRESPONSE = 'FIRST RESPONSE';
    public static String TYPE_ONGOINGRESPONSE = 'ONGOING RESPONSE';
    public static String TYPE_RESOLUTION = 'RESOLUTION';

    /* A map of our milestone type name to our criteria */
    public static Map<String, Map<String, Integer>> MILESTONE_MIN_MAP = new Map<String, Map<String, Integer>> {
        TYPE_FIRSTRESPONSE => new Map<String, Integer> {
            GenericUtils.PRIO_HIGH => 60,
			GenericUtils.PRIO_MEDIUM => 120,
            GenericUtils.PRIO_LOW => 480
        },
        TYPE_ONGOINGRESPONSE => new Map<String, Integer> {
            GenericUtils.PRIO_HIGH => 60,
            GenericUtils.PRIO_MEDIUM => 60,
            GenericUtils.PRIO_LOW => 120
        },
        TYPE_RESOLUTION => new Map<String, Integer> {
            GenericUtils.PRIO_HIGH => 10080
        }
    };

    /** The default business hour */
    public static BusinessHours DEFAULT_BUSINESSHOUR {
        get {
            if (DEFAULT_BUSINESSHOUR == null) {
                DEFAULT_BUSINESSHOUR = [
                    select Id
                    from BusinessHours
                    where IsDefault = true
                    limit 1
                ];
            }

            return DEFAULT_BUSINESSHOUR;
        }
    }

    /** A map of milestone type id to milestone type */
    public static Map<Id, MilestoneType> MILESTONETYPE_MAP {
        get {
            if (MILESTONETYPE_MAP == null) {
                MILESTONETYPE_MAP = new Map<Id, MilestoneType>([
                    select Name
                    from MilestoneType
                ]);
            }

            return MILESTONETYPE_MAP;
        }
    }

    /**
     * Gets the number of business minutes between the cases' SLA start date
     * and a given date.
     *
     * @param c The case
     * @param d The target date
     * @param milestoneTypeId The milestone type that is being calculated for
     * @return The number of business minutes
     */
    public static Integer getMinutesBetweenStartAndDate(Case c, Date d, Id milestoneTypeId) {
        Datetime slaStart = c.SlaStartDate;
        Datetime dt = Datetime.newInstanceGMT(
            d.year(), d.month(), d.day(),
            slaStart.hourGmt(), slaStart.minuteGmt(), slaStart.secondGmt()
        );

        Id businessHourId = CaseUtils.getBusinessHourId(c, milestoneTypeId);
        Long remainingTime = BusinessHours.diff(businessHourId, slaStart, dt) / 1000 / 60;
        return remainingTime.intValue();
    }
}
```

# Milestone Trigger

Now we get into the meat of the problem.  We have the milestone trigger class.  This class has to implement the `Support.MilestoneTriggerTimeCalculator` to return the number of business minutes required.  I'll be the first to admit that for a proof of concept, the design is a little bit overboard, but it also shows how you can use inheritance in apex to simplify some handlers like this.  Because of this inheritance, our actual acting method `calculateMilestoneTriggerTime` doesn't care what kind of underlying handler there is, it just makes the same calls regardless.

```java
global class EntitlementMilestoneCalc implements Support.MilestoneTriggerTimeCalculator {
    private static Integer DEFAULT_TIME = 60;

    /** The base milestone handler class */
    public abstract class MilestoneHandler {
        private Case c;
        private Id milestoneTypeId;

        /** Empty constructor */
        public MilestoneHandler() {}

        /**
         * Sets the case
         *
         * @param c The case
         */
        public void setCase(Case c) {
            this.c = c;
        }

        /**
         * Sets the milestone type id
         *
         * @param milestoneTypeId The milestone type id
         */
        public void setMilestoneTypeId(Id milestoneTypeId) {
            this.milestoneTypeId = milestoneTypeId;
        }

        /**
         * Returns the number of business minutes needed
         *
         * @return The number of business minutes
         */
        abstract Integer getTriggerTime();
    }

    public class FirstResponseHandler extends MilestoneHandler {
        /**
         * Returns the number of business minutes needed
         *
         * @return The number of business minutes
         */
        public override Integer getTriggerTime() {
            // If we cannot find the first response type or the case's priority in the map
            // then default to the static DEFAULT_TIME
            if (
                !EntitlementUtils.MILESTONE_MIN_MAP.containsKey(EntitlementUtils.TYPE_FIRSTRESPONSE) &&
                !EntitlementUtils.MILESTONE_MIN_MAP.get(EntitlementUtils.TYPE_FIRSTRESPONSE).containsKey(this.c.Priority.toUpperCase())
            ) {
                return DEFAULT_TIME;
            }

            return EntitlementUtils.MILESTONE_MIN_MAP.get(EntitlementUtils.TYPE_FIRSTRESPONSE).get(this.c.Priority.toUpperCase());
        }
    }

    public class OngoingResponseHandler extends MilestoneHandler {
        /**
         * Returns the number of business minutes needed
         *
         * @return The number of business minutes
         */
        public override Integer getTriggerTime() {
            // If we cannot find the first response type or the case's priority in the map
            // then default to the static DEFAULT_TIME
            if (
                !EntitlementUtils.MILESTONE_MIN_MAP.containsKey(EntitlementUtils.TYPE_ONGOINGRESPONSE) &&
                !EntitlementUtils.MILESTONE_MIN_MAP.get(EntitlementUtils.TYPE_ONGOINGRESPONSE).containsKey(this.c.Priority.toUpperCase())
            ) {
                return DEFAULT_TIME;
            }

            return EntitlementUtils.MILESTONE_MIN_MAP.get(EntitlementUtils.TYPE_ONGOINGRESPONSE).get(this.c.Priority.toUpperCase());
        }
    }

    public class ResolutionResponseHandler extends MilestoneHandler {
        /**
         * Returns the number of business minutes needed
         *
         * @return The number of business minutes
         */
        public override Integer getTriggerTime() {
            // If we have a static amount of time return that
            if (
                EntitlementUtils.MILESTONE_MIN_MAP.containsKey(EntitlementUtils.TYPE_RESOLUTION) &&
                EntitlementUtils.MILESTONE_MIN_MAP.get(EntitlementUtils.TYPE_RESOLUTION).containsKey(this.c.Priority.toUpperCase())
            ) {
                return EntitlementUtils.MILESTONE_MIN_MAP.get(EntitlementUtils.TYPE_RESOLUTION).get(this.c.Priority.toUpperCase());
            }

            // Otherwise, calculate the amount of business minutes until the ReleaseDate__c
            // NOTE: This should never NPE because the milestone criteria will only fire
            //       for when ReleaseDate__c is not null
            return EntitlementUtils.getMinutesBetweenStartAndDate(this.c, this.c.ReleaseDate__c, this.milestoneTypeId);
        }
    }

    /** A map of milestone name to handler class name */
    private static Map<String, String> HANDLER_MAP = new Map<String, String> {
        EntitlementUtils.TYPE_FIRSTRESPONSE => FirstResponseHandler.class.getName(),
        EntitlementUtils.TYPE_ONGOINGRESPONSE => OngoingResponseHandler.class.getName(),
        EntitlementUtils.TYPE_RESOLUTION => ResolutionResponseHandler.class.getName()
    };

    /**
     * Calculates the number of business minutes for a given milestone / case combination
     *
     * @param caseId The id of the case
     * @param milestoneTypeId The id of the milestone type
     * @return The number of business minutes
     */
    global Integer calculateMilestoneTriggerTime(String caseId, String milestoneTypeId) {
        Case c = CaseUtils.fetchCase(caseId);
        String milestoneName = EntitlementUtils.MILESTONETYPE_MAP.get(milestoneTypeId).Name.toUpperCase();

        // If we can't find a handler for this milestone name, return the default time
        if (!HANDLER_MAP.containsKey(milestoneName)) {
            return DEFAULT_TIME;
        }

        // Create a new instance of the handler, set the data and return the time
        Type t = Type.forName(HANDLER_MAP.get(milestoneName));
        MilestoneHandler handler = (MilestoneHandler) t.newInstance();
        handler.setMilestoneTypeId(milestoneTypeId);
        handler.setCase(c);
        return handler.getTriggerTime();
    }
}
```

# Entitlement Process

Now that we've gotten the tricky part of the Apex done, let's move on to the tedious part of creating the entitlement process.  However, because of the Apex, we now only have three milestone processes instead of nine. And we can update these without having to make a new version of the entitlement process and update all of the entitlements and cases.

![Entitlement Process](/assets/img/2017/04/26/entitlementProcess.png)

The entitlement process is pretty bland.  We just want it to be on the case if it is not closed

![First response milestone with milestone trigger class](/assets/img/2017/04/26/firstResponseMilestoneWithMilestoneTriggerClass.png)

![Ongoing response milestone with milestone trigger class](/assets/img/2017/04/26/ongoingResponseMilestoneWithMilestonTrigger.png)

With the First Response milestone, we can see that we have a criteria of no comments and we point it to our EntitlementMilestoneCalc class.  This is repeated for Ongoing Response as well

![Resolution milestone with milestone trigger class](/assets/img/2017/04/26/resolutionMilestoneWithMilestoneTriggerClass.png)

Now our Resolution milestone has something interesting with it.  We add some additional logic that the priority is High or the Release Date is not null.  We do this to short circuit the process to not show up if a Release Date is not set.  This is because the milestone trigger _**must**_ return an non-zero positive integer.  So if we don't know our time or don't want it to show up, we have to keep the milestone from ever being created via the milestone criteria.  For this milestone we also have a business hour of 24/7 set so that when we use 10080 minutes in our return these are real-world minutes.  This simplifies our date math a bit, but I decided to stick with a more flexible logic in the Apex code to not assume that the business hours were 24/7.

_NOTE: The case status is not needed and was just an oversight on my behalf.  Since the entitlement milestone criteria ensures that the status is not closed, we don't need this._

# Conclusion

The milestone trigger class is really neat and I can see how it can be really powerful.  I look forward to trying it out in our production org and seeing if there are any blindspots in this process that I have missed.  I'm interested to see how well it plays with deploying updates to the milestone trigger class when it is in use.  And just as an extra reminder, the milestone trigger method **_must_** return a non-zero positive integer or you will get save-time exceptions.  So make sure that you plan out your defaults correctly and that you try to keep milestones from being created (and therefore running your class) for instances where the milestone shouldn't exist.