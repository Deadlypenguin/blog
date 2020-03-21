---
post_id: 754
title: 'Amazon S3: Attaching a File in Salesforce'
date: 2016-02-16T17:56:25+00:00
author: pcon
layout: post
permalink: /2016/02/16/amazon-s3-attaching-a-file-in-salesforce/
thumbnail: /assets/img/2016/02/16/post_thumbnail.png
redirect_from:
- /blog/2016/02/16/amazon-s3-attaching-a-file-in-salesforce/
dsq_thread_id:
- "4585363274"
categories:
- development
- salesforce
tags:
- amazon
- apex
---
Last week I covered how to send an attachment from [Salesforce to Jira](http://blog.deadlypenguin.com/blog/2016/02/09/jira-attaching-a-file-in-salesforce/).  This week we'll cover how to attach a file from Salesforce into the [Amazons S3](https://aws.amazon.com/s3/) cloud.  Unlike the Jira uploading, we will not be associating these files with a specific case, but instead will be uploading them to a generic bucket.  This can be modified by changing how the filename is generated on line 8 of the code.

<!--more-->

```java
Attachment attach = [
    select Body,
        ContentType,
        Name
    from Attachment
    limit 1
];

String attachmentBody = EncodingUtil.base64Encode(attach.Body);
String formattedDateString = Datetime.now().formatGMT('EEE, dd MMM yyyy HH:mm:ss z');
String key = 'key_goes_here';
String secret = 'secret_goes_here';
String bucketname = 'mybucket-salesforce';
String host = 's3-us-west-2.amazonaws.com';
String method = 'PUT';
String filename = attach.Id + '-' + attach.Name;

HttpRequest req = new HttpRequest();
req.setMethod(method);
req.setEndpoint('https://' + bucketname + '.' + host + '/' + bucketname + '/' + filename);
req.setHeader('Host', bucketname + '.' + host);
req.setHeader('Content-Length', String.valueOf(attachmentBody.length()));
req.setHeader('Content-Encoding', 'UTF-8');
req.setHeader('Content-type', attach.ContentType);
req.setHeader('Connection', 'keep-alive');
req.setHeader('Date', formattedDateString);
req.setHeader('ACL', 'public-read');
req.setBody(attachmentBody);

String stringToSign = 'PUT\n\n' +
    attach.ContentType + '\n' +
    formattedDateString + '\n' +
    '/' + bucketname + '/' + bucketname + '/' + filename;

String encodedStringToSign = EncodingUtil.urlEncode(stringToSign, 'UTF-8');
Blob mac = Crypto.generateMac('HMACSHA1', blob.valueof(stringToSign),blob.valueof(secret));
String signed = EncodingUtil.base64Encode(mac);
String authHeader = 'AWS' + ' ' + key + ':' + signed;
req.setHeader('Authorization',authHeader);
String decoded = EncodingUtil.urlDecode(encodedStringToSign , 'UTF-8');

Http http = new Http();
HTTPResponse res = http.send(req);
System.debug('*Resp:' + String.ValueOF(res.getBody()));
System.debug('RESPONSE STRING: ' + res.toString());
System.debug('RESPONSE STATUS: ' + res.getStatus());
System.debug('STATUS_CODE: ' + res.getStatusCode());
```

Most of this code is pretty standard web callouts but the key takeaways are:

* Line 9: The attachment body is base64 encoded
* Line 11-14: Our Amazon credential and host information
* Line 16: The filename (more on that below)
* Line 19: Where we are POSTing our attachment to
* Line 20-26: The required headers
* Line 19-38: The signing of the request to send to Amazon

The filename here is particularly important.  Amazon S3 is closer to a filesystem than how Salesforce records attachments.  If you POST the same filename to S3 multiple times, you will simply overwrite the file every time you POST.  This **may** be a desired result, but for the example above, we are creating a unique (and reproducible) attachment filename.  From this we could simply add a formula on the Attachment record that generate our Amazon S3 URL and then use that for display purposes.

# Amazon S3: Why use it?

Being able to do this is all fine an dandy, but why use it over the standard Salesforce Attachments?  The biggest reason is that Amazon offers a better Content Delivery Network (CDN) for the Amazon S3 content than Salesforce does for it's attachments.  If you had a Salesforce Site that you wanted to share attachment records, this would make your attachments load much faster for users around the world.

Additionally, you could re-use the code above and instead of storing the data in the Attachment object, simply upload directly from a Visualforce page to Amazon S3 and then store the URL somewhere for future use.