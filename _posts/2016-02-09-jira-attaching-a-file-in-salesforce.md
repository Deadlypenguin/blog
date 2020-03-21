---
post_id: 783
title: 'Jira: Attaching a File in Salesforce'
date: 2016-02-09T11:12:49+00:00
author: pcon
layout: post
permalink: /2016/02/09/jira-attaching-a-file-in-salesforce/
thumbnail: /assets/img/2016/02/09/post_thumbnail.png
redirect_from:
- /blog/2016/02/09/jira-attaching-a-file-in-salesforce/
dsq_thread_id:
- "4564810668"
categories:
- development
- salesforce
tags:
- apex
- jira
---
I was recently challenged with the task of sending an attachment from Salesforce to [Jira](https://www.atlassian.com/software/jira).  Looking over [the documentation](https://confluence.atlassian.com/display/JIRAKB/How+to+attach+an+attachment+in+a+JIRA+issue+using+REST+API), this doesn't appear to be too hard.  The toughest part is that Jira wants a multi-part form upload for the attachments and this can be a bit of a headache to do in Apex.  Following [this post](http://blog.enree.co/2013/01/salesforce-apex-post-mutipartform-data.html) as a guide for multi-part form upload, we can adapt it to the format that Jira expects.

<!--more-->

```java
String username = 'admin';
String password = 'password';
String jira_host = 'https://host.atlassian.net';
String issue = 'DEVBOARDS-1';
Attachment attach = [select Name, Body from Attachment limit 1];

Blob file_body = attach.Body;
String file_name = attach.Name;

String auth_header = 'Basic ' + EncodingUtil.base64Encode(Blob.valueOf(username + ':' + password));

String url = jira_host + '/rest/api/2/issue/' + issue + '/attachments';
String boundary = '----------------------------741e90d31eff';
String header = '--' + boundary + '\n' +
    'Content-Disposition: form-data; name="file"; filename="' + file_name + '";\n' +
    'Content-Type: application/octet-stream';

String footer = '--' + boundary + '--';
String headerEncoded = EncodingUtil.base64Encode(Blob.valueOf(header + '\r\n\r\n'));
while (headerEncoded.endsWith('=')) {
    header += ' ';
    headerEncoded = EncodingUtil.base64Encode(Blob.valueOf(header+'\r\n\r\n'));
}

String bodyEncoded = EncodingUtil.base64Encode(file_body);

Blob bodyBlob = null;
String last4Bytes = bodyEncoded.substring(bodyEncoded.length()-4,bodyEncoded.length());

if (last4Bytes.endsWith('==')) {
    last4Bytes = last4Bytes.substring(0, 2) + '0K';
    bodyEncoded = bodyEncoded.substring(0, bodyEncoded.length() - 4) + last4Bytes;

    String footerEncoded = EncodingUtil.base64Encode(Blob.valueOf(footer));
    bodyBlob = EncodingUtil.base64Decode(headerEncoded + bodyEncoded + footerEncoded);
} else if (last4Bytes.endsWith('=')) {
    last4Bytes = last4Bytes.substring(0, 3) + 'N';
    bodyEncoded = bodyEncoded.substring(0, bodyEncoded.length() - 4) + last4Bytes;
    footer = '\n' + footer;
    String footerEncoded = EncodingUtil.base64Encode(Blob.valueOf(footer));
    bodyBlob = EncodingUtil.base64Decode(headerEncoded + bodyEncoded + footerEncoded);
} else {
    footer = '\r\n' + footer;
    String footerEncoded = EncodingUtil.base64Encode(Blob.valueOf(footer));
    bodyBlob = EncodingUtil.base64Decode(headerEncoded + bodyEncoded + footerEncoded);
}

HttpRequest req = new HttpRequest();
req.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
req.setHeader('Authorization', auth_header);
req.setHeader('X-Atlassian-Token', 'nocheck');
req.setMethod('POST');
req.setEndpoint(url);
req.setBodyAsBlob(bodyBlob);
req.setTimeout(120000);

Http h = new Http();
HTTPResponse res = h.send(req);
```

Most of the code above is pretty standard fair for multi-part upload.  The parts that we really care about for the Jira upload are as follows:

* Line 3: Our externally facing Jira hostname
* Line 4: The issue we are adding the attachment to
* Line 5: The attachment we are adding (in this example, I just selected a random attachment.  In real life, you'd want to make this a little more precise)
* Line 12: The url that we need to POST to
* Line 50: Tell Jira that we do not need to check the Atlassian Token

The biggest part of this is defining and using the boundary to show wrap the attachment and it's data.