---
post_id: 344
title: Snapshotting objects in Salesforce with apex
date: 2014-05-20T15:41:42+00:00
author: pcon
layout: post
permalink: /2014/05/20/snapshotting-objects-in-salesforce-with-apex/
redirect_from:
- /blog/2014/05/20/snapshotting-objects-in-salesforce-with-apex/
dsq_thread_id:
- "2700393348"
categories:
- development
- salesforce
tags:
- apex
- snapshot
---
A common issue that we have is a need to see information about Cases when it is created.  We do this to do some analysis about how a case changes (primarily to verify how good our automated tools are working).  To achieve this, we made a generic snapshot object that will store a JSON version of our data.  We chose JSON for it's portability and it's ability to dump into other systems.

## The Object

To start out we'll need a place to put this data, so we created the object with the following fields. [Download object](https://gist.github.com/pcon/10196436#file-objectsnapshot__c-xml).

* **JSON\_Data\_{0-9}\_\_c** &#8211; _Required_ &#8211; These are several LongTextAreas that stores json data
* **Object\_Name\_\_c** &#8211; _Required_ &#8211; This is the name of the object that was snapshotted
* **Name** &#8211; _Required_ &#8211; An auto number, just used for identification
* **Case__c** &#8211; _Optional_ &#8211; This is used for our case specific snapshot to link a snapshot back to a specific case

<!--more-->

## Apex Class

```apex
/**
* Utility methods for use with the Object Snapshot object
*
* @author Patrick Connelly
*/

public with sharing class ObjectSnapshotUtils {
	public static String JSON_DELIMITER = '[delimiter]';
	public static Integer JSON_FIELD_SIZE = 32768 - (JSON_DELIMITER.length() * 2);
	public static Integer JSON_FIELD_COUNT = 10;

	public static final String JSON_FIELD_TEMPLATE = 'JSON_Data_{0}__c';

	public static Boolean SPARSE_JSON = true;

	public static final String SNAPSHOT_VERSION = '20120625';
	public static final String SNAPSHOT_VERSION_LABEL = 'snapshot_version';
	public static final String SNAPSHOT_SUCCESS_LABEL = 'snapshot_success';
	public static final String SNAPSHOT_MESSAGE_LABEL = 'snapshot_message';

	public static final String MSG_JSON_TO_LARGE = 'JSON data too large to store';

	public static final Map<String, Object> SNAPSHOT_INFO = new Map<String, Object> {
		SNAPSHOT_VERSION_LABEL => SNAPSHOT_VERSION,
		SNAPSHOT_SUCCESS_LABEL => true,
		SNAPSHOT_MESSAGE_LABEL => ''
	};

	public static final Map<String, Object> SNAPSHOT_INFO_JSON_TO_LARGE = new Map<String, Object> {
		SNAPSHOT_VERSION_LABEL => SNAPSHOT_VERSION,
		SNAPSHOT_SUCCESS_LABEL => false,
		SNAPSHOT_MESSAGE_LABEL => MSG_JSON_TO_LARGE
	};

	// These fields should never be added into the field map
	public static final Map<String, Set<String>> FIELD_BLACKLIST_MAP = new Map<String, Set<String>>{
		'Case' => new Set<String>{
			'lastvieweddate',
			'lastreferenceddate'
		}
	};

	private static Map<String, Map<String, Object>> objectDescription = new Map<String, Map<String, Schema.sObjectField>>();

	/**
	* Gets a map of field name to their values
	*
	* NOTE: Before calling this method, make sure that objectDescription has been populated
	*       for the called object.  getSnapshot handles this, but if you are going to call
	*       this directly, make sure it's populated.
	*
	* @param obj The sObject to build the map from
	* @return A map of field name to value
	*/
	private static Map<String, Object> getMapOfAllFields(String objName, sObject obj) {
		Map<String, Object> result = new Map<String, Object>();

		Set<String> fieldNames = objectDescription.get(objName).keySet();
		if (FIELD_BLACKLIST_MAP.containsKey(objName)) {
			fieldNames.removeAll(FIELD_BLACKLIST_MAP.get(objName));
		}

		for (String fieldName: fieldNames) {
			if (
				!SPARSE_JSON || (
					obj.get(fieldName) != null &&
					String.valueOf(obj.get(fieldName)).trim() != ''
				)
			) {
				result.put(fieldName, obj.get(fieldName));
			}
		}

		return result;
	}

	/**
	* Adds the delimiter to the start and end of the string
	*
	* NOTE: This is done because SFDC trims whitespace from the start/end of
	*       All fields
	*
	* @param data The string
	* @return The appended data
	*/
	public static String appendDelimiter(String data) {
		return JSON_DELIMITER + data + JSON_DELIMITER;
	}

	/**
	* Converts a string of json data into an object snapshot
	*
	* @param jsonData The json data
	* @return The object snapshot
	*/
	private static ObjectSnapshot__c jsonToSnapshot(Map<String, Object> fieldMap) {
		ObjectSnapshot__c result = new ObjectSnapshot__c();

		String jsonData = JSON.serialize(fieldMap);

		// Figure out if we have enough room in our fields for all the json data
		Integer numberOfFieldsRequired = (Integer)(Math.floor(jsonData.length() / JSON_FIELD_SIZE));
		if (numberOfFieldsRequired >= JSON_FIELD_COUNT) {
			fieldMap = SNAPSHOT_INFO_JSON_TO_LARGE;
			jsonData = JSON.serialize(fieldMap);
		}

		for (Integer lowerBound = 0; lowerBound < jsonData.length(); lowerBound += JSON_FIELD_SIZE) {
			Integer upperBound = ((lowerBound + JSON_FIELD_SIZE) > jsonData.length()) ? jsonData.length() : lowerBound + JSON_FIELD_SIZE;
			Integer index = (Integer)(Math.floor(lowerBound / JSON_FIELD_SIZE));
			String fieldName = String.format(JSON_FIELD_TEMPLATE, new List<String>{String.valueOf(index)});
			String field = appendDelimiter(jsonData.subString(lowerBound, upperBound));
			result.put(fieldName, field);
		}

		return result;
	}

	/**
	* Removes the delimiter from the start and end of the string
	*
	* @param data The data
	* @return The stipped down data
	*/
	public static String removeDelimiter(String data) {
		if (data == null) {
			return data;
		}

		return data.removeStart(JSON_DELIMITER).removeEnd(JSON_DELIMITER);
	}

	/**
	* Converts a Object Snapshot object to a json string
	*
	* @param snapshot The snapshot to convert
	* @return The json data
	*/
	public static String snapshotToJson(ObjectSnapshot__c snapshot) {
		List<String> JSONDataList = new List<String>();

		for (Integer i = 0; i < ObjectSnapshotUtils.JSON_FIELD_COUNT; i += 1) {
			String fieldName = String.format(ObjectSnapshotUtils.JSON_FIELD_TEMPLATE, new List<String>{String.valueOf(i)});
			String field = (String)(snapshot.get(fieldName));
			field = removeDelimiter(field);
			JSONDataList.add(field);
		}

		return String.join(JSONDataList, '');
	}

	/**
	* Gets the snapshot object of an sObject
	*
	* @param obj The sObject to snapshot
	* @return The snapshot
	*/
	public static ObjectSnapshot__c getSnapshot(sObject obj) {
		ObjectSnapshot__c result = new ObjectSnapshot__c();
		Schema.DescribeSObjectResult describeResult = obj.getSobjectType().getDescribe();
		String objName = describeResult.getName();

		// Doing this to reduce the number of field queries we make so we don't hit the limit of 100
		if (!objectDescription.containsKey(objName)) {
			objectDescription.put(objName, describeResult.fields.getMap());
		}

		Map<String, Object> fieldMap = getMapOfAllFields(objName, obj);
		fieldMap.putAll(SNAPSHOT_INFO);
		result = jsonToSnapshot(fieldMap);

		result.Object_Name__c = objName;
		return result;
	}

	/**
	* Creates and inserts the snapshots of a case
	*
	* @param cases A list of cases to snapshot
	*/
	public static void createSnapshots(List<Case> cases) {
		List<ObjectSnapshot__c> snapshots = new List<ObjectSnapshot__c>();

		for (Case newCase: cases) {
			ObjectSnapshot__c snapshot = ObjectSnapshotUtils.getSnapshot(newCase);
			snapshot.Case__c = newCase.Id;
			snapshots.add(snapshot);
		}

		if (!snapshots.isEmpty()) {
			insert snapshots;
		}
	}
}
```

Let's breakdown this class and explain what is happening.

* **Static Variables**
  * **JSON_DELIMITER** &#8211; Because Salesforce strips whitespace from the end of textarea fields, we need to surround all of our split JSON data with a delimiter to force Salesforce to honor the data as we hand it in.
  * **JSON\_FIELD\_SIZE** &#8211; This is the size of our LongTextArea, minus the length of the delimiter twice (since we're wrapping it)
  * **JSON\_FIELD\_COUNT** &#8211; This is the number of JSON\_Data\_\*\_\_c fields we have on our _ObjectSnapshot__c_ object
  * **JSON\_FIELD\_TEMPLATE** &#8211; This is a String.format template to convert to the JSON\_Data\_*__c field we are storing the data in
  * **SPARSE_JSON** &#8211; If the JSON data should be trimmed prior to insertion
  * **SNAPSHOT_VERSION** &#8211; The "version" of the snapshot utils.  Used for auditing and stored with the snapshot
  * **SNAPSHOT\_\*\_LABEL** &#8211; Text used to generate the map for the _SNAPSHOT\_\*\_INFO_
  * **MSG\_JSON\_TO_LARGE** &#8211; The message used if the JSON data exceeds the _JSON\_FIELD\_COUNT_ multiplied by the _JSON\_FIELD\_SIZE_
  * **SNAPSHOT_INFO** &#8211; A map of data used to identify a successful snapshot.  This data is added to the snapshot for identification
  * **SNAPSHOT\_INFO\_JSON\_TO\_LARGE** &#8211; A map of data used to identify a unsuccessful snapshot due to the resultant data being to large to store in a single _ObjectSnapshot__c_ object.
  * **FIELD\_BLACKLIST\_MAP** &#8211; This map of a set of strings is used to blacklist certain fields that should _NEVER_ be fetched or attempted to be snapshotted.  For example, _Case.lasevieweddate_ is a field that will throw a DML exception if the code attempts to do a _.get(&#8230;)_ on that field.  Because of this, any items in the _FIELD\_BLACKLIST\_MAP.get(objectName)_ will be removed from the objectDescription results.
* **Methods**
  * **getMapOfAllFields** &#8211; This gets a map of all of the fields (minus the blacklisted fields) for a given object.  _NOTE:_ This should not be called directly unless the _objectDescription_ variable is already populated.  The _getSnapshot_ method handles this request.
  * **appendDelimiter** &#8211; This appends the _JSON_DELIMITER_ variable to the start and end of a string
  * **jsonToSnapshot** &#8211; This converts a map of String to Objects to _ObjectSnapshot__c_ object
  * **removeDelimiter** &#8211; This removes the _JSON_DELIMITER_ variable from the start and end of a string
  * **snapshotToJSON** &#8211; This converts an _ObjectSnapshot__c_ object to JSON
  * **getSnapshot** &#8211; This takes an _sObject_ and converts it to an _ObjectSnapshot__c_
  * **createSnapshots** &#8211; This takes a list of cases and converts them to an _ObjectSnapshot__c_ and inserts them.

To create your own snapshots for a non _Case_ object, just look at the implementation of `createSnapshots(List<Case> cases)` and tailor it towards your object.  Since the `getSnapshot` method uses `Schema.DescribeSOjbectResult` methods, it should be a matter of converting and then enriching the `ObjectSnapshot__c` object with any additional information you desire.  For example, we added a `Case__c` field that the Case's Id is stored into, linking it back to the original object.

## Usage

Using this is very simple after creating the _createSnapshots_ method.  The following trigger calls our _ObjectSnapshotUtils_ and tells it to create a snapshot for all of the new Cases.

```apex
trigger CaseTrigger on Case (after insert) {
	ObjectSnapshotUtils.createSnapshots(Trigger.new);
}
```

## Future Plans

There are a couple of features I'd like to add to this to make it easier for others to consume. (In no particular order)

* Better OO methods for this class.  Making it so you can extend a snapshot method and then do your enrichment (or overload an enrichment method).  This would allow you to do something like _CaseSnapshotUtils implements ObjectSnapshotUtils_ and then call CaseSnapshotUtils instead
* Better error handling JSON data being too long. Like putting more statistics in the _SNAPSHOT\_INFO\_JSON\_TO\_LARGE_ map that gets inserted with the snapshot