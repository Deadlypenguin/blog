---
post_id: 356
title: The best feature in Salesforce Summer '14
date: 2014-06-26T16:01:53+00:00
author: pcon
layout: post
permalink: /2014/06/26/best-feature-salesforce-summer-14/
redirect_from:
- /blog/2014/06/26/best-feature-salesforce-summer-14/
categories:
- development
- salesforce
---
Ok, so it might not be the **BEST** feature ever, but it is a feature after my own heart.

If you've ever done anything with pricebooks, you know how painful they can be.  And worst of all how you cannot create a Pricebook2 entry in a test.  This means that you have to pull a Pricebook2 from your orgs data which means you have to enable the dreaded `SeeAllData`.

If you've ever seen my [talk on testing](http://pcon.github.io/presentations/testing/#testing-nonos3), you'll know how much I hate _SeeAllData_.  Not only does it make your tests run slower it means that you're not having a true test.  Well, this is no more in Summer '14.  With this release you should be able to create Pricebook2 entries without _SeeAllData_ to your hearts content!

> You can create price book entries for standard and custom price books in Apex tests.
>
> Previously, you couldn’t create price book entries in an Apex test by default unless the test had access to organization data via the @isTest(SeeAllData=true) annotation. With this new support, you can isolate your price book test data from your organization data. Note that custom price books can be created but standard price books cannot.
>
> Support for test price book entries is added for all tests, including tests that use the default data isolation mode (tests that can’t
> access organization data). With this support, you can do the following.
>
> * Query for the ID of the standard price book in your organization with the Test.getStandardPricebookId() method.
> * Create test price book entries with standard prices by using the standard price book ID that’s returned by Test.getStandardPricebookId().
> * Create test custom price books, which enables you to add price book entries with custom prices

If you want to read more about this and see examples, see page 257 of the [summer release notes](https://help.salesforce.com/help/pdfs/en/salesforce_summer14_release_notes.pdf)