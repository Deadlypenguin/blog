---
post_id: 202
title: Scheduled actions in Salesforce with Apex
date: 2012-05-26T12:55:18+00:00
author: pcon
layout: post
permalink: /2012/05/26/scheduled-actions-in-salesforce-with-apex/
redirect_from:
- /blog/2012/05/26/scheduled-actions-in-salesforce-with-apex/
dsq_thread_id:
- "1801326365"
categories:
- development
- salesforce
tags:
- apex
- cron
---
Scheduled actions in Apex are great to use when you need to have a section of code run at a particular time in the future and Time-Based workflows will not work.  In the example below I'll talk about how to schedule code to run at the first of every month, in addition talk about some constructs you can use to make your life easier when you have to redeploy/change this code

<!--more-->

# Schedulable

The key part of the apex class is that it must implement **Schedulable** and it must have an **excecute** method.

```apex
global class scheduledMonthly implements Schedulable {
    /**
    * Builds up all of the new Objects
    *
    * @param sc The schedulable context
    */
    global void execute(SchedulableContext sc) {
        //Code goes here
    }
}
```

Now, we can fill out the class.  Below is an example where we iterate through all of the accounts of a specific record type and insert a new list of _MyObject_ based on that account.  This could be as complex as you want.

```apex
global class scheduledMonthly implements Schedulable {
    /**
    * Builds up all of the new Objects
    *
    * @param sc The schedulable context
    */
    global void execute(SchedulableContext sc) {
        RecordType rt = [
            select Id
            from RecordType
            where DeveloperName = 'Recipient'
        ];

        List<MyObject__c> objectList = new List<MyObject__c>();

        //Get all of the accounts of type 'Recipient'
        for (Account account: [
            select Id
            from Account
            where RecordTypeId = :rt.Id
        ]) {
            objectList.add(new MyObject__c(
                Account__c = account.Id
            ));
        }

        if (!objectList.isEmpty()) {
            insert objectList;
        }
    }
}
```

To schedule this class we could call it from any number of places, such as a VisualForce page, a Trigger or the Developer Console.  Since scheduled classes cannot be pushed out or changed when there are jobs in the queue we want to add a helper method to schedule this job.  In our instance it will only be ran once a month, so we include our _CRON_EXP_ as a static variable (for easy use) and to reduce the change of mis-scheduling.

```apex
/**
* To schedule the monthly reconciliation:
*    NOTE: It should run at midnight on the first of every month on it's own, but if you make
*    changes and need to requeue run the command below from the developer's console
*
*    scheduledMonthly.scheduleIt();
*/

global class scheduledMonthly implements Schedulable {
    public static String CRON_EXP = '0 0 0 1 * ? *';

    /**
    * Static method used to schedule the default reconciliation
    *
    * @return The jobId from the scheduled run
    */
    global static String scheduleIt() {
        scheduledMonthly sm = new scheduledMonthly();
        return System.schedule('Monthly Reconciliation', CRON_EXP, sm);
    }

    /**
    * Builds up all of the new Monthly Reconciliations and Distributions
    *
    * @param sc The schedulable context
    */
    global void execute(SchedulableContext sc) {
        RecordType rt = [
            select Id
            from RecordType
            where DeveloperName = 'Recipient'
        ];

        List<MyObject__c> objectList = new List<MyObject__c>();

        //Get all of the accounts of type 'Recipient'
        for (Account account: [
            select Id
            from Account
            where RecordTypeId = :rt.Id
        ]) {
            objectList.add(new MyObject__c(
                Account__c = account.Id
            ));
        }

        if (!objectList.isEmpty()) {
            insert objectList;
        }
    }
}
```

To reset our schedule all we have to do is use type the following into the Developer console.

```apex
scheduledMonthly.scheduleIt();
```

And by looking in _Setup &rarr; Monitoring &rarr; Scheduled Jobs_ we can see that our scheduledMonthly class is there.

# Cron Syntax

There are seven fields for Salesforce's cron syntax, unlike \*nix's 5 fields.

* Seconds \[0-59\]
* Minutes \[0-59\]
* Hours \[0-23\]
* Day of month \[1-31\]
* Month \[1-12 or JAN-DEC\]
* Day of week \[1-7 or SUN-SAT\]
* Year \[1970-2099\]

There are also some special characters you can use:

* `,` used to delimit values \[hours, day of month, month, day of week, year\]
* `-` used to specify a range \[hours, day of month, month, day of week, year\]
* `*` used to specify all values \[hours, day of month, month, day of week, year\]
* `?` used to specify no specific value \[day of month, day of week\]
* `/` used to specify increments \[hours, day of month, month, day of week, year\]
* `L` used to specify the end of a range \[day of month, day of week\]
* `W` used to specify the nearest weekday \[day of month\]
* `#` used to specify the _nth_ day of the month \[day of week\]

# Testing

Testing for scheduled apex may seem confusing but it's very straight forward.  Like @future calls, scheduled apex will not fire until after the _Test.stopTest()_has been run.  In the test below we test the following:

* The Cron Expression is the same
* The job has not been triggered yet
* The scheduled date is correct
* No MyObjects were created
* One object was created after the scheduled job was ran

```apex
@isTest
class scheduledMonthlyTest {
    public static RecordType fetchRecordType(String name) {
        return [
            select Id
            from RecordType
            where DeveloperName = :name
        ];
    }

    public static Account getAccount(RecordType rt) {
        return getAccount(rt, '_unittest_account_: 001');
    }

    public static Account getAccount(RecordType rt, String name) {
        return new Account(
            Name = name,
            RecordTypeId = rt.Id
        );
    }

    public static CronTrigger fetchCronTrigger(String jobId) {
        return [
            select CronExpression,
                TimesTriggered,
                NextFireTime
            from CronTrigger
            where Id = :jobId
        ];
    }
    public static Map<Id, List<MyObject__c>> fetchMyObjects(List<Account> accts) {
        Map<Id, List<MyObject__c>> result = new Map<Id, List<MyObject__c>>();

        for (Account a: accts) {
            result.put(a.Id, new List<MyObject__c>());
        }

        for (MyObject__c mo: [
            select Account__c
            from MyObject__c
            where Account__c in :result.keySet()
        ]) {
            result.get(mo.Account__c).add(mo);
        }
    }

    static testMethod void testScheduledMonthly() {
        RecordType rt = fetchRecordType('Recipient');

        Account testAccount = getAccount(rt);
        insert testAccount;

        Test.startTest();

        String jobId = System.schedule(
            '_unittest_scheduled_: 001',
            scheduledMonthly.CRON_EXP,
            new scheduledMonthly()
        );

        CronTrigger ct = fetchCronTrigger(jobId);

        System.assertEquals(
            scheduledMonthly.CRON_EXP,
            ct.CronExpression,
            'Did not get the same Cron Expression back'
        );
        System.assertEquals(
            0,
            ct.TimesTriggered,
            'The job has been run and should not have'
        );

        DateTime today = DateTime.now();
        String dateString = '' +
            today.year() + '-' +
            today.addMonths(1).month() +
            '-01 00:00:00';
        System.assertEquals(
            String.valueOf(DateTime.valueOf(dateString)),
            String.valueOf(ct.NextFireTime),
            'Did not get the right fire date'
        );

        List<MyObject__c> myObjs = fetchMyObjects(new List<Account>{testAccount}).get(testAccount.Id);
        System.assert(
            myObjs.isEmpty(),
            'Should have gotten no objects back'
        );

        Test.stopTest();

        myObjs = fetchMyObj(new List<Account>{testAccount}).get(testAccount.Id);
        System.assert(
            1,
            myObjs.size(),
            'Did not get the right number of objects back'
        );
    }
}
```

# Limitations / Notes

There are three big limitations / notes about scheduled Apex

* It will be put on the queue at the given time, it is **not** guaranteed to run at that time.
* You can only have 25 classes scheduled at a time
* You cannot use _getContent_ or _getContentAsPDFPageReference_