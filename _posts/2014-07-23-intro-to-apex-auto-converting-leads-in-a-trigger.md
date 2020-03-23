---
post_id: 369
title: 'Intro to Apex: Auto converting leads in a trigger'
date: 2014-07-23T11:12:18+00:00
author: pcon
layout: post
permalink: /2014/07/23/intro-to-apex-auto-converting-leads-in-a-trigger/
redirect_from:
- /blog/2014/07/23/intro-to-apex-auto-converting-leads-in-a-trigger/
dsq_thread_id:
- "3310437126"
categories:
- development
- salesforce
tags:
- apex
---
Over the past couple of weeks I have seen several posts on the [developer forums](https://developer.salesforce.com/forums/) about writing a trigger to auto convert leads based on some criteria.  Since this seems to be a pretty common topic, I thought I'd turn it into my first "Intro to Apex" blog post.  In this post I am going to introduce a trigger that converts a lead and the test for this trigger.  I am going then break down each line of the trigger and explain what it does and why it is there.

_NOTE: This is a very basic trigger.  If this were to be used in an environment where there was more than just this functionality in the trigger, I would [classify this trigger](/2012/02/13/classifying-triggers-in-salesforce/ "Classifying Triggers in Salesforce") to control the order of operations._
<!--more-->

## The Requirements

For this example, we have a custom Text field on the Lead object called _WebForm_ that we can see on the Lead Fields page that it's API Name is _WebForm__c_ that is what we will use while referencing it in the trigger.  Our requirements are that when a lead is inserted with the _WebForm_ field equaling "Free Trial" we should auto convert the lead.

## The Trigger

```apex
trigger AutoConverter on Lead (after insert) {
     LeadStatus convertStatus = [
          select MasterLabel
          from LeadStatus
          where IsConverted = true
          limit 1
     ];
     List<Database.LeadConvert> leadConverts = new List<Database.LeadConvert>();

     for (Lead lead: Trigger.new) {
          if (!lead.isConverted && lead.WebForm__c == 'Free Trial') {
               Database.LeadConvert lc = new Database.LeadConvert();
               String oppName = lead.Name;

               lc.setLeadId(lead.Id);
               lc.setOpportunityName(oppName);
               lc.setConvertedStatus(convertStatus.MasterLabel);

               leadConverts.add(lc);
          }
     }

     if (!leadConverts.isEmpty()) {
          List<Database.LeadConvertResult> lcr = Database.convertLead(leadConverts);
     }
}
```

## Trigger Breakdown

**Line 1**

```apex
Trigger AutoConverter on Lead (after insert) {<
```

Here we declare our trigger. We give it a name of `AutoConverter` and we say that the trigger is on the `Lead` object.  We then say that it will act only after an insert has occurred.

**Line 2-7**

```apex
LeadStatus convertStatus = [
  select MasterLabel
  from LeadStatus
  where IsConverted = true
  limit 1
];
```

On these lines we make a <a href="http://www.salesforce.com/us/developer/docs/dbcom_soql_sosl/Content/sforce_api_calls_soql_relationships.htm">SOQL</a> call to fetch the `LeadStatus` object that coincides with the conversion criteria

**Line 8**

```apex
List<Database.LeadConvert> leadConverts = new List<Database.LeadConvert>();
```

Since we want to make sure our trigger handles bulk insertion of data, we need to have a place to store all of the leads we need to convert.  To do this we declare a variable that is a list of `Database.LeadConvert` objects.  At this time, it is an empty list.

**Line 10**

```apex
for (Lead lead: Trigger.new) {
```

This is the start of our for loop.  Here we will loop through ever newly created lead in our new list (`Trigger.new`), assign it to a temporary variable `lead` and start our work.  We do this in a for loop to make it so that we can handle bulk inserts.

**Line 11**

```apex
if (!lead.isConverted && lead.WebForm__c == 'Free Trial') {
```

Here is where we check our business logic and check to see if the lead should be converted.  The first part of this if statement says if the lead is not (!) converted and (&&) the `WebForm__c` equals (==) `Free Trial` then we continue on to lines 12-19.  If the lead had already been converted or the `WebForm__c` field did not equal `Free Trial` our code would have jumped to line 20, and then continued on with the next new lead

**Line 12**

```apex
Database.LeadConvert lc = new Database.LeadConvert();
```

We create a new `Database.LeadConvert` object that we will use to convert later

**Line 13**

```apex
String oppName = lead.Name;
```

We create a new String variable that holds the lead name that we will be using for the opportunity's name.

**Line 15**

```apex
lc.setLeadId(lead.Id);
```

We set the lead id on the lead convert (lc) variable

**Line 16**

```apex
lc.setOpportunityName(oppName);
```

We set the opportunity name on the lead convert (lc) variable

**Line 17**

```apex
lc.setConvertedStatus(convertStatus.MasterLabel);
```

We set the converted status of the lead to the `MasterLabel` field on our LeadStatus object from lines 2-7 on the lead convert (lc) variable

**Line 19**

```apex
leadConverts.add(lc);
```

Now that we have a completely filled out `Database.LeadConvert` object we add it tor our `leadConverts`  list

**Line 20**

```apex
}
```

This is the closing brace for our if statement

**Line 21**

```apex
}
```

This is the closing brace for our for loop.  At this point if there are any more new leads for us to process, we will go back to line 10 and repeat with the next lead

**Line 23**

```apex
if (!leadConverts.isEmpty()) {
```

Here we check to see if we have actually added any leads for us to convert.  If we had skipped lines 12-19 because line 11 was false, we would still have an empty `leadConverts` list.  We do this because we do not want to waste any DML operations if we do not have to.

**Line 24**

```apex
List<Database.LeadConvertResult> lcr = Database.convertLead(leadConverts);
```

Here we assign a list of `Database.LeadConvertResult` objects (lcr) that are returned from our Database.convertLead call.  We pass our list of `leadConverts` to the method.  This method automatically convert our qualifying leads into new Opportunities with the same name as our lead.

**Line 25**

```apex
}
```

This is the closing brace of our second if statement

**Line 26**

```apex
}
```

This is the closing brace of our trigger

## The Tests

Now, partially because we have to, and partially because we want to be good developers we need to write tests to cover our trigger.  Now we could do somethings that are [cheating](http://pcon.github.io/presentations/testing/#testing-nonos3) but doing those just hurt you in the long run.  What we want to do is to write tests that mimic how our user is going to interact with the system and verify that our trigger does what we want it to do.  For this we will do three tests:

**Trial Convert:** This test is a positive test of what our trigger should do.  We will create a trial lead, insert the data and verify that it changed

**Non-trial Convert:** This test is a negative test of what our trigger should do.  We will create a non-trial lead, insert the data and verify that it did not change

**Bulk Test:** This is an advanced test that can be kind of tricky to think about. We will create a bunch of leads (half trial, half non-trial) and insert them all at once, then verify that the ones that should have changed did

```apex
@IsTest
private class AutoConverter_Test {
    private static Integer LEAD_COUNT = 0;

    private static Lead createLead() {
        LEAD_COUNT += 1;
        return new Lead(
            FirstName = '_unittest_firstname_: ' + LEAD_COUNT,
            LastName = '_unittest_lastname_: ' + LEAD_COUNT,
            Company = '_unittest_company_: ' + LEAD_COUNT,
            Status = 'Inquiry',
            WebForm__c = 'Not Free Trial'
        );
    }

    public static void makeFreeTrial(Lead lead) {
        lead.WebForm__c = 'Free Trial';
    }

    public static List<Lead> fetchLeads(Set<Id> ids) {
        return [
            select isConverted
            from Lead
            where Id in :ids
        ];
    }

    public static testMethod void trialConvert() {
        Lead testLead = createLead();
        makeFreeTrial(testLead);

        Test.startTest();

        insert testLead;

        Test.stopTest();

        List<Lead> results = fetchLeads(new Set<Id>{testLead.Id});

        System.assertEquals(1, results.size(), 'Did not get the right number of leads back');
        System.assert(results.get(0).isConverted, 'The lead should have been converted since it was a "Free Trail"');
    }

    public static testMethod void nonTrialNoConvert() {
        Lead testLead = createLead();

        Test.startTest();

        insert testLead;

        Test.stopTest();

        List<Lead> results = fetchLeads(new Set<Id>{testLead.Id});

        System.assertEquals(1, results.size(), 'Did not get the right number of leads back');
        System.assert(!results.get(0).isConverted, 'The lead should not have been converted since it was not a "Free Trail"');
    }

    public static testMethod void bulkTest() {
        List<Lead> shouldBeConverted = new List<Lead>();
        List<Lead> shouldNotBeConverted = new List<Lead>();

        for (Integer i = 0; i < 50; i++) {
            Lead testLeadNonConvert = createLead();
            Lead testLeadConvert = createLead();
            makeFreeTrial(testLeadConvert);

            shouldBeConverted.add(testLeadConvert);
            shouldNotBeConverted.add(testLeadNonConvert);
        }

        List<Lead> toInsert = new List<Lead>();
        toInsert.addAll(shouldBeConverted);
        toInsert.addAll(shouldNotBeConverted);

        Test.startTest();

        insert toInsert;

        Test.stopTest();

        Map<Id, Lead> expectedConversions = new Map<Id, Lead>(shouldBeConverted);
        Map<Id, Lead> expectedNonConversions = new Map<Id, Lead>(shouldNotBeConverted);

        Set<Id> leadIds = new Set<Id>();
        leadIds.addAll(expectedConversions.keySet());
        leadIds.addAll(expectedNonConversions.keySet());

        for (Lead result: fetchLeads(leadIds)) {
            if (expectedConversions.containsKey(result.Id)) {
                System.assert(result.isConverted, 'This lead should have been converted ' + result);
                expectedConversions.remove(result.Id);
            } else if (expectedNonConversions.containsKey(result.Id)) {
                System.assert(!result.isConverted, 'This lead should not have been converted ' + result);
                expectedNonConversions.remove(result.Id);
            } else {
                System.assert(false, 'We got a Lead we did not expect to get back ' + result);
            }
        }

        System.assert(expectedConversions.isEmpty(), 'We did not get back all the converted leads we expected');
        System.assert(expectedNonConversions.isEmpty(), 'We did not get back all the non converted leads we expected');
    }
}
```

## Tests Breakdown

For simplicity sake I will skip the closing braces for these methods, and will skip some redundant lines that appear in multiple tests

**Line 1**

```apex
@IsTest
```

Here we say that this entire class is a test class

**Line 2**

```apex
private class AutoConverter_Test {
```

We then declare our test class and call it _AutoConverter_Test_

**Line 3**

```apex
private static Integer LEAD_COUNT = 0;
```

This variable is an static Integer, which means it will keep it's value as it's changed across a single test run.  We will be using it to generate a unique (and trackable) name for our test data.  This is important because there are lots of fields (like Name) that must be unique across all records.

**Line 5**

```apex
private static Lead createLead() {
```

This defines our _createLead_ method. We will use this method in our tests to generate test data and return a new Lead object.  I would recommend that you move this type of logic to a separate class (such as [TestUtils](http://pcon.github.io/presentations/testing/#testutils-list3)) so that you can re-use it for all of your tests, not just for a single test class.

**Line 6**

```apex
LEAD_COUNT += 1;
```

Here we increment our current lead count.  The more times we call _createLead_ the higher this number will get.

**Line 7-13**

```apex
return new Lead(
     FirstName = '_unittest_firstname_: ' + LEAD_COUNT,
     LastName = '_unittest_lastname_: ' + LEAD_COUNT,
     Company = '_unittest_company_: ' + LEAD_COUNT,
     Status = 'Inquiry',
     WebForm__c = 'Not Free Trial'
);
```

These lines create a test Lead object and return it. Here we create dummy data that has our _LEAD_COUNT_ variable added to it.  This could help us if we needed to determine why a test was failing.  We could know which Lead (if we had multiples) was causing an issue.

**Line 16**

```apex
public static void makeFreeTrial(Lead lead) {
```

This defines our _makeFreeTrial_ method.  It takes in a Lead object named _lead_ that we will update. This method will update our Lead and make it have the criteria we defined in our business logic that defines a "Free Trial"

**Line 17**

```apex
lead.WebForm__c = 'Free Trial';
```

We update the _WebForm__c_ field and change it to "Free Trial"  _CompSci note: Since this passed to us by reference we just need to set the field and it will be updated on the object_

**Line 20**

```apex
public static List<Lead> fetchLeads(Set<Id> ids) {
```

This defines our _fetchLeads_ method. It takes in a Set of Id objects named _ids_ that we will use to find our Leads.

**Line 21-25**

```apex
return [
     select isConverted
     from Lead
     where Id in :ids
];
```

This returns the results from our SOQL query.  This query fetches the _isConverted_ field on the Lead where that Lead's id is in the set of ids that we were passed in.

**Line 28**

```apex
public static testMethod void trialConvert() {
```

This is our first test method called _trialConvert_

**Line 29**

```apex
Lead testLead = createLead();
```

We create our _testLead_ by calling the _createLead_ method declared on Line 5

**Line 30**

```apex
makeFreeTrial(testLead);
```

We now take our _lead_ and update it to be a free trial

**Line 32**

```apex
Test.startTest();
```

This line we tell Salesforce that we are starting our test.  At this point we start with all new governor limits.  It is very important that you only wrap the parts of your tests that are actually doing the work (ie not setup/verification) in _Test.StartTest();_ and _Test.StopTest();_ to properly test that your code will not encounter any governor limits.

**Line 34**

```apex
insert testLead;
```

We insert our _lead_

**Line 36**

```apex
Test.stopTest();
```

We tell Salesforce that we are no longer in our test section

**Line 38**

```apex
List<Lead> results = fetchLeads(new Set<Id>{testLead.Id});
```

We get a List of leads for our set of ids.  In this instance we are only passing in a single Id (generating a new Set inline).  We use the method built for bulk so that we do not have to generate code that overlaps in functionality.

**Line 40**

```apex
System.assertEquals(1, results.size(), 'Did not get the right number of leads back');
```

Our first true "test" in our test class. Here we assert that the number of results we get back from _fetchLeads_ is equal to 1.  If we did not get that back then we will display the message "Did not get the right number of leads back."  The order of these parameters is important, because it will affect the way that it is displayed if it fails.  The order is Expected, Actual, Message.

**Line 41**

```apex
System.assert(results.get(0).isConverted, 'The lead should have been converted since it was a "Free Trail"');
```

Since we know we have only one result coming back we verify that the Boolean field _isConverted_ is equal to true on the first (0 index) result from our list.  If it is not then we display the error message "The lead should have been converted since it was a "Free Trial"."  Here we use just _assert_ since we are looking at a Boolean value and have nothing to compare it to.

**Line 44**

```apex
public static testMethod void nonTrialNoConvert() {
```

This is our negative test _nonTrialNoConvert_

**Line 45**

```apex
Lead testLead = createLead();
```

We get our new test lead.  Unlike before, we will not make it a "Free Trial" to test that it does not auto-convert.

**Line 49**

```apex
insert testLead;
```

We insert our lead between our Start and StopTest calls

**Line 53**

```apex
List<Lead> results = fetchLeads(new Set<Id>{testLead.Id});
```

We fetch the leads we just inserted

**Line 56**

```apex
System.assert(!results.get(0).isConverted, 'The lead should not have been converted since it was not a "Free Trail"');
```

Here we assert that the first record (index 0) is not (!) converted.  If it was converted we would see the error message "The lead should not have been converted since it was not a "Free Trial"."

**Line 59**

```apex
public static testMethod void bulkTest() {
```

This is our _bulkTest_. This test is a bit tricky, so don't be discouraged if it doesn't make immediate sense.  We do this test to assure that if we do large data inserts (think DataLoader) we do not fail.

**Line 60**

```apex
List<Lead> shouldBeConverted = new List<Lead>>();
```

We generate a new empty list of Leads that will be ones that should be converted

**Line 61**

```apex
List<Lead> shouldNotBeConverted = new List<Lead>();
```

We generate a new empty list of Leads that will be ones that should **not** be converted

**Line 63**

```apex
for (Integer i = 0; i < 50; i++) {
```

Here we loop through 50 integers (0-49) and assign them to the variable i.  Once this is complete we will have a total of 100 leads (2 leads x 50 iterations) to insert at one time.

**Line 64**

```apex
Lead testLeadNonConvert = createLead();
```

We create a new lead called _testLeadNoConvert _this will remain a non free trial lead and should not be converted

**Line 65**

```apex
Lead testLeadConvert = createLead();
```

We create a new lead called _testLeadConvert_ this will be made a "Free Trial" and should be converted later

**Line 66**

```apex
makeFreeTrial(testLeadConvert);
```

Make our _testLeadConvert_ lead a "Free Trial" lead

**Line 68-69**

```apex
shouldBeConverted.add(testLeadConvert);
shouldNotBeConverted.add(testLeadNonConvert);
```

Add the leads to their respective lists

**Line 72**

```apex
List toInsert = new List();
```

Create a new list of all the leads we are going to insert

**Line 73-74**

```apex
toInsert.addAll(shouldBeConverted);
toInsert.addAll(shouldNotBeConverted);
```

Add both our _shouldBeConverted_ and _shouldNotBeConverted_ lists together to form one big list of leads _toInsert_

**Line 78**

```apex
insert toInsert;
```

Insert all the leads we generated

**Line 82-83**

```apex
Map<Id, Lead> expectedConversions = new Map<Id, Lead>(shouldBeConverted);
Map<Id, Lead> expectedNonConversions = new Map<Id, Lead>(shouldNotBeConverted);
```

Generate a map of Ids to Leads for both our _expectedConversions_ and our _expectedNonConversions._ This part is a bit tricky.  We need a way to know a couple of things:

1. Which lead goes in which bucket
2. That the leads we get back are ones we expect
3. That we get back all the leads we do expect
4. A quick way to generate a set of all the lead ids

By using a map this way, we can do all these things.

<div class="notification is-info is-light">This instantiation of map by passing in a List of sObjects will only generate a Map of the object's Id to that object.  It will <b>not</b> generate a map of other ids on the object to that object</div>

**Line 85**

```apex
Set<Id> leadIds = new Set<Id>();
```

Create a Set of ids that will contain all of the Ids from the Leads we just inserted

**Line 86-87**

```apex
leadIds.addAll(expectedConversions.keySet());
leadIds.addAll(expectedNonConversions.keySet());
```

Add the _keySet_ of each of the two maps we created on lines 82-83.  This will leave us with all the Ids of our newly inserted leads

**Line 89**

```apex
for (Lead result: fetchLeads(leadIds)) {
```

Here we loop through all the leads that have an Id in our set.  We loop over each lead from _fetchLeads_ and store it in the variable _result_ to use inside the loop

**Line 90**

```apex
if (expectedConversions.containsKey(result.Id)) {
```

We check to see if our _expectedConversions_ map contains the id of _result_ in it's key list.  If it does then we continue on inside the if statement.  If not, we jump to line 93

**Line 91**

```apex
System.assert(result.isConverted, 'This lead should have been converted ' + result);
```

Here we assert that the lead has in-fact been converted.  If it was not we would display the error message.

**Line 92**

```apex
expectedConversions.remove(result.Id);
```

We then remove the lead from the map.  We do this so that if for some reason we got it multiple times back we would fail because we should only get it back once.

<div class="notification is-info is-light">This is not a big issue in this particular test because we are dealing with Ids and they are forced to be unique by Salesforce.  This methodology becomes more important if the resulting data is being keyed off of some data that is not forced to be unique.</div>

**Line 93**

```apex
} else if (expectedNonConversions.containsKey(result.Id)) {
```

If the first _if_ statement returned false then we see if our lead's id is the _expectedNonConversions_ map.  If it is we continue on, if it's not then we jump to line 96

**Line 94**

```apex
System.assert(!result.isConverted, 'This lead should not have been converted ' + result);
```

Here we assert that the lead has **not** been converted.  If it was converted we display the error message

**Line 95**

```apex
expectedNonConversions.remove(result.Id);
```

We then remove the lead from the expected map

**Line 96**

```apex
} else {
```

If neither of the first _if_ statements evaluated to true then we come here last

**Line 97**

```apex
System.assert(false, 'We got a Lead we did not expect to get back ' + result);
```

If we've gotten to this point then we have gotten back data that we should not have gotten back.  So we want to fail the test and alert that we got back data we should not have.  Here we do a _System.assert(false, &#8216;&#8230;')_ which will always fail the test.

**Line 101**

```apex
System.assert(expectedConversions.isEmpty(), 'We did not get back all the converted leads we expected');
```

Lastly we check to make sure that we got back all of the _expectedConversions.  _If we did, then the map will be empty

**Line 102**

```apex
System.assert(expectedNonConversions.isEmpty(), 'We did not get back all the non converted leads we expected');
```

Lastly we check to make sure that we got back all of the _expectedNonConversions_. If we did, then the map will be empty