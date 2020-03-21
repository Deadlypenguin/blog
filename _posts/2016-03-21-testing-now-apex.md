---
post_id: 824
title: Testing NOW in Apex
date: 2016-03-21T08:30:12+00:00
author: pcon
layout: post
permalink: /2016/03/21/testing-now-apex/
redirect_from:
- /blog/2016/03/21/testing-now-apex/
dsq_thread_id:
- "4678658740"
categories:
- development
- salesforce
tags:
- apex
- testing
---
If you've ever written a trigger that stores Date.now(), then [this scene](https://www.youtube.com/watch?v=5drjr9PmTMA) from [Spaceballs](http://www.imdb.com/title/tt0094012) may seem very familiar.  This is how I feel when testing now.

![Testing now](/assets/img/2016/03/21/spaceballs_now.png)

* **Dark Helmet:** What the hell am I looking at? When does this happen in the movie?
* **Colonel Sandurz:** Now. You're looking at now, sir. Everything that happens now, is happening now.
* **Dark Helmet:** What happened to then?
* **Colonel Sandurz:** We passed then.
* **Dark Helmet:** When?
* **Colonel Sandurz:** Just now. We're at now now.
* **Dark Helmet:** Go back to then.
* **Colonel Sandurz:** When?
* **Dark Helmet:** Now.
* **Colonel Sandurz:** Now
* **Dark Helmet:** Now.

The problem comes down to knowing when now is.  Obviously, now is something that's in constant flux and will change throughout your test.  But there are ways to be able to know when now really is in your test.

<!--more-->

# The Code to test

The code below is a trivial class that sets the last public update date on our Case object.  The use case for this would be if we only had a subset of fields on a case that were public to a customer and we didn't want to use the LastModifiedDate because the customer would see that the time changed but there was no change that was visible to them.

For our example, we are going to consider a public update to be any change to the Status, Description or Subject.  I'll also be using the [trigger framework](http://blog.deadlypenguin.com/blog/2012/02/13/classifying-triggers-in-salesforce/) from a previous post.

```java
public class CaseTrigger {
    private final Map<Id, Case> oldMap;
    private final Map<Id, Case> newMap;
    private final List<Case> newObjs;
    private final Boolean isInsert;
    private final Boolean isUpdate;
    private final Boolean isDelete;
    private final Boolean isBulk;

    private static Set<String> PUBLIC_UPDATE_FIELDS = new Set<String> {
        'Description',
        'Subject',
        'Status'
    };

    public CaseTrigger(Map<Id, Case> xoldMap, List<Case> xnewObjs, Boolean isBefore) {
        this.oldMap = xoldMap;
        this.newObjs = xnewObjs;

        if (!isBefore && this.newObjs != null) {
            this.newMap = new Map<Id, Case>(this.newObjs);
        }

        this.isDelete = (((this.newObjs == null || this.newObjs.isEmpty()) && isBefore) || ((this.newMap == null || this.newMap.isEmpty()) && !isBefore));
        this.isUpdate = ! (this.isDelete || this.oldMap == null || this.oldMap.isEmpty());
        this.isInsert = ! (this.isDelete || this.isUpdate);
        this.isBulk = (((!this.isDelete) && (this.newObjs.size() > 1)) || ((this.isDelete) && (this.oldMap.size() > 1)));
    }

    public void recordLastPublicUpdate() {
        if (this.isDelete) {
            return;
        }

        for (Case c : this.newObjs) {
            Boolean hasPublicUpdate = false;

            if (this.isInsert) {
                hasPublicUpdate = true;
            } else {
                Case oldCase = this.oldMap.get(c.Id);

                for (String field : PUBLIC_UPDATE_FIELDS) {
                    if (c.get(field) != oldCase.get(field)) {
                        hasPublicUpdate = true;
                        break;
                    }
                }
            }

            if (hasPublicUpdate) {
                c.LastPublicUpdate__c = DateTime.now();
            }
        }
    }

    public static void processTrigger(Map<Id, Case> oldMap, List<Case> newObj, Boolean isBefore) {
        final CaseTrigger myTrigger = new CaseTrigger(oldMap, newObj, isBefore);

        if (isBefore) {
            myTrigger.recordLastPublicUpdate();
        }
    }
}
```

The trigger code here is pretty simple.  If we have a new case or if one of the fields in our list have been updated we set the LastPublicUpdate__c field to DateTime.now().

# Standard Test

The test for such an update would look something like this (update test only)

```java
static void testMethod statusChangeTest() {
    Account testAccount = TestUtils.getAccount();
    insert testAccount;

    Case testCase = TestUtils.getCase(testAccount);
    testCase.Status = 'Unassigned';
    insert testCase;

    // Includes LastPublicUpdate__c in a SOQL query
    testCase = TestUtils.fetchCase(testCase);

    DateTime lastPublicUpdate = testCase.LastPublicUpdate__c;

    Test.startTest();

    testCase.Status = 'Waiting on Owner';
    update testCase;

    Test.stopTest();

    testCase = TestUtils.fetchCase(testCase);

    System.assert(
        lastPublicUpdate < testCase.LastPublicUpdate__c,
        'The last public update should have been advanced'
    );
}
```

The problem with this tests is that there's a pretty good chance that the test is going to run too fast.  Because the DateTime field is only granular down to the second, if this test executes too fast, then the DateTime will not appear to have been updated.  In the past I would have recommended that you change the less than to a less than or equal to but that's not really testing what you're trying to do.  The other method would be to add some code that causes this to artificially wait a second or two before updating the case.  Now this certainly works, but the problem there is now you're making your tests take longer than they have to.

# Fixing The Class

To combat this, we can reach into the class and fudge when now is.  Let's take a look at our updated class

```java
public class CaseTrigger {
    private final Map<Id, Case> oldMap;
    private final Map<Id, Case> newMap;
    private final List<Case> newObjs;
    private final Boolean isInsert;
    private final Boolean isUpdate;
    private final Boolean isDelete;
    private final Boolean isBulk;

    private static Set<String> PUBLIC_UPDATE_FIELDS = new Set<String> {
        'Description',
        'Subject',
        'Status'
    };

    @testVisible
    private static DateTime NOW {
        get {
            if (NOW == null) {
                NOW = DateTime.now();
            }

            return NOW;
        }
        private set;
    }

    public CaseTrigger(Map<Id, Case> xoldMap, List<Case> xnewObjs, Boolean isBefore) {
        // Constructor stuff
    }

    public void recordLastPublicUpdate() {
        if (this.isDelete) {
            return;
        }

        for (Case c : this.newObjs) {
            Boolean hasPublicUpdate = false;

            if (this.isInsert) {
                hasPublicUpdate = true;
            } else {
                Case oldCase = this.oldMap.get(c.Id);

                for (String field : PUBLIC_UPDATE_FIELDS) {
                    if (c.get(field) != oldCase.get(field)) {
                        hasPublicUpdate = true;
                        break;
                    }
                }
            }

            if (hasPublicUpdate) {
                c.LastPublicUpdate__c = NOW;
            };
        }
    }

    public static void processTrigger(Map<Id, Case> oldMap, List<Case> newObj, Boolean isBefore) {
        // Method calls
    }
}
```

Here we can see that with a couple of little modifications we've got a bunch of control over when now is.  Line 16-26 is where all the heavy lifting is.  So let's break this down line by line

_Line 16:_ Since the variable is private we need to make it visible to our test to be able to set

```java
@testVisible
```

_Line 17:_ Define our variable (using the all caps standard since it's a static)

```java
private static DateTime NOW {
```

_Line 18:_ Use the built in get/set methods in Apex to "lazy load" the variable

```java
get {
```

_Lines 19-21:_ If NOW hasn't been set, we want to populate it with the actual value of now.

```java
if (NOW == null) {
            NOW = DateTime.now();
        }
```

_Line 23:_ Return the current value of the variable

```java
return NOW;
```

# Testing NOW

We need to update our test class to make use of our new variable NOW.  For our instance here, we really just want to make the initial LastPublicUpdate__c be in the past.  This pattern could be used to set now into the future if needed.

```java
static testMethod void statusChangeTest() {
    Account testAccount = TestUtils.getAccount();
    insert testAccount;

    // Update the last public update date to be in the past
    DateTime lastPublicUpdate = DateTime.now().addDays(-5);
    CaseTrigger.NOW = lastPublicUpdate;

    Case testCase = TestUtils.getCase(testAccount);
    testCase.Status = 'Unassigned';
    insert testCase;

    // Includes LastPublicUpdate__c in a SOQL query
    testCase = TestUtils.fetchCase(testCase);

    System.assertEquals(
        lastPublicUpdate,
        testCase.LastPublicUpdate__c,
        'The last public update was not set right'
    );

    // Reset so that the correct time is used
    CaseTrigger.NOW = null;

    Test.startTest();

    testCase.Status = 'Waiting on Owner';
    update testCase;

    Test.stopTest();

    testCase = TestUtils.fetchCase(testCase);

    System.assert(
        lastPublicUpdate < testCase.LastPublicUpdate__c,
        'The last public update should have been advanced'
    );
}
```

_Lines 6-7:_ Create a DateTime that is in the past and set the NOW variable in the trigger to that.

```java
DateTime lastPublicUpdate = DateTime.now().addDays(-5);
CaseTrigger.NOW = lastPublicUpdate;
```

Lines 16-20: Verify that the correct time was use

```java
System.assertEquals(
    lastPublicUpdate,
    testCase.LastPublicUpdate__c,
    'The last public update was not set right'
);
```

Line 23: Reset NOW to null so that the next run of the trigger will use the current time

```java
CaseTrigger.NOW = null;
```

By doing these steps, we will have a consistently testable LastPublicUpdate__c field on our case.  We can also do things like pretend that there have been several weeks / months / years between updates so that we can test additional functionality.