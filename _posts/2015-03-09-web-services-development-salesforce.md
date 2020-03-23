---
post_id: 536
title: Web services development on Salesforce
date: 2015-03-09T22:05:46+00:00
author: pcon
layout: post
permalink: /2015/03/09/web-services-development-salesforce/
redirect_from:
- /blog/2015/03/09/web-services-development-salesforce/
dsq_thread_id:
- "3610895607"
dsq_needs_sync:
- "1"
categories:
- development
- salesforce
tags:
- apex
- web-service
- webservice
---
Several years ago, I wrote a blog post on [developing web services on Salesforce](/2012/01/06/creating-web-services-in-salesforce/).  When helping someone in the IRC channel with web services, I realize that the article was outdated and does not follow some of the design patterns that I have learned after spending a lot of time with web services

# What are Web Services?

Let's start with a little background.  Web services are Apex code that you expose out and can consume with either SOAP or REST.  Typically this is used to expose complex business logic in an easily consumable way.  For example, you could use a web service to combine together an account with all of it's contacts and return them in a single call. In this article we will be covering SOAP endpoints, but most of the principles also apply to REST endpoints.

<!--more-->

# Components of a Web Service

## Utility Classes

If you're not using utility classes, stop what you are doing and go refactor all of your code now.  I'll wait.  Utility classes make it so you can reuse your code and makes it much easier to test.  Below are the utility classes used by our web services.  There is nothing particularly special about these other than the Exceptions in the GenericUtils class.  These we are using for Samurai Coding.

```apex
public class GenericUtils {
    public virtual class BadException extends Exception {}
    public virtual class UnknownException extends Exception {}

    /**
    * Checks to see if a string is null or blank
    *
    * @param value The string to check
    * @return If the string is blank
    */
    public static Boolean isBlank(String value) {
        if (value == null) {
            return true;
        }

        return (value.trim().length() == 0);
    }
}
```

```apex
public class ContactUtils {
    /**
    * Returns a list of contacts for a given account
    *
    * @param account The account
    * @return The contacts for the account
    */
    public static List<Contact> getContactsForAccount(Account account) {
        return [
            select Is_User_Active__c,
                Name
            from Contact
            where AccountId = :account.Id
        ];
    }
}
```

```apex
public class AccountUtils {
    /**
    * Gets a map of account numbers to accounts
    *
    * @param accountNumbers A set of account numbers
    * @return A map of account number to account
    */
    public static Map<String, Account> getAccountMapByNumber(Set<String> accountNumbers) {
        Map<String, Account> results = new Map<String, Account>();

        for (Account account : [
            select AccountNumber,
                MyField__c,
                Name
            from Account
            where AccountNumber in :accountNumbers
        ]) {
            results.put(account.AccountNumber, account);
        }

        return results;
    }

    /**
    * Gets an account for a given account number
    *
    * @param acccountNumber The account number
    * @return The account
    * @throws GenericUtils.UnknownException if the account cannot be found
    */
    public static Account getAccountByNumber(String accountNumber) {
        Map<String, Account> accountMap = getAccountMapByNumber(new Set<String>{accountNumber});

        if (!accountMap.containsKey(accountNumber)) {
            throw new GenericUtils.UnknownException('Unable to find account');
        }

        return accountMap.get(accountNumber);
    }
}
```

### Samurai Coding

Samurai coding is a concept that I was introduced to a couple of years ago and I'm in love with it.  The name refers to the Samurai code where when on a mission, a Samurai should "return successful or don't return at all."  What this means is that if a method is expecting a result you either return the result or throw an exception.  If you look at the AccountUtils.getAccountByNumber you can see that if we get an account we could not find we throw an exception.  By doing this, we don't have to check for a null value or empty like you would typically do.

## API Utils

After developing several different web services, I have learned that one of the best things you can do for your services is to have all of you different web services consume and return shared classes.  This will save you lots of heartache when you have to add fields or want to migrate functionality.  Instead of having to update the class definition in multiple places you just need to update it in one.  This is where APIUtils comes into play.  For APIUtils, we will define our shared resources as well as our API related helper methods and exceptions.

```apex
/** This class is a utility class for WebServices and other API classes */
global with sharing class APIUtils {
    /** Return codes to for returnCdoe */
    global final static Integer STATUS_OK = 200;
    global final static Integer STATUS_CREATED = 201;
    global final static Integer STATUS_ACCEPTED = 202;
    global final static Integer STATUS_BAD = 400;
    global final static Integer STATUS_FORBIDDEN = 403;
    global final static Integer STATUS_NOTFOUND = 404;
    global final static Integer STATUS_NOTALLOWED = 405;
    global final static Integer STATUS_ISE = 500;

    public virtual class UnknownException extends GenericUtils.UnknownException {}
    public virtual class BadException extends GenericUtils.BadException {}

    /** This class is an abstraction of the Contact object */
    global class APIContact {
        WebService Integer returnCode;
        WebService String message;

        WebService String name;
        WebService Boolean isActive;

        /**
        * Blank constructor for the Contact
        */
        public APIContact() {}

        /**
        * Constructor based on a Contact object
        *
        * @param contact A contact
        */
        public APIContact(Contact contact) {
            this();
            this.name = contact.Name;
            this.isActive = contact.Is_User_Active__c;
        }
    }

    /** This class is an abstraction of the Account object */
    global class APIAccount {
        WebService Integer returnCode;
        WebService String message;

        WebService String name;
        WebService String accountNumber;
        WebService String myField;
        WebService Boolean isAwesome;
        WebService List<APIContact> contacts;

        /**
        * A blank constructor
        */
        public APIAccount() {}

        /**
        * A constructor based on Account
        * @param account The account
        * @param awesomeness Is the account awesome
        */
        public APIAccount(Account account, Boolean awesomeness) {
            this();
            this.name = account.Name;
            this.accountNumber = account.AccountNumber;
            this.myField = account.MyField__c;
            this.isAwesome = awesomeness;
        }

        /**
        * A constructor based on Account
        * @param account The Account
        */
        public APIAccount(Account account) {
            this(account, true);
        }

        /**
        * Adds contacts to the account
        *
        * @param contacts The contacts to add
        */
        public void addContacts(List<Contact> contacts) {
            this.contacts = (this.contacts != null) ? this.contacts : new List<APIContact>();

            for (Contact contact : contacts) {
                this.contacts.add(new APIContact(contact));
            }
        }
    }

    /** This is the context object for accounts */
    global class AccountContext {
        public String accountNumber;

        private Account account {
            get {
                if (this.account == null) {
                    this.account = AccountUtils.getAccountByNumber(this.accountNumber);
                }

                return this.account;
            }
            set;
        }

        private List<Contact> contacts {
            get {
                if (this.contacts == null) {
                    this.contacts = ContactUtils.getContactsForAccount(this.account);
                }

                return this.contacts;
            }
            set;
        }

        /**
        * Blank constructor
        */
        public AccountContext() {}

        /**
        * Get the account
        *
        * @return The account
        */
        public Account getAccount() {
            return this.account;
        }

        /**
        * Gets a list of contacts for the account
        *
        * @return The contacts
        */
        public List<Contact> getContacts() {
            return this.contacts;
        }
    }

    /**
    * Validates that a given account context is valid
    *
    * @param context The context to check
    * @throws APIUtils.BadException if the context is not valid
    */
    public static void ensureContext(AccountContext context) {
        if (context == null || GenericUtils.isBlank(context.AccountNumber)) {
            throw new BadException('Account number must be set');
        }
    }
}
```

The key method in this class is ensureContext method.  This method validates the data being passed into the API method is right before we try to operate on it.

## API Class

With these utility methods in place, our API class is really quite small.  Most of the class is error handling.

```apex
global with sharing class AccountAPI {
    /**
    * Gets an account and all of the related contacts
    *
    * @param aContext The account to get
    */
    WebService static APIUtils.APIAccount getAccount(APIUtils.AccountContext aContext) {
        APIUtils.APIAccount result = new APIUtils.APIAccount();

        try {
            APIUtils.ensureContext(aContext);

            result = new APIUtils.APIAccount(aContext.getAccount());
            result.addContacts(aContext.getContacts());
        } catch (GenericUtils.BadException e) {
            result.returnCode = APIUtils.STATUS_BAD;
            result.message = e.getMessage();
        } catch (GenericUtils.UnknownException e) {
            result.returnCode = APIUtils.STATUS_NOTFOUND;
            result.message = e.getMessage();
        } catch (Exception e) {
            result.returnCode = APIUtils.STATUS_ISE;
            result.message = e.getMessage();
        }

        return result;
    }
}
```

First we check the context that was passed in is correct.  Then we get the account from the context and then we get the contacts.  The catch statements set our return code in our and the message.

# Conclusion

When working with web services you should do the following

* Put your data logic into utility classes for reuse and to decrease overall code complexity
* Validate incoming data
* Don't be afraid to write helper methods (such as getAccount) on classes

And on a final note, if you think you might want to add additional parameters to your method calls later on, add a class that you can expand when you start.  Unfortunately you cannot have the a web service method with the same name in the same class, even if it has a different number of parameters.  To with this, create a class (like accountParameters) and put the additional fields in there.  This will give you flexibility to add new class level variables without having to worry about the method signature changing.

## See Also

If you need help testing these web services I would recommend reading my article on how to use [SoapUI to test Apex web services directly](http://blog.deadlypenguin.com/blog/2012/02/03/salesforce-and-soapui/ "Salesforce and soapUI – Testing WebServices directly").