---
post_id: 814
title: XML Parsing in Apex
date: 2016-07-14T08:45:55+00:00
author: pcon
layout: post
permalink: /2016/07/14/xml-parsing-apex/
redirect_from:
- /blog/2016/07/14/xml-parsing-apex/
dsq_thread_id:
- "4985135501"
categories:
- development
- salesforce
tags:
- apex
- xml
---
Doing XML parsing in any language can be pretty tough.  I wanted to share a quick how to for doing XML parsing in Apex based on a previous [board post](https://developer.salesforce.com/forums/?id=906F0000000D9hsIAC).

Let's start with the data we're trying parse

```xml
<?xml version="1.0"?>
<_CREDIT_SCORE for="Bob Dole">
  <_CREDIT_SCORE _CreditScore="668" _ReportingAgency="Experian" />
  <_CREDIT_SCORE _CreditScore="658" _ReportingAgency="TransUnion" />
  <_CREDIT_SCORE _CreditScore="660" _ReportingAgency="Equifax" />
</_CREDIT_SCORE>
```

For this data we want to pull out who the credit report is for and the credit data from the for field as well as from each of the \_CREDIT\_SCORE elements the agency and the score.

<!--more-->

# XML Parsing in Apex

## Data Structure

Let's start by defining our data structure that we're going to store our data in.  Like the [JSON parsing](/2015/11/30/json-deserialization-in-salesforce/) example, by converting this into classes, we'll be able to pass and manipulate our data much easier.

```java
public class AgencyScore {
  public Integer score;
  public String agency;

  public AgencyScore(String agency, Integer score) {
    this.score = score;
    this.agency = agency;
  }
}

public class CreditScore {
  public String name;
  public List<AgencyScore> scores;

  public CreditScore(String xml) {
    // Data parsing goes here
  }
}
```

Here we have some very simple classes to store our data and a empty constructor to parse our XML data in.

## XML Parsing

Now, let's do the heavy lifting inside of our constructor

```java
public CreditScore(String xml) {
  this.scores = new List<AgencyScore>();

  Dom.Document doc = new Dom.Document();
  doc.load(xml);
  this.name = doc.getRootElement().getAttributeValue('for', '');

  for (Dom.XmlNode node : doc.getRootElement().getChildElements()) {
    String agency = node.getAttributeValue('_ReportingAgency', '');
    Integer score = Integer.valueOf(node.getAttributeValue('_CreditScore', ''));
    this.scores.add(new AgencyScore(agency, score));
  }
}
```

So let's take a look at the first part of parsing the XML and getting the for attribute from the root element.  This is the easiest to get since we just pull it from the root element.  Since the XML is not namespaced, we just pass in an blank string to our [getAttributeValue](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_xml_dom_xmlnode.htm).

Now, to get each of our individual agency scores we need to iterate over each of the child elements.  Then the node is called to get the two attributes off of our child element.  This pattern would be repeated for each of our children as needed.

## Calling the Code

Now, let's call our class

```java
String xmlData = '<?xml version="1.0"?>' +
  '<_CREDIT_SCORE for="Bob Dole">' +
  '  <_CREDIT_SCORE _CreditScore="668" _ReportingAgency="Experian"/>' +
  '  <_CREDIT_SCORE _CreditScore="658" _ReportingAgency="TransUnion"/>' +
  '  <_CREDIT_SCORE _CreditScore="660" _ReportingAgency="Equifax"/>' +
  '</_CREDIT_SCORE>';

CreditScore cs = new CreditScore(xmlData);
System.debug(JSON.serialize(cs));
```

And now we'll have our CreditScore object populated with all of our data.