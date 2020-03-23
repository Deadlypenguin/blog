---
post_id: 182
title: Classifying Triggers in Salesforce
date: 2012-02-13T18:39:45+00:00
author: pcon
layout: post
permalink: /2012/02/13/classifying-triggers-in-salesforce/
redirect_from:
- /blog/2012/02/13/classifying-triggers-in-salesforce/
dsq_thread_id:
- "1800183014"
categories:
- development
- salesforce
tags:
- apex
- trigger
---
Anyone that has ever had multiple triggers on objects in Salesforce knows that it can be very painful to manage them.  Because of the way Salesforce chooses to run the triggers your code can be run in a non-deterministic order.  In addition to this, having to sort through multiple files to find the one piece of code you are looking to update can be painful.

To combat this, you can take your triggers and condense them down into a single trigger and a single class.  Inside this class you would have a method containing each of your individual triggers.

## Preface

In the examples below we will be creating a trigger on the MyObject__c to do awesomeness.  In the example we do not cover the case of undelete.

## The Trigger

The trigger is quite simple, all it does is call the a static method of the class with the correct parameters.

```apex
trigger MyObject on MyObject__c (before insert, before update, before delete, after insert, after update, after delete) {
     MyObjectTrigger.processTrigger(Trigger.oldMap, Trigger.new, Trigger.isBefore);
}
```

## The Class

This is where the meat of the functionality exists.  The constructor sets up the maps and lists as well as the booleans.  Inside your _doAwesomeness_ method you can check to the booleans _isUpdate, isDelete, isInsert_ to make your routing determination.  If you do not want the method to run, just return out of it and the execution will stop.

```apex
public class MyObjectTrigger {
     private final Map<Id, MyObject__c> oldMap;
     private final Map<Id, MyObject__c> newMap;
     private final List<MyObject__c> newObjs;
     private final Boolean isInsert;
     private final Boolean isUpdate;
     private final Boolean isDelete;
     private final Boolean isBulk;

     /**
     * The constructor
     *
     * @param xoldMap The old map from the trigger
     * @param xnewObj The list of new objects from the trigger
     * @param isBefore If the trigger is in before or after
     */
     public MyObjectTrigger(Map<Id, MyObject__c> xoldMap, List<MyObject__c> xnewObjs, Boolean isBefore) {
          oldMap = xoldMap;
          newObjs = xnewObjs;

          if (!isBefore && newObjs != null) {
               newMap = new Map<Id, MyObject__c>(newObjs);
          }

          isDelete = (((newObjs == null || newObjs.isEmpty()) && isBefore) || ((newMap == null || newMap.isEmpty()) && !isBefore));
          isUpdate = ! (isDelete || oldMap == null || oldMap.isEmpty());
          isInsert = ! (isDelete || isUpdate);
          isBulk = (((!isDelete) && (newObjs.size() > 1)) || ((isDelete) && (oldMap.size() > 1)));
     }

     public void doAwesomeness() {
          //Do stuff
     }

    /**
    * Method to initiate trigger logic
    *
    * @param oldMap The old map from the trigger
    * @param newObj The list of new objects from the trigger
    * @param isBefore If the trigger is in before or after
    */
     public static void processTrigger(Map<Id, MyObject__c> oldMap, List<MyObject__c> newObj, Boolean isBefore) {
          final MyObjectTrigger myTrigger = new MyObjectTrigger(oldMap, newObj, isBefore);

          if (isBefore) {
               myTrigger.doAwesomeness();
          }
     }
}
```

## Conclusion

We've been using this method for almost a year now and it works really well.  If you need data to persist between methods this way works wonderfully.   Just create a global variable and set it up in your constructor.  This will save you SOQL calls and if done correctly could save you DML operations