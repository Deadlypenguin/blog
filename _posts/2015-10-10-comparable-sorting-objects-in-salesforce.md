---
post_id: 673
title: 'Comparable: Sorting Objects in Salesforce'
date: 2015-10-10T22:58:18+00:00
author: pcon
layout: post
permalink: /2015/10/10/comparable-sorting-objects-in-salesforce/
redirect_from:
- /blog/2015/10/10/comparable-sorting-objects-in-salesforce/
dsq_thread_id:
- "4213752237"
categories:
- development
- salesforce
tags:
- apex
---
Like most Object Oriented languages, Apex will allow you to make an order List of objects that you can then iterate over and manipulate.  However, Apex will not let you use the built in [_sort_ method](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_methods_system_list.htm#apex_System_List_sort) for List to sort sObjects by a field inside.  To do this, we have to implement our own comparable class to do the sorting for us.

# Basic sorting

## Implementing Comparable

Let's take a look at a simple class that takes in an Employee object, stores the employee's data in it and allows us to sort a list of Employees by their salary.
<!--more-->

```apex
/** A wrapper class to make employee sortable */
public class EmployeeWrapper implements Comparable {
    /** The name */
    public String name {
        get;
        private set;
    }

    /** The salary */
    public Decimal salary {
        get;
        private set;
    }

    /** The phone number */
    public String phone {
        get;
        private set;
    }

    /**
    * A generic constructor
    */
    public EmployeeWrapper() {}

    /**
    * Constructor based on an employee record
    *
    * @param employee The employee to use
    */
    public EmployeeWrapper(Employee__c employee) {
        this.name = employee.Name;
        this.salary = employee.Salary__c;
        this.phone = employee.Phone__c;
    }

    /**
    * The comparator method used in sorting
    *
    * @param obj The object to compare to
    * @return the integer value of the comparison between the objects
    */
    public Integer compareTo(Object obj) {
        // TO-DO: Implement salary sort

        return 0;
    }
}
```

This class doesn't do a whole lot right now, we can see that the class `implements Comparable` and has a `compareTo` method.  These are the key points that allow us to be able to sort a list of our wrapper objects.  Right now the `compareTo` is returning `` which means that all of the items in the list are equal and the sort order would not change.

## compareTo

The `compareTo` method is a special method that when the main class `implements Comparable` it is called when sorting a list of the objects. There are three possible values that the `compareTo` method should return

* `1` &#8211; The current value is greater than the compared value
* `0` &#8211; The current value is equal to the compared value
* `-1` &#8211; The current value is less than the compared value

_Note: In all actuality it is looking for positive, zero and negative numbers. It's just easier to comprehend when using one, zero and negative one. But there are times where it's easier to return a positive, zero or negative number when doing a mathematical equation._

So, let's update the `compareTo` method to return the right values for comparing salary.

```apex
/**
* The comparator method used in sorting
*
* @param obj The object to compare to
* @return the integer value of the comparison between the objects
*/
public Integer compareTo(Object obj) {
    EmployeeWrapper employee = (EmployeeWrapper)(obj);

    if (this.salary > employee.salary) {
        return 1;
    }

    if (this.salary == employee.salary) {
        return 0;
    }

    return -1;
}
```

In the method we are passed in a generic `Object` that we then have to do something with.  In order to access the underlying salary field, we need to typecast it to match our `EmployeeWrapper` class.  Once we typecast it, we can do our comparisons and return the expected value.

_Note: The compareTo will always get the same type as the class the compareTo method belongs to._

## Comparable in Action

Now that we have our EmployeeWrapper class all done, let's do something with it.

```apex
public class EmployeeUtils {
    /** A wrapper class to make employee sortable */
    public class EmployeeWrapper implements Comparable {
        /** The name */
        public String name {
            get;
            private set;
        }

        /** The salary */
        public Decimal salary {
            get;
            private set;
        }

        /** The phone number */
        public String phone {
            get;
            private set;
        }

        /**
        * A generic constructor
        */
        public EmployeeWrapper() {}

        /**
        * Constructor based on an employee record
        *
        * @param employee The employee to use
        */
        public EmployeeWrapper(Employee__c employee) {
            this.name = employee.Name;
            this.salary = employee.Salary__c;
            this.phone = employee.Phone__c;
        }

        /**
        * The comparator method used in sorting
        *
        * @param obj The object to compare to
        * @return the integer value of the comparison between the objects
        */
        public Integer compareTo(Object obj) {
            EmployeeWrapper employee = (EmployeeWrapper)(obj);

            if (this.salary > employee.salary) {
                return 1;
            }

            if (this.salary == employee.salary) {
                return 0;
            }

            return -1;
        }
    }

    /**
    * Gets a list of all employees
    *
    * @return All of the employees
    */
    public static List<EmployeeWrapper> getEmployees() {
        List<EmployeeWrapper> results = new List<EmployeeWrapper>();

        for (Employee__c employee : [
            select Location__c,
            	Name,
            	Phone__c,
            	Salary__c
            from Employee__c
        ]) {
            results.add(new EmployeeWrapper(employee));
        }

        return results;
    }
}
```

Here we have created an EmployeeUtils class that contains our wrapper.  It also includes a method call getEmployees that queries for all of the employees and then returns them as a list of EmployeeWrapper.

```apex
public class EmployeeViewController {
    public List<EmployeeUtils.EmployeeWrapper> employees {
        get;
        private set;
    }

    public EmployeeViewController() {
        this.employees = EmployeeUtils.getEmployees();
        this.employees.sort();
    }
}
```

We then create a very simple Visualforce Controller called EmployeeViewController that in it's constructor gets the list of employees and sorts them.

```xml
<apex:page controller="EmployeeViewController">
    <apex:pageBlock title="Employees">
        <apex:pageBlockTable value="{!employees}" var="employee">
            <apex:column value="{!employee.Name}" />
            <apex:column value="{!employee.Phone}" />
            <apex:column value="{!employee.Salary}" />
        </apex:pageBlockTable>
    </apex:pageBlock>
</apex:page>
```

The Visualforce page then generates a table of employees sorted by salary.

![Comparable: Basic Example](/assets/img/2015/10/10/comparable_output.png)

# Advanced Sorting

Now the simple sorting by one field is all fine and dandy, but it's pretty boring.  Let's get a little crazy and make it so we can dynamically sort the Employee table based on name, phone number, salary and distance to Raleigh, NC.

```apex
public class EmployeeUtils {
    /** The literal for sorting by phone */
    public static String PHONE_SORT = 'phone';

    /** The literal for sorting by name */
    public static String NAME_SORT = 'name';

    /** The literal for sorting by salary */
    public static String SALARY_SORT = 'salary';

    /** The literal for sorting by distance */
    public static String DISTANCE_SORT = 'distance';

    /** What we are sorting by */
    public static String SORT_BY = SALARY_SORT;

    /** The latitude of Raleigh */
    public static Double RDU_LAT = 35.7806;

    /** The longitude of Raleigh */
    public static Double RDU_LON = 78.6389;

    /**
    * Convertes degrees to radians
    *
    * @param degree The degrees
    * @return The radians
    */
    private static Double toRadians(Decimal degree){
        Double res = degree * 3.1415926 / 180;
        return res;
    }

    /**
    * Calculates the distance between to points
    * Taken from: http://salesforce.stackexchange.com/questions/557/calculate-distance-between-two-places-on-accounts-from-a-vf-page
    *
    * @param lat1 The first latitude point
    * @param lon1 The first longitude point
    * @param lat2 The second latitude point
    * @param lon2 The second longitude point
    * @return The distance between the two points
    */
    public static Decimal calculateDistance(Decimal lat1, Decimal lon1, Decimal lat2, Decimal lon2){
        Double Radius = 6371.00;
        Double dLat = toRadians(lat2-lat1);
        Double dLon = toRadians(lon2-lon1);
        Double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRadians(lat1)) *   Math.cos(toRadians(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        Double c = 2 * Math.asin(Math.sqrt(a));
        return Radius * c * .62;
    }

    /** A wrapper class to make employee sortable */
    public class EmployeeWrapper implements Comparable {
        /** The name */
        public String name {
            get;
            private set;
        }

        /** The salary */
        public Decimal salary {
            get;
            private set;
        }

        /** The phone number */
        public String phone {
            get;
            private set;
        }

        /** The distance between the employee and Raleigh */
        public Decimal distance {
            get;
            private set;
        }

        /**
        * A generic constructor
        */
        public EmployeeWrapper() {}

        /**
        * Constructor based on an employee record
        *
        * @param employee The employee to use
        */
        public EmployeeWrapper(Employee__c employee) {
            this.name = employee.Name;
            this.salary = employee.Salary__c;
            this.phone = employee.Phone__c;
            this.distance = Math.round(calculateDistance(employee.Location__Latitude__s, employee.Location__Longitude__s, RDU_LAT, RDU_LON));
        }

        /**
        * Sorts by the salary of the employee
        *
        * @return the integer value of the comparison between the objects
        */
        private Integer sortBySalary(EmployeeWrapper employee) {
            if (this.salary > employee.salary) {
                return 1;
            }

            if (this.salary == employee.salary) {
                return 0;
            }

            return -1;
        }

        /**
        * Sorts by the name of the employee
        *
        * @return the integer value of the comparison between the objects
        */
        private Integer sortByName(EmployeeWrapper employee) {
            if (this.name > employee.name) {
                return 1;
            }

            if (this.name == employee.name) {
                return 0;
            }

            return -1;
        }

        /**
        * Sorts by the phone of the employee
        *
        * @return the integer value of the comparison between the objects
        */
        private Integer sortByPhone(EmployeeWrapper employee) {
            if (this.phone > employee.phone) {
                return 1;
            }

            if (this.phone == employee.phone) {
                return 0;
            }

            return -1;
        }

        /**
        * Sorts by the distance of the employee
        *
        * @return the integer value of the comparison between the objects
        */
        private Integer sortByDistance(EmployeeWrapper employee) {
           if (this.distance > employee.distance) {
                return 1;
            }

            if (this.distance == employee.distance) {
                return 0;
            }

            return -1;
        }

        /**
        * The comparator method used in sorting
        *
        * @param obj The object to compare to
        * @return the integer value of the comparison between the objects
        */
        public Integer compareTo(Object obj) {
            EmployeeWrapper employee = (EmployeeWrapper)(obj);

            if (SORT_BY == PHONE_SORT) {
                return sortByPhone(employee);
            }

            if (SORT_BY == NAME_SORT) {
                return sortByName(employee);
            }

            if (SORT_BY == SALARY_SORT) {
                return sortBySalary(employee);
            }

            if (SORT_BY == DISTANCE_SORT) {
                return sortByDistance(employee);
            }

            // If we don't have a know sort by, let's just return that they are all equal
            return 0;
        }
    }

    /**
    * Gets a list of all employees
    *
    * @return All of the employees
    */
    public static List<EmployeeWrapper> getEmployees() {
        List<EmployeeWrapper> results = new List<EmployeeWrapper>();

        for (Employee__c employee : [
            select Location__c,
            	Location__Latitude__s,
            	Location__Longitude__s,
            	Name,
            	Phone__c,
            	Salary__c
            from Employee__c
        ]) {
            results.add(new EmployeeWrapper(employee));
        }

        return results;
    }
}
```

This class looks very similar to the previous class except for now we have separate sort methods for each field we're going to sort by.  We could probably have done this a little more dynamically by converting the object to JSON, pulling out the value and comparing that (or even using [apex-lodash](https://github.com/apex-lodash/lo)) but for the sake of understanding let's not.  Additionally we now have a SORT_BY variable that tells us what we are sorting our list by in the `compareTo`.  This is a static variable so that we can look at it every time the method is called and do the right thing.

```apex
public class EmployeeViewController {
    /** The list of employees */
    public List<EmployeeUtils.EmployeeWrapper> employees {
        get;
        private set;
    }

    /**
    * Base constructor
    */
    public EmployeeViewController() {
        this.employees = EmployeeUtils.getEmployees();
        this.employees.sort();
    }

    /**
    * Sorts all employees by name
    */
    public PageReference sortByName() {
        EmployeeUtils.SORT_BY = EmployeeUtils.NAME_SORT;
        this.employees.sort();
        return null;
    }

    /**
    * Sorts all employees by phone
    */
    public PageReference sortByPhone() {
        EmployeeUtils.SORT_BY = EmployeeUtils.PHONE_SORT;
        this.employees.sort();
        return null;
    }

    /**
    * Sorts all employees by salary
    */
    public PageReference sortBySalary() {
        EmployeeUtils.SORT_BY = EmployeeUtils.SALARY_SORT;
        this.employees.sort();
        return null;
    }

    /**
    * Sorts all employees by distance
    */
    public PageReference sortByDistance() {
        EmployeeUtils.SORT_BY = EmployeeUtils.DISTANCE_SORT;
        this.employees.sort();
        return null;
    }

    /**
    * Reverses the list
    */
    public PageReference reverse() {
        List<EmployeeUtils.EmployeeWrapper> tmpList = new List<EmployeeUtils.EmployeeWrapper>();
        Integer size = this.employees.size();

        for (Integer i = 0; i < size; i++) {
            tmpList.add(this.employees.remove(this.employees.size() - 1));
        }

        this.employees = tmpList;

        return null;
    }
}
```

Our controller has gotten a little more complex.  It now has some methods that set the sort by and call the sort method.  Again, we could have probably made these more generic and passed in the sort by from the Visualforce but I think this helps to convey the message clearer. And then we have a method that reverses the list.

```xml
<apex:page controller="EmployeeViewController">
    <apex:form>
        <apex:pageBlock title="Employees">
            <apex:pageBlockButtons>
                <apex:commandButton action="{!sortByName}" value="Sort by name" reRender="employeeList" />
                <apex:commandButton action="{!sortByPhone}" value="Sort by phone" reRender="employeeList" />
                <apex:commandButton action="{!sortBySalary}" value="Sort by salary" reRender="employeeList" />
                <apex:commandButton action="{!sortByDistance}" value="Sort by distance" reRender="employeeList" />
                <apex:commandButton action="{!reverse}" value="Reverse" reRender="employeeList" />
            </apex:pageBlockButtons>
            <apex:pageBlockTable value="{!employees}" var="employee" id="employeeList">
                <apex:column value="{!employee.Name}" headerValue="Name" />
                <apex:column value="{!employee.Phone}" headerValue="Phone" />
                <apex:column value="{!employee.Salary}" headerValue="Salary" />
                <apex:column value="{!employee.Distance}" headerValue="Distance to RDU" />
            </apex:pageBlockTable>
        </apex:pageBlock>
    </apex:form>
</apex:page>
```

The page now has a row of commandButtons that will set what our table is sorted by.

![Comparable: Advanced Example](/assets/img/2015/10/10/comparable_output_advanced.png)