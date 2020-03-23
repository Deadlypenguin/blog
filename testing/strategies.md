---
id: 490
title: Testing Strategies for Salesforce
date: 2015-04-07T20:40:30+00:00
author: pcon
layout: page
permalink: /testing/strategies/
redirect_from:
- /blog/testing/strategies/
---
If you've ever written any Salesforce code, you know that you are required to have a minimum of 75% of your code covered in order to deploy from a sandbox to production.  While I love that this is a requirement, it tends to lead people to writing coverage tests or poor tests in general.  In this article, we will cover some rules you should follow when writing your tests, things you should avoid, how to plan your testing strategies and how to act on those plans.  This article will not cover the actual writing of tests, but that will be covered in another article soon.

# Why Test, and Why Have Testing Strategies?

If you are writing your tests just because you have to have 75% coverage to deploy, then you are writing your tests for all the wrong reasons.  The tests you write should be to ensure that any future changes you make do not break existing functionality, and that your code does what it is suppose to do.  A while ago, we added a WebService to list cases that a Contact was related to.  For this I wrote a bunch of tests that covered the payload and interactions with this list.  Several months after we released this feature I was working on a utility method that this WebService utilized.  I accidentally changed the behavior of this method because I did not realize we were using it.  Fortunately I was able to know very quickly that I broke something because my several of my tests failed.  Had I just covered the lines and not had real tests I would have not known the problem I introduced until it hit production.

# The 5 Testing Commandments

## Only test one bit of functionality at a time

One of the common pitfalls when writing tests is to have a test that covers all of your code in one giant test.  While this may seem like a good idea, it can lead to tests that are hard to debug and even harder to understand why they are failing.  Your tests should cover a small subset of your functionality.

## Generate your testing data in the test

You should never rely on data you did not insert during your test to exist when writing your test.  Generating your test data with a TestUtils class and [@testSetup annotation](https://developer.salesforce.com/releases/release/Spring15/TestClasses) will ensure that the right data exists in your test, and that all of your tests can be run on a developer sandbox with no data.

## Use Test.startTest() and Test.stopTest()

By using these two methods you sandbox your test run inside it's own set of governor limits.  This means that your setup code will not interfere and give you false positives (or negatives) surrounding governor limits.  Also, using _Test.stopTest()_ means that any _@future_ calls will complete so they can be tested.

## Never use no-op AKA null operations to increase coverage

If you've been on the platform for long enough, you've bound to run into this.  No-op or null operations are nonsense code that do nothing, but because they are in your code base and give covered they count toward your coverage percentage.

## Never have tests without asserts

If you have a test without an assert in it, then you might as well not even have a test.  Your code should do **something **and if you're not testing that it actually did that something, then how will you know?  Use _System.assert_ and it's friends to ensure that your code actually does what it's suppose to do.

# Planning your tests

Planning and figuring out what tests you should write can be one of the most daunting things to do for first time developers (regardless of the language).  Most people are just happy that it works and now they have to "waste time" writing tests to prove it works.

For the most part, your tests should fall into one of four categories:

* Positive single test
* Negative single test
* Positive bulk test
* Negative bulk test

## Positive tests

Positive tests are what you get when the code goes exactly as planned.  This exactly what the code you wrote is suppose to do.

## Negative tests

Negative tests are what you get when the code goes completely wrong.  Your negative tests should trip every spot that could go wrong in your code.  This is typically the hardest thing to test for and is often over looked.  However the correct handling when thing go wrong can make all the difference.

## Single tests

Single tests are what we typically think of when we think of user interaction.  This is when a single user inserts, updates, deletes or undeletes a single record.  Typically this is initially tested by hand when verifying that your code works.

## Bulk tests

Bulk tests come in when we want to make sure that we can handle bulk operations such as interacting with data via the Data Loader.  This is often overlooked by developers for reasons like "we'll never have more than one record modified at a time" or "we don't use the Data Loader."  However if bulk tests are not done, and code is not bulk ready then the day that you do have to do work to large number of records can become a nightmare.

# Breaking Down Code Into Testable Parts

One of the things I find helpful when writing tests is to name each of my test methods before I start writing them.  This becomes my test plan.  The naming structure for my methods is

```apex
nameOfMethod_informationAboutTestPath_[in]valid()
```

Each test method name has three parts

1. **nameOfMethod** &#8211; When testing a class this is the name of the individual method I am testing.  If I am testing a trigger, this becomes insert/update/delete/undelete
2. **informationAboutTestPath** &#8211; This is the most flexible method name.  If I am testing that the contact is null, it could be `null_contact`.  If I am testing that we handle getting back 200 results it might be `bulk_return`.
3. **\[in\]valid** &#8211; This is if I'm testing a positive or negative path.  If everything is suppose to work as planned, then it will be `valid`, otherwise `invalid`.

As daunting as it may seem, breaking down code into it's testable parts can be very easy.  Let's look at some code samples and come up with a strategy for testing them.

## A static method

```apex
public static String uppercase(String name) {
    if (name == null) {
        return 'NULL';
    }

    if (name.trim() == '') {
        return 'BLANK';
    }

    return name.toUpperCase();
}
```

This is a fairly straight-forward (if not useless) method.  We take in a string and return the uppercase version of it.  We have some logic to handle the name differently if it's null or blank.  For the above code I would write the following tests:

* **uppercase\_lowercase\_valid** &#8211; This would pass in a name in all lowercase and assert that it was converted to all upper case
* **uppercase\_uppercase\_valid** &#8211; This would pass in a name in all uppercase and assert that it was still all upper case
* **uppercase\_mixcase\_valid** &#8211; This would pass in a name that has mixed cases and assert that it was converted to all upper case
* **uppercase\_null\_valid** &#8211; This would pass in a null name and assert that we got &#8216;NULL' back
* **uppercase\_blank\_valid** &#8211; This would pass in a blank name and assert that we got &#8216;BLANK' back
* **uppercase\_space\_valid** &#8211; This would pass in a name that is nothing but whitespace and assert that we got &#8216;BLANK' back

With these six tests we can assure that all facets of the method are covered, and if a developer were to change the return value (let's say from NULL to Null) our tests would fail and we would know that we either needed to revert the change or ensure that we update the rest of our codebase.

## A trigger

```apex
trigger SkipStatusCalled on Lead (before insert, before update) {
    for (Lead lead : Trigger.new) {
        if (
            lead.Called__c &&
            lead.Status == 'Open - Not Contacted'
        ) {
            lead.Status = 'Working - Contacted'
        }
    }
}
```

In this trigger, we loop through all the leads and if the checkbox _Called__c_ is checked and the _Status _is &#8216;Open &#8211; Not Contacted' we change it to be &#8216;Working &#8211; Contacted'.  For this code I would write the following tests:

* **insert\_single\_notCalled\_open\_valid** &#8211; This would do an insert on a single lead that has not been called but is open and it would assert that the Status was not changed
* **update\_single\_notCalled\_open\_valid** &#8211; This would do an update on a single lead that has not been called but is open and it would assert that the Status was not changed
* **insert\_single\_called\_open\_valid** &#8211; This would do an insert on a single lead that has been called and is open.  It would assert that the Status was changed to working.
* **update\_single\_called\_open\_valid** &#8211; This would update a lead that is open and change the called checkbox to true.  It would assert the Status was changed to working.
* **update\_single\_called\_notOpen\_valid** &#8211; This would update a lead that is not open and change the called checkbox to true.  It would assert that the Status was not changed.
* **insert\_bulk\_valid** &#8211; This would insert a combination of leads with various combinations of called and statuses.  It would assert that the status for each lead was changed appropriately.
* **update\_bulk\_valid** &#8211; This would update a combination of leads with various combinations of called and statuses.  It would assert that the status for each lead was changed appropriately.