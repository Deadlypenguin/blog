---
post_id: 689
title: 'Email Reference Id: Winter 16 Changes'
date: 2015-10-12T20:33:26+00:00
author: pcon
layout: post
permalink: /2015/10/12/email-reference-id-winter-16-changes/
redirect_from:
- /blog/2015/10/12/email-reference-id-winter-16-changes/
dsq_thread_id:
- "4219518871"
dsq_needs_sync:
- "1"
categories:
- development
- salesforce
tags:
- apex
- email
---
In the latest Salesforce release (Winter '16) there was an update that changes how the Email Reference Id (aka Thread_Id) is generated.

# Old Email Reference Id

The old email reference Id was in the format of `[ ref:orgId.caseId:ref ]` and was really easy to generate.  All you had to do was concatenate the currentUser's orgId and their caseId together

```apex
public static String refId (String orgId, String caseId) {
    return '[ ref:' + orgId + '.' + caseId + ':ref ]';
}
```

Run this and you're done. Easy peasy.

# New Email Reference Id

This all changed with the release of Winter '16.  Once this hit the way the email reference Id changed so much that the Email to Case process wouldn't even parse the old thread ids.  So when a reply back to an email containing the old email reference id would come in, it would create a new case instead of pairing the EmailMessage with the Case Id in the thread_id.

<!--more-->

So, how can we generate the new format?  It's pretty easy:

```apex
public static String CASE_REF_FORMAT = 'ref:{0}.{1}:ref';

@testVisible
private static String shortenOrgId(String id) {
     String part = id.substring(0,15);
     Pattern p = Pattern.compile('^([A-Za-z0-9]{5})([A-Za-z0-9]*)$');
     Matcher m = p.matcher(part);

     if (m.matches()) {
          return '_' + m.group(1) + m.group(2).replace('0', '');
     }

     return '';
}

@testVisible
private static String shortenCaseId(String id) {
     String part = id.substring(0,15);
     Pattern p = Pattern.compile('^([A-Za-z0-9]{5})([A-Za-z0-9]*)([A-Za-z0-9]{5})$');
     Matcher m = p.matcher(part);

     if (m.matches()) {
          return '_' + m.group(1) + m.group(2).replace('0', '') + m.group(3);
     }

     return '';
}

public static String caseRefId(String orgId, String caseId) {
     if (orgId == null || caseId == null) {
          return '';
     }

     String shortenedOrgId = shortenOrgId(orgId);
     String shortenedCaseId = shortenCaseId(caseId);

     return String.format(
          CASE_REF_FORMAT,
          new List<String>{
               shortenedOrgId,
               shortenedCaseId
          }
     );
}
```

_NOTE: This is not technically a "supported" way to generate this Id.  Salesforce may (and obviously has) changed this thread id without warning.  If you have to generate these in Apex just keep this in mind._

# Alternatives

According to Salesforce support you can use this formula to generate it.

```
"ref:_"&LEFT($Organization.Id,5)&SUBSTITUTE(RIGHT($Organization.Id,10),"0","")&"._"&LEFT(Id,5)&SUBSTITUTE(LEFT(RIGHT(Id,10),5),"0","")&RIGHT(Id,5)&":ref"
```

Or you can maybe use [this formula](https://developer.salesforce.com/forums/?id=906F00000008naJIAQ)

```
LEFT( $Organization.Id , 4) & IF (MID ( $Organization.Id, 5, 1) <> "0", RIGHT($Organization.Id, 11), IF (MID ( $Organization.Id, 6, 1) <> "0", RIGHT($Organization.Id, 10), IF (MID ( $Organization.Id, 7, 1) <> "0", RIGHT($Organization.Id, 9), IF (MID ( $Organization.Id, 8, 1) <> "0", RIGHT($Organization.Id, 8), IF (MID ( $Organization.Id, 9, 1) <> "0", RIGHT($Organization.Id, 7), IF (MID ( $Organization.Id, 10, 1) <> "0", RIGHT($Organization.Id, 6), IF (MID ( $Organization.Id, 11, 1) <> "0", RIGHT($Organization.Id, 5), IF (MID ( $Organization.Id, 12, 1) <> "0", RIGHT($Organization.Id, 4), IF (MID ( $Organization.Id, 13, 1) <> "0", RIGHT($Organization.Id, 3), IF (MID ( $Organization.Id, 14, 1) <> "0", RIGHT($Organization.Id, 2), "") ) ) ) ) ) ) ) ) ) & "." & LEFT( Id, 4) & IF (MID ( Id, 5, 1) <> "0", RIGHT(Id, 11), IF (MID ( Id, 6, 1) <> "0", RIGHT(Id, 10), IF (MID ( Id, 7, 1) <> "0", RIGHT(Id, 9), IF (MID ( Id, 8, 1) <> "0", RIGHT(Id, 8), IF (MID ( Id, 9, 1) <> "0", RIGHT(Id, 7), IF (MID ( Id, 10, 1) <> "0", RIGHT(Id, 6), IF (MID ( Id, 11, 1) <> "0", RIGHT(Id, 5), IF (MID ( Id, 12, 1) <> "0", RIGHT(Id, 4), IF (MID ( Id, 13, 1) <> "0", RIGHT(Id, 3), IF (MID ( Id, 14, 1) <> "0", RIGHT(Id, 2), "") ) ) ) ) ) ) ) ) )
```