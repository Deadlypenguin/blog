---
post_id: 214
title: Dynamic dependent picklists in Salesforce
date: 2012-07-09T17:42:26+00:00
author: pcon
layout: post
permalink: /2012/07/09/dynamic-dependent-picklists-in-salesforce/
redirect_from:
- /blog/2012/07/09/dynamic-dependent-picklists-in-salesforce/
dsq_thread_id:
- "1800183132"
categories:
- development
- salesforce
tags:
- actionregion
- actionsupport
- apex
- visualforce
---
One thing that comes up a lot in the in the #salesforce IRC channel is doing dynamic Visual Force driven off of picklists.  So, let's buckle up and get to it.

## Data Model

In this simple example we are going to make an extension to the case page.  On this page we are going to us a custom Product/Version object to display on the page.  The product list well be determined on the start/end date of the product.  And the version will be driven by the currently selected product. **Product**

* Name &#8211; The name of the product
* Currently\_Supported\_\_c &#8211; Formula based on StartDate\_\_c and EndDate__c (Integer version of a boolean)
* StartDate__c &#8211; The date the product should be shown (Rollup min from the version)
* EndDate__c &#8211; The date the product should be hidden (Rollup max from the version)

**Version**

* Name &#8211; The name of the version
* Currently\_Supported\_\_c &#8211; Formula based on StartDate\_\_c and EndDate__c (Integer version of a boolean)
* StartDate__c &#8211; The date the version should be shown
* EndDate__c &#8211; The date the version should be hidden
* Product__c &#8211; The product the version is related to

## Apex Controller

```java
public with sharing class ProductUtils {
    static public List<Product__c> getAllProducts(Boolean includeEOL) {
        //This is done since the formula field cannot return a boolean
        Integer currentlySupported = (includeEOL) ? 0 : 1;

        return [
            select Name
            from Product__c
            where Currently_Supported__c >= :currentlySupported
            order by Name
        ];
    }

    public static List<Product__c> getAllProducts() {
        return getAllProducts(false);
    }

    public static List<Version__c> getAllVersions(Id productId, Boolean includeEOL) {
        Integer currentlySupported = (includeEOL) ? 0 : 1;

        return [
            select Name,
                Product__c
            from Version__c
            where Currently_Supported__c >= :currentlySupported and
                Product__c = :productId
            order by Name
        ];
    }

    public static List<Version__c> getAllVersions(Id productId) {
        return getAllVersions(productId, false);
    }
}
```

These methods are simple util methods to get product information and version information

```java
global with sharing class CaseEdit_ControllerExtension {
    private final Id recordId;
    private final Case record;
    private final ApexPages.StandardController controller;

    public Case_ControllerExtension(ApexPages.StandardController stdController) {
        this.controller = stdController;
        this.recordId = this.controller.getId();
        this.record = [
            select Product__c,
                Subject,
                Version__c
            from Case
            where Id = :this.recordId
            limit 1
        ];
    }

    public List<SelectOption> getProductList() {
        List<SelectOption> products = new List<SelectOption>();
        products.add(new SelectOption('', '--None--'));

        for (Product__c p: ProductUtils.getAllProducts()) {
            products.add(new SelectOption(p.Id, p.Name));
        }

        return products;
    }

    public Id getProduct() {
        return this.record.Product__c;
    }

    public void setProduct(Id productId) {
        this.record.Product__c = productId;
    }

    public List<SelectOption> getVersionList() {
        List<SelectOption> versions = new List<SelectOption>();
        versions.add(new SelectOption('', '--None--'));

        if (record.Product__c != null) {
            for (Version__c v: ProductUtils.getAllVersions(getProduct())) {
                versions.add(new SelectOption(v.Id, v.Name));
            }
        }

        return versions;
    }

    public Id getVersion() {
        return this.record.Version__c;
    }

    public void setVersion(Id versionId) {
        this.record.Version__c = versionId;
    }

    public PageReference doSave() {
        Case c = (Case) controller.getRecord();
        c.Product__c = this.record.Product__c;
        c.Version__c = this.record.Version__c;

        upsert c;

        return new PageReference('/'+c.Id);
    }
}
```

The controller has the getters and setters for the product and version.  But most importantly the getters for productList and versionList.  The versionList is triggered off the record's product.  The other part of this is that for whatever reason (I couldn't find a good one) is the getRecord does not include the changes made to the Product\_\_c and Version\_\_c field, so you'll need to set them by hand in the _doSave_ method.

One thing to note is since this is all done in the controller extension and since get and set use the Id, the select list will have the correct thing set when editing an existing record.

## Visual Force Page

```xml
<apex:page standardController="Case" extensions="CaseEdit_ControllerExtension" title="Case Edit" tabStyle="Case">
    <apex:form id="form">
        <apex:pageBlock title="Case Edit">
            <apex:pageBlockButtons>
                <apex:commandButton action="{!doSave}" value="Save" />
                <apex:commandButton action="{!cancel}" value="Cancel" />
            </apex:pageBlockButtons>
            <apex:pageBlockSection title="Case Information">
                <apex:inputField value="{!Case.Summary}" required="true" />
                <apex:pageBlockSectionItem>
                    <apex:outputLabel for="productList" value="{!$ObjectType.Case.fields.Product__c.label}" />
                    <apex:actionRegion>
                        <apex:selectList value="{!product}" title="Product" size="1" id="products">
                            <apex:selectOptions value="{!productList}" />
                            <apex:actionSupport event="onchange" rerender="versions" />
                        </apex:selectList>
                    </apex:actionRegion>
                </apex:pageBlockSectionItem>
                <apex:pageBlockSectionItem>
                    <apex:outputLabel for="versions" value="{!$ObjectType.Case.fields.Version__c.label}" />
                    <apex:actionRegion>
                        <apex:selectList value="{!version}" title="Version" size="1" id="versions">
                            <apex:selectOptions value="{!versionList}" />
                        </apex:selectList>
                    </apex:actionRegion>
                </apex:pageBlockSectionItem>
            </apex:pageBlockSection>
        </apex:pageBlock>
    </apex:form>
</apex:page>
```

The key parts of this is that the _actionRegion_ surrounds both the item changing (product) and the dependent item (version).  If you had a third picklist you wanted to trigger on you could add another _actionSupport_ item and tell it to rerender that third list.

## Conclusion

Dependent picklists are not very hard to do as long as you remember the actionRegion around both the source and target, and making sure to get the data from the picklist prior to upserting your record.