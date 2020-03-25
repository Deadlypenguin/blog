---
post_id: 227
title: Nulling fields in Salesforce with SoapUI
date: 2012-08-26T09:53:38+00:00
author: pcon
layout: post
permalink: /2012/08/26/nulling-fields-in-salesforce-with-soapui/
redirect_from:
- /blog/2012/08/26/nulling-fields-in-salesforce-with-soapui/
dsq_thread_id:
- "1803110279"
categories:
- development
- salesforce
tags:
- soap
- soapui
- webservice
---
# The Problem

The other day I came across a problem where sending in a blank field to Salesforce via SOAP was not nulling out the field.  Instead, the enterprise WSDL was treating this as if nothing was sent, and therefore not updating the field at all.  This make sense.  If you were to send a sparse data structure over with only fields you want to update, you wouldn't want to either have to provide the current value of every field or have them all nulled out.  So, how do you null out a field with SOAP via the enterprise (or partner) WSDL in Salesforce?

# The Solution

<div class="notification is-info is-light">This is input is formatted for SoapUI, it may differ depending on the client you are using to send the SOAP message.  The key take away is fieldToNull urn.</div>

Lets start with a simple example of updating a field via the Enterprise WSDL

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:enterprise.soap.sforce.com" xmlns:urn1="urn:sobject.enterprise.soap.sforce.com">
   <soapenv:Header>
      <urn:SessionHeader>
         <urn:sessionId>${#Project#sessionid}</urn:sessionId>
      </urn:SessionHeader>
   </soapenv:Header>
   <soapenv:Body>
      <urn:update>
         <!--Zero or more repetitions:-->
         <urn:sObjects xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Contact">
               <urn:Id>${#Project#contactid}</urn:Id>
               <urn:CustomField__c>Yay! Data</urn:CustomField__c>
         </urn:sObjects>
      </urn:update>
   </soapenv:Body>
</soapenv:Envelope>
```

This will set the CustomField__c on the Contact to "Yay! Data"

To null out this field we simply send the field name as part of the _fieldsToNull_ list

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:enterprise.soap.sforce.com" xmlns:urn1="urn:sobject.enterprise.soap.sforce.com">
   <soapenv:Header>
      <urn:SessionHeader>
         <urn:sessionId>${#Project#sessionid}</urn:sessionId>
      </urn:SessionHeader>
   </soapenv:Header>
   <soapenv:Body>
      <urn:update>
         <!--Zero or more repetitions:-->
         <urn:sObjects xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Contact">
               <urn:Id>${#Project#contactid}</urn:Id>
               <urn:fieldsToNull>CustomField__c</urn:fieldsToNull>
         </urn:sObjects>
      </urn:update>
   </soapenv:Body>
</soapenv:Envelope>
```