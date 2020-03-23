---
post_id: 470
title: Bitwise operations in Apex
date: 2015-02-17T21:34:09+00:00
author: pcon
layout: post
permalink: /2015/02/17/bitwise-operations-apex/
redirect_from:
- /blog/2015/02/17/bitwise-operations-apex/
categories:
- development
- salesforce
tags:
- apex
- math
---
A couple of days ago a friend of mine was asking about how to do bitwise math on Salesforce in Apex.  I didn't know how to do it on the platform so I decided to give it a shot.

_NOTE: None of the topics covered here are specific to Apex or the Salesforce platform.  These concepts extend to most languages.  However, the code examples below have been tested and verified on the Salesforce platform._

# What are bitwise operations?

[Bitwise operations](http://en.wikipedia.org/wiki/Bitwise_operation "Bitwise Operation") are operations that deal with numbers on a binary level.  You see this type of operation mainly in lower level programing languages where you have limited resources and need to store lots of information in a small amount of space.  For these examples we'll be using the [match details](https://wiki.teamfortress.com/wiki/WebAPI/GetMatchDetails#Player_Slot "Match Details") from DOTA 2 output.  This allows for Valve to return a single number to represent lot of information.
<!--more-->

# Bit masks (Player Slot)

Let's start out with the structure of the player slot information

```
   ┌─────────────── Team (false if Radiant, true if Dire).
   │ ┌─┬─┬─┬─────── Not used.
   │ │ │ │ │ ┌─┬─┬─ The position of a player within their team (0-4).
   │ │ │ │ │ │ │ │
   0 0 0 0 0 0 0 0
```

The 3 right most bits of the number denotes the position the player was on their team.  Since we are limited (in this game) to five players per team can store this without an issue in the 3 right most bits (maximum number that can be stored in this space is 7 binary of 111)

```apex
Integer value = 132;
// Binary 10000100

Integer PLAYER_MASK = 7;
// Binary 00000111

Integer result = value & PLAYER_MASK;
// Binary 00000100
// Integer 4
```

To get the right most digits we'll apply a bit mask of 00000111 (integer of 7) and then apply this as a bitwise AND operator.  This will zero out the 5 left most bits leaving the right 3 bits.  After apply the mask with the & operator we're left with a value of 4.

# Bit shifting (Player Slot)

The left most bit of the number denotes which team the player was on.  Here we want to shift all of the bits to the right leaving just the left most bit.  We do this with the right shift >> operator

```apex
Integer value = 132;
// Binary 10000100

Integer shift = 7;

Integer result = value >> shift;
// Binary 00000001
// Integer 1
```

# Combining the two

```
   ┌─┬───────────── Not used.
   │ │ ┌─────────── Bottom Ranged
   │ │ │ ┌───────── Bottom Melee
   │ │ │ │ ┌─────── Middle Ranged
   │ │ │ │ │ ┌───── Middle Melee
   │ │ │ │ │ │ ┌─── Top Ranged
   │ │ │ │ │ │ │ ┌─ Top Melee
   │ │ │ │ │ │ │ │
   0 0 0 0 0 0 0 0
```

If we take a look at the barracks status information we can see that all the information about the 8 towers are stored (1 if they exist, 0 if they were destroyed).  To get to this information we'll need to mask and shift our barracks values.

```apex
Integer value = 53;
// Binary 00110101

Integer BOTTOM_MASK_RANGED = 32; // Binary 00100000
Integer BOTTOM_OFFSET_RANGED = 5;

Integer BOTTOM_MASK_MELEE = 16; // Binary 00010000
Integer BOTTOM_OFFSET_MELEE = 4;

Integer MIDDLE_MASK_RANGED = 8; // Binary 00001000
Integer MIDDLE_OFFSET_RANGED = 3;

Integer MIDDLE_MASK_MELEE = 4; // Binary 00000100
Integer MIDDLE_OFFSET_MELEE = 2;

Integer TOP_MASK_RANGED = 2; // Binary 00000010
Integer TOP_OFFSET_RANGED = 1;

Integer TOP_MASK_MELEE = 1; // Binary 00000001
Integer TOP_OFFSET_MELEE = 0;

Integer bottomRanged = (value & BOTTOM_MASK_RANGED) >> BOTTOM_OFFSET_RANGED;// 1
Integer bottomMelee = (value & BOTTOM_MASK_MELEE) >> BOTTOM_OFFSET_MELEE; // 1
Integer middleRanged = (value & MIDDLE_MASK_RANGED) >> MIDDLE_OFFSET_RANGED;// 0
Integer middleMelee = (value & MIDDLE_MASK_MELEE) >> MIDDLE_OFFSET_MELEE; // 1
Integer topRanged = (value & TOP_MASK_RANGED) >> TOP_OFFSET_RANGED;// 0
Integer topMelee = (value & TOP_MASK_MELEE) >> TOP_OFFSET_MELEE; // 1
```

# Building the value from the parts

Now if we want to take the data about the barracks and get back the value we add the parts and shift the bits to the left.

```apex
Integer bottomRanged = 1;
Integer bottomMelee = 1;
Integer middleRanged = 0;
Integer middleMelee = 1;
Integer topRanged = 0;
Integer topMelee = 1;

Integer value = 0; // Binary 00000000

value += bottomRanged; // Binary 00000001
value <<= 1;  // Binary 00000010
value += bottomMelee;  // Binary 00000011
value <<= 1;  // Binary 00000110
value += middleRanged; // Binary 00000110
value <<= 1; // Binary 00001100
value += middleMelee; // Binary 00001101
value <<= 1; // Binary 00011010
value += topRanged; // Binary 00011010
value <<= 1; // Binary 00110100
value += topMelee; // Binary 00110101
// Integer 53
```

# More information

If you'd like to learn more about bitmath in general, I really recommend the [arduino playground](http://playground.arduino.cc/Code/BitMath "Arduino Playground") bitmath page.  It's a great way to learn and play.  Additionally, you can [see all of the operators available in apex](https://www.salesforce.com/us/developer/docs/apexcode/Content/langCon_apex_expressions_operators_understanding.htm "Apex Operators").