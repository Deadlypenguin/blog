---
post_id: 741
title: Strip extensions from company names
date: 2016-01-10T22:31:56+00:00
author: pcon
layout: post
permalink: /2016/01/10/strip-extensions-from-company-names/
redirect_from:
- /blog/2016/01/10/strip-extensions-from-company-names/
dsq_thread_id:
- "4480140766"
categories:
- development
- salesforce
tags:
- apex
- customsettings
- Salesforce
---
In a recent developer boards [post](https://developer.salesforce.com/forums/?id=906F0000000MGwiIAG), there was a person asking how to programmatically strip extensions from the end of company names.  This seems like an interesting problem that can be solved with regular expressions with the data stored in a custom setting

# Custom Setting

![Custom Setting Definition](/assets/img/2016/01/10/custom_setting_definition.png)

<!--more-->

Using a simple List custom setting we can define all of our company extensions

![List of extensions](/assets/img/2016/01/10/list_of_extensions.png)

# Strip Extensions in Apex

```apex
List<String> companyNames = new List<String>{
    'Megacorp LLC',
    'Buy N Large LLP',
    'Umbrella Corp',
    'CHOAM INC'
};

Set<String> extensions = CompanyExtensions__c.getAll().keySet();
Map<String, Pattern> patternMap = new Map<String, Pattern>();

for (String extension : extensions) {
    // Use a case insensitive match and only match at the end of the string
    patternMap.put(extension, Pattern.compile('(?i)' + extension + '$'));
}

for (String companyName : companyNames) {
    System.debug('Looking for: ' + companyName);
    for (String extension : extensions) {
        Matcher m = patternMap.get(extension).matcher(companyName);

        if (m.find()) {
            String newName = m.replaceAll('').trim();
            System.debug('Converted name: ' + newName);
            break;
        }
    }
}
```

Here we get all of the extensions from the custom setting.  Then we make a map of extensions to a pre-compiled [Pattern](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_pattern_and_matcher_pattern_methods.htm) object.  The pattern we look for is extension at the end of the string.  Then we iterate over all of the company names looking for the each of the extensions.  If we find it we replace it and then break from the loop.

```
05:51:43.042 (42031892)|USER_DEBUG|[17]|DEBUG|Looking for: Megacorp LLC
05:51:43.042 (42894399)|USER_DEBUG|[23]|DEBUG|Converted name: Megacorp
05:51:43.042 (42987880)|USER_DEBUG|[17]|DEBUG|Looking for: Buy N Large LLP
05:51:43.044 (44200647)|USER_DEBUG|[23]|DEBUG|Converted name: Buy N Large
05:51:43.044 (44290526)|USER_DEBUG|[17]|DEBUG|Looking for: Umbrella Corp
05:51:43.046 (46349503)|USER_DEBUG|[23]|DEBUG|Converted name: Umbrella
05:51:43.046 (46439424)|USER_DEBUG|[17]|DEBUG|Looking for: CHOAM INC
05:51:43.047 (47219982)|USER_DEBUG|[23]|DEBUG|Converted name: CHOAM
```

This code probably isn't the most efficient when you have a bunch of extensions.  If I were to do this with a bunch of extensions I would probably look at combining this into a single regular expression to run against each name.