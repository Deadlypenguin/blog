---
post_id: 461
title: 'Humblemug &#8211; My first node module'
date: 2015-02-14T22:59:21+00:00
author: pcon
layout: post
permalink: /2015/02/14/humblemug-first-node-module/
redirect_from:
- /blog/2015/02/14/humblemug-first-node-module/
categories:
- development
tags:
- nodejs
---
I have been working on migrating a site that I designed off of HTML with lots of javascript into a node.js app.  The site has very little in the way of user interaction and mainly just displays dynamic data out to the users.  This data is pulled from a number of sources but because it's pulled client-side it's terrible for SEO (I was young and should have known better).

One of the issues I encountered when migrating this site is that they have a gallery page that pulls data from a [SmugMug](http://www.smugmug.com/ "SmugMug") album.  When this site was originally written, [SmugMug](http://www.smugmug.com/ "SmugMug") only had an XML based API and to make it so that JavaScript would play nice, I had to write a php wrapper that would pull down the XML and re-host it on the same domain.  I sure as heck wasn't going to tarnish my pretty little rewrite with PHP.  So I tried to find a node module for [SmugMug](http://www.smugmug.com/ "SmugMug"), and much to my surprise, couldn't.  And with that, [Humblemug](https://github.com/pcon/humblemug "Humblemug") was born.

# Humblemug

[Humblemug](https://github.com/pcon/humblemug "Humblemug") is really quite simple.  It makes the http requests and spits out the JSON that the SmugMug [1.3.0 API](http://api.smugmug.com/services/api/?version=1.3.0 "SmugMug 1.3.0 API") returns.  Where Humblemug got interesting is that it's my first package published out on npm.  I've written modules for local apps, so I'm familiar with the structure, but I've never had to write something that others could use.

I followed [the guide](https://quickleft.com/blog/creating-and-publishing-a-node-js-module/ "Creating and Publishing a Node.js Module") that [Brent Ertz](https://quickleft.com/blog/author/brent/ "Brent Ertz") published and it went without a hitch.  The module is really bare bones right now (I only added the couple of methods I needed) and has no testing (GASP!).  I plan on adding testing soon and then adding some more functionality to it soon.  Hopefully I figure out how I want to structure everything before I get too far and have to re-do it all.

So, if you have a need for SmugMug integration in node.js feel free to checkout my first module.

Download Humblemug

* [Github](https://github.com/pcon/humblemug "Humblemug on Github")
* [NPM](https://www.npmjs.com/package/humblemug "humblmug on NPM")