---
post_id: 438
title: Fun with maps and sets
date: 2015-01-26T16:53:47+00:00
author: pcon
layout: post
permalink: /2015/01/26/fun-with-maps-and-sets/
redirect_from:
- /blog/2015/01/26/fun-with-maps-and-sets/
dsq_thread_id:
- "3457753575"
categories:
- development
- salesforce
tags:
- apex
- bugs
- map
- set
---
While working on Apex, I discovered an interesting behavior with Maps and the keySet method.

## Problem

```apex
class TestData {
	public String data;

	public TestData() {}

	public TestData(String data) {
		this.data = data;
	}
}

Map<String, TestData> dataMap = new Map<String, TestData>{
	'foo' => new TestData('foo'),
	'bar' => new TestData('bar')
};

Set<String> keySet = dataMap.keySet();
System.debug(keySet.size()); // 2
System.debug(dataMap.size()); // 2

keySet.remove('foo');
System.debug(keySet.size()); // 1
System.debug(dataMap.size()); // 1
```

This code does not behave how you would think.  If you remove an item from the _keySet_ set it also removes it from the _dataMap._ What I believe to be happening here is that the _keySet_ method is returning a reference to the key set of the _dataMap_.
<!--more-->

## Solution

To work around this, we simply clone the keySet.  This will give us a new instance of the set instead of the reference version.

```apex
class TestData {
	public String data;

	public TestData() {}

	public TestData(String data) {
		this.data = data;
	}
}

Map<String, TestData> dataMap = new Map<String, TestData>{
	'foo' => new TestData('foo'),
	'bar' => new TestData('bar')
};

Set<String> keySet = dataMap.keySet().clone();
System.debug(keySet.size()); // 2
System.debug(dataMap.size()); // 2

keySet.remove('foo');
System.debug(keySet.size()); // 1
System.debug(dataMap.size()); // 2
```