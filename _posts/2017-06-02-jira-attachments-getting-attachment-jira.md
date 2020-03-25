---
post_id: 1212
title: 'Jira Attachments: Getting an attachment from a Jira'
date: 2017-06-02T11:24:29+00:00
author: pcon
layout: post
permalink: /2017/06/02/jira-attachments-getting-attachment-jira/
redirect_from:
- /blog/2017/06/02/jira-attachments-getting-attachment-jira/
thumbnail: /assets/img/2017/06/02/post_thumbnail.png
comments: true
dsq_thread_id:
- "5873814317"
categories:
- development
- salesforce
tags:
- apex
---
I previously did [a post](/2016/02/09/jira-attaching-a-file-in-salesforce/) on writing Jira Attachments from Salesforce, and the question has come up of how to write Jira Attachments into Salesforce.  This is actually WAAAAY easier than it was to write attachments out.  The way that the data is structured from the Jira, we can get a list of all the attachments and the link to it's content directly from the Jira GET request.  This makes for way fewer calls to get the actual content of the attachment.

<!--more-->

# Writing Jira Attachments to an object

In the code below, we'll hit a publicly available Jira, get a list of the Jira attachments and then download that data into a Salesforce Attachment.  With this code, we are only getting the first attachment, but this could easily be modified to iterate over each of the Jira attachments and write them out to the parent.  For the use of this example, we'll be hard-coding the parent Id and will not be using authentication.  If you have to use authentication, you can either use the same basic auth from the [previous post](/2016/02/09/jira-attaching-a-file-in-salesforce/), or you can look at [Named Credentials](https://help.salesforce.com/articleView?id=named_credentials_about.htm&type=0) to do this.  Also, I make use of [JSON deserialization](/2015/11/30/json-deserialization-in-salesforce/) here.  Because the Jira contains way more information than I care about, this is a non-strict deserialization and only has the bare minimum data required.

```apex
Id parentId = 'xxxxxxxx';
String jira_host = 'https://jira.atlassian.com';
String issue = 'JRASERVER-65408';

String url = jira_host + '/rest/api/latest/issue/' + issue;

public class Jira_Attachment {
    public String filename;
    public String content;
}

public class Jira_Fields {
    public List<Jira_Attachment> attachment;
}

public class Jira_Issue {
    public String id;
    public String key;
    public Jira_Fields fields;
}

HttpRequest req = new HttpRequest();
req.setMethod('GET');
req.setEndpoint(url);

Http h = new Http();
HttpResponse res = h.send(req);
Jira_Issue i = (Jira_Issue) JSON.deserialize(res.getBody(), Jira_Issue.class);

req.setEndpoint(i.fields.attachment.get(0).content);
res = h.send(req);

Attachment attach = new Attachment();
attach.Body = res.getBodyAsBlob();
attach.Name = i.fields.attachment.get(0).filename;
attach.ParentId = parentId;
insert attach;
```

After running this, we can see that the attachment is written out to our object

![Jira attachments](/assets/img/2017/06/02/jiraAttachments.png)