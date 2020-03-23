---
post_id: 747
title: List of objects for POST in Apex REST
date: 2016-11-29T08:00:04+00:00
author: pcon
layout: post
permalink: /2016/11/29/list-objects-apex-rest/
redirect_from:
- /blog/2016/11/29/list-objects-apex-rest/
dsq_thread_id:
- "5334065830"
categories:
- development
- salesforce
tags:
- apex
- rest
---
A while ago, someone posted on the developer boards a question about how to bulk create tasks for contacts via REST.  I thought it was an interesting enough problem to cover how to do it and how to format the data correctly to use it.

# Prerequisite

Before we can bulk create tasks for a contact, we need to know how to identify those contacts.  To do this, I create an unique external Id field called _External\_Id\_\_c_.  As long as your contacts are uniquely identifiable then it doesn't matter what field you use.  For this example I have two contacts under different accounts "Andy Young" with an external Id of "ayoung" and "Edna Frank" with an external Id of "efrank"

<!--more-->

# REST Endpoint

Now that our backing data has been updated let's look at our endpoint and break it down

## Incoming Data Structure

```apex
global class TaskWrapper {
    public String subject;
    public String priority;
    public String status;
    public String externalId;

    private transient Contact con;

    public Task getTask() {
        this.con = [
            select AccountId
            from Contact
            where External_Id__c = :this.externalId
        ];

        return new Task(
            Subject = this.subject,
            Priority = this.priority,
            Status = this.status,
            WhatId = con.AccountId,
            WhoId = con.Id
        );
    }
}
```

This wrapper class contains all the data we need to create our task.  The helper method _getTask_ will generate a new task object that we can insert in our body.

<div class="callout warning">This is not the most optimal way to do this since you will be doing SOQL inside a loop.  This is just a quick example.  The optimal way would be to move the contact fetching outside the loop before task creation and use that to lookup the external Id to get the contact.</div>

## The POST Method

```apex
@HttpPost
global static List<Id> doPost(List<TaskWrapper> tasks) {
    List<Task> tasksToInsert = new List<Task>();

    for (TaskWrapper task : tasks) {
        tasksToInsert.add(task.getTask());
    }

    insert tasksToInsert;

    Map<Id, Task> taskMap = new Map<Id, Task>(tasksToInsert);
    return new List<Id>(taskMap.keySet());
}
```

This method iterates through all of our inbound tasks, adds them to the list and inserts them.  Again, this isn't the way I would release it to production but it show how it can be done.  The entire class be seen [here](https://github.com/pcon/SalesforceApps/blob/master/bulktask/TaskInsertWebServices.cls).

# JSON Data

Now that we have our endpoint, we need to throw some data at it.  The data structure will start with a base element of "tasks" since that's what the variable name is to our _doPost_ method.  Since it's a list, the "tasks" element will be an array.  Then each entry in that array is going to a TaskWrapper with all of it's elements

```json
{
    "tasks": [
        {
            "subject": "Edna's task",
            "priority": "High",
            "status": "Not Started",
            "externalId": "efrank"
        }, {
            "subject": "Andy's task",
            "priority": "Low",
            "status": "In Progress",
            "externalId": "ayoung"
        }
    ]
}
```

# Calling the Endpoint

Of course how you call this endpoint will change depending on your implementation, but the simplest way to test it us by using cURL.

```bash
curl -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SESSION_ID" \
    -d @/path/to/data.json
    https://XXX.salesforce.com/services/apexrest/TaskInsert/
```

From this we'll get back an array of Ids to use however we want.

```json
[
    "00T36000013wzEzEAI",
    "00T36000013wzF0EAI"
]
```