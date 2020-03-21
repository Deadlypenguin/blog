---
post_id: 1058
title: Visibility for Apex in Managed Packages
date: 2016-08-16T08:00:31+00:00
author: pcon
layout: post
permalink: /2016/08/16/visibility-apex-managed-packages/
redirect_from:
- /blog/2016/08/16/visibility-apex-managed-packages/
thumbnail: /assets/img/2016/08/16/post_thumbnail.png
dsq_thread_id:
- "5068140944"
categories:
- development
- salesforce
tags:
- apex
- managedpackage
---
Now that I'm starting to spend time playing with [packaging](https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/packaging_intro.htm) code for use I decided to dig into how access modifiers affect visibility of methods and classes inside of managed packages.

# Visibility Access Modifiers

Before we get started, let's review what options we have for defining [visibility](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_access_modifiers.htm) in Apex

**private** &#8211; Methods, classes and variables marked as private are only visible inside the same class.  If you define something as private then it cannot be accessed from an external class

**public **&#8211; Things that are marked as public are available for use by anything in the same namespace.

**global** &#8211; Things marked as global are available for use by anything on the platform.

Typically, public and private are enough for most implementations since your code resides inside the same namespace.  When writing code to be used by others from your managed package you'll want to make it global.

<!--more-->

# Visibility Examples

So let's take a look an example class that shows how visibility restricts access

```java
global class VisibilityTest {
    global class InnerClass {
        private InnerClass() {
            System.debug(System.LoggingLevel.ERROR, 'PRIVATE: constructor');
        }

        public InnerClass(String input) {
            this();
            System.debug(System.LoggingLevel.ERROR, 'PUBLIC: constructor ' + input);
        }

        global InnerClass(String input, Integer i) {
            this(input);
            System.debug(System.LoggingLevel.ERROR, 'GLOBAL: constructor ' + input + ' : ' + i);
        }

        global void globalPrintClass(String input) {
            System.debug(System.LoggingLevel.ERROR, 'GLOBAL: ' + input);
        }

        public void publicPrintClass(String input) {
            System.debug(System.LoggingLevel.ERROR, 'PUBLIC: ' + input);
        }

        private void privatePrintClass(String input) {
            System.debug(System.LoggingLevel.ERROR, 'PRIVATE: ' + input);
        }

        global void testPrintClass(String input) {
            globalPrintClass(input);
            publicPrintClass(input);
            privatePrintClass(input);
        }
    }

    global static void globalPrint(String input) {
        System.debug(System.LoggingLevel.ERROR, 'GLOBAL: ' + input);
    }

    public static void publicPrint(String input) {
        System.debug(System.LoggingLevel.ERROR, 'PUBLIC: ' + input);
    }

    private static void privatePrint(String input) {
        System.debug(System.LoggingLevel.ERROR, 'PRIVATE: ' + input);
    }

    global static void testPrint(String input) {
        globalPrint(input);
        publicPrint(input);
        privatePrint(input);
    }
}
```

In our class above we have several methods of different access levels as well as a class with constructors and methods of different visibility.

## Static Methods

Let's start with our static methods

```java
VisibilityTest.testPrint('Package Org');
VisibilityTest.globalPrint('Package Org');
VisibilityTest.publicPrint('Package Org');
VisibilityTest.privatePrint('Package Org');
```

If we were try to run the code above we'll get an error because the method privatePrint is not visible

```
Line: 4, Column: 1
Method is not visible: pcon_test1.VisibilityTest.privatePrint(String)
```

After removing the privatePrint line, we can see the output we get in the debug log

```
06:32:02.3 (19931064)|USER_DEBUG|[37]|ERROR|GLOBAL: Package Org
06:32:02.3 (20013061)|USER_DEBUG|[41]|ERROR|PUBLIC: Package Org
06:32:02.3 (20078051)|USER_DEBUG|[45]|ERROR|PRIVATE: Package Org
06:32:02.3 (20182423)|USER_DEBUG|[37]|ERROR|GLOBAL: Package Org
06:32:02.3 (20257988)|USER_DEBUG|[41]|ERROR|PUBLIC: Package Org
```

With the first call of testPrint we can see that we have access all three inner methods.  This is because the testPrint method belongs to the class and is allowed to call any private methods.  Then we'll see the other two calls that were made.

## Class Constructors

For our class we have three different constructors that call from most visible to least visible.

```java
VisibilityTest.InnerClass ic1 = new VisibilityTest.InnerClass();
VisibilityTest.InnerClass ic2 = new VisibilityTest.InnerClass('ic2');
VisibilityTest.InnerClass ic3 = new VisibilityTest.InnerClass('ic3', 3);
```

If we try to run the code above we'll get an error because of the empty constructor is marked as private and we do not have access to it.

```
Line: 1, Column: 33
Constructor is not visible: [VisibilityTest.InnerClass].<Constructor<()
```

After removing the private constructor line, we can see the output we get in the debug log

```
06:35:28.1 (4796769)|USER_DEBUG|[4]|ERROR|PRIVATE: constructor
06:35:28.1 (4873272)|USER_DEBUG|[9]|ERROR|PUBLIC: constructor ic2
06:35:28.1 (5354334)|USER_DEBUG|[4]|ERROR|PRIVATE: constructor
06:35:28.1 (5394937)|USER_DEBUG|[9]|ERROR|PUBLIC: constructor ic3
06:35:28.1 (5525878)|USER_DEBUG|[14]|ERROR|GLOBAL: constructor ic3 : 3
```

The constructor for ic2 calls the private constructor and prints out the our debug message.  The same occurs with the global constructor as it calls the public and private constructor.

## Class Methods

Now that we've looked at constructors the same visibility applies for the class methods

```java
VisibilityTest.InnerClass ic = new VisibilityTest.InnerClass('ic');
ic.testPrintClass('inner class');
ic.globalPrintClass('inner class');
ic.publicPrintClass('inner class');
ic.privatePrintClass('inner class');
```

As with the static methods, the code above fails with the privatePrintClass method

```
Line: 5, Column: 1
Method is not visible: [VisibilityTest.InnerClass].privatePrintClass(String)
```

Removing that method give us the following output

```
06:39:03.1 (3789730)|USER_DEBUG|[4]|ERROR|PRIVATE: constructor
06:39:03.1 (3890473)|USER_DEBUG|[9]|ERROR|PUBLIC: constructor ic
06:39:03.1 (4264832)|USER_DEBUG|[18]|ERROR|GLOBAL: inner class
06:39:03.1 (4414994)|USER_DEBUG|[22]|ERROR|PUBLIC: inner class
06:39:03.1 (4563225)|USER_DEBUG|[26]|ERROR|PRIVATE: inner class
06:39:03.1 (4741124)|USER_DEBUG|[18]|ERROR|GLOBAL: inner class
06:39:03.1 (4904861)|USER_DEBUG|[22]|ERROR|PUBLIC: inner class
```

As with our static methods, any method inside of our class has access to the private method so testPrintClass is allowed to call the private method.

# Manage Package Visibility

Now that we've looked at the visibility of the code inside the same namespace, let's package this code up and install it in another org.  You can follow along by installing [this package](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t410000001KON) in your developer org.

## Reviewing Methods

<img class="alignnone" src="http://res.cloudinary.com/deadlypenguin/image/upload/v1471275066/visiblityTest_jqkwln.png" alt="Class visibility" width="569" height="537" />

Thankfully the package provides a class summary to show which methods and constructors we have access to in our package.

## Static Methods

So let's take look at the code that worked in our packaging org.  We'll first want append our namespace to our class name.

```java
pcon_test1.VisibilityTest.testPrint('Client Org');
pcon_test1.VisibilityTest.globalPrint('Client Org');
pcon_test1.VisibilityTest.publicPrint('Client Org');
```

However, when we try to run this, we get the following error

```
Line: 3, Column: 1
Method is not visible: pcon_test1.VisibilityTest.publicPrint(String)
```

This is because we are outside the namespace of the class so we'll have to remove the public method call.  After removing that our code works.

_NOTE: Because this is inside a managed package we cannot see the debug messages._

## Class Constructors

Same as before, we try to run the two constructors that worked

```java
pcon_test1.VisibilityTest.InnerClass ic2 = new pcon_test1.VisibilityTest.InnerClass('ic2');
pcon_test1.VisibilityTest.InnerClass ic3 = new pcon_test1.VisibilityTest.InnerClass('ic3', 3);
```

But we'll fail with the following error

```
Line: 1, Column: 44
Constructor is not visible: [pcon_test1.VisibilityTest.InnerClass].<Constructor>(String)
```

Again, this is because the constructor is public and not inside the same namespace as the package

## Class Methods

And lastly we'll take a look at the class level methods

```java
pcon_test1.VisibilityTest.InnerClass ic = new pcon_test1.VisibilityTest.InnerClass('ic', 0);
ic.testPrintClass('inner class');
ic.globalPrintClass('inner class');
ic.publicPrintClass('inner class');
```

As with the other examples, we cannot access the public method because we are not in the packages namespace.

```
Line: 4, Column: 1
Method is not visible: [pcon_test1.VisibilityTest.InnerClass].publicPrintClass(String)
```

# Summary

For most code that's written, you don't need to deal with global methods and variables.  However when dealing with stuff that needs to be visible to consumers of your packages you'll want to pay attention to your visibility settings.