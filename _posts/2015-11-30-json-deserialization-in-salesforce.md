---
post_id: 732
title: JSON Deserialization in Salesforce
date: 2015-11-30T12:00:37+00:00
author: pcon
layout: post
permalink: /2015/11/30/json-deserialization-in-salesforce/
thumbnail: /assets/img/2015/11/30/post_thumbnail.png
redirect_from:
- /blog/2015/11/30/json-deserialization-in-salesforce/
dsq_thread_id:
- "4363284471"
dsq_needs_sync:
- "1"
categories:
- development
- salesforce
tags:
- apex
- json
---
I have been several posts recently on the [Developer Boards](https://developer.salesforce.com/forums/) around JSON deserialization and some weird and convoluted ways to convert it into something that is useful for Salesforce.  Let's talk about what I have found is the cleanest way to handle JSON deserialization.

# JSON Payload

Let's take a look at our JSON payload.  I am taking the payload from the docsample Heroku app since it's an easy way to get consistent data from a webservice.

```javascript
{
  "invoiceList": [
    {
      "totalPrice": 5.5,
      "statementDate": "2011-10-04T16:58:54.858Z",
      "lineItems": [
        {
          "UnitPrice": 1,
          "Quantity": 5,
          "ProductName": "Pencil"
        },
        {
          "UnitPrice": 0.5,
          "Quantity": 1,
          "ProductName": "Eraser"
        }
      ],
      "invoiceNumber": 1
    },
    {
      "totalPrice": 11.5,
      "statementDate": "2011-10-04T16:58:54.858Z",
      "lineItems": [
        {
          "UnitPrice": 6,
          "Quantity": 1,
          "ProductName": "Notebook"
        },
        {
          "UnitPrice": 2.5,
          "Quantity": 1,
          "ProductName": "Ruler"
        },
        {
          "UnitPrice": 1.5,
          "Quantity": 2,
          "ProductName": "Pen"
        }
      ],
      "invoiceNumber": 2
    }
  ]
}
```

So we can see here that the data provided is an invoice list and each invoice contains data and line items for that invoice.

<!--more-->

# JSON Deserialization

## Data Structure

Now we need to create a data structure to hold our the JSON we deserialize

```java
public class InvoiceWrapper {
    public class LineItem {
        public Double unitPrice {get; set;}
        public Double quantity {get; set;}
        public String productName {get; set;}

        public Double getLineItemTotal() {
            return this.unitPrice * this.quantity;
        }
    }

    public class Invoice {
        public Double totalPrice {get; set;}
        public DateTime statementDate {get; set;}
        public String contactnumber {get; set;}
        public List<LineItem> lineItems {get; set;}
        public Integer invoiceNumber {get; set;}
    }

    public List<Invoice> invoiceList {get; set;}
}
```

This wrapper class now contains our two sub-classes (LineItem and Invoice) as well as our variable for our invoice list.  The nice thing about doing it as a class is we can add helper methods to also manipulate data.  There is a `getLineItemTotal` method that we can use in our display.

## Data Parsing

Now we need to pull the data from the endpoint and using JSON deserialization push it into our data structure.

```java
public class JSONDeserialize {
    public InvoiceWrapper wrapper {
        get;
        set;
    }

    public void deserialize() {
        Http h = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndPoint('https://docsample.herokuapp.com/jsonSample');
        request.setHeader('Content-type', 'application/json');
        request.setMethod('GET');

        HttpResponse response = h.send(request);

        wrapper = (InvoiceWrapper) JSON.deserializeStrict(response.getBody(), InvoiceWrapper.class);
    }
}
```

If your JSON data is going to change (or could change) you can use `deserialize` instead of `deserializeStrict` to make it not explode when the JSON deserialization happens.

## Data Display

Now that we have a way to get the data in a meaningful structure, let's display it on a Visualforce page


```xml
<apex:page controller="JSONDeserialize">
    <apex:form >
        <apex:pageBlock title="JSON Deserialize Response">
            <apex:pageBlockButtons >
                <apex:commandButton value="submit" action="{!deserialize}" reRender="invoiceBlock"/>
            </apex:pageBlockButtons>
            <apex:pageBlockSection id="invoiceBlock" columns="1">
                <apex:repeat value="{!wrapper.invoiceList}" var="invoice">
                    <apex:pageBlockSection columns="2">
                        <apex:facet name="header">Invoice {!invoice.invoiceNumber}</apex:facet>
                        <apex:pageBlockSectionItem >
                            <apex:outputLabel value="Total Price" for="totalPrice" />
                            <apex:outputText value="{!invoice.totalPrice}" id="totalPrice" />
                        </apex:pageBlockSectionItem>
                        <apex:pageBlockSectionItem >
                            <apex:outputLabel value="Statement Date" for="statementDate" />
                            <apex:outputText value="{!invoice.statementDate}" id="statementDate" />
                        </apex:pageBlockSectionItem>
                    </apex:pageBlockSection>
                    <apex:pageBlockSection columns="1">
                        <apex:facet name="header">Invoice {!invoice.invoiceNumber} Items</apex:facet>
                        <apex:pageBlockTable value="{!invoice.lineItems}" var="item" id="lineItems">
                            <apex:column value="{!item.productName}" headerValue="Product Name" />
                            <apex:column value="{!item.quantity}" headerValue="Quantity" />
                            <apex:column value="{!item.unitPrice}" headerValue="Unit Price" />
                            <apex:column value="{!item.lineItemTotal}" headerValue="Total" />
                        </apex:pageBlockTable>
                    </apex:pageBlockSection>
                </apex:repeat>
            </apex:pageBlockSection>
        </apex:pageBlock>
    </apex:form>
</apex:page>
```

Now when we click the _submit_ button we can see the data coming in and when it's pressed we deserialize the data and reRender the section

![JSON Deserialization in action](/assets/img/2015/11/30/visualforce_output.png)