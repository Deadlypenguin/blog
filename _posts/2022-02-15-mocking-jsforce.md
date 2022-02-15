---
post_id: 1304
title: 'Mocking JSforce with Jest'
date: 2021-03-30T11:30:00+00:00
author: pcon
layout: post
description: How to set up mocking in Jest for JSforce to be able to test javascript that relies on JSforce without making remote calls.
permalink: /2022/02/15/mocking-jsforce/
thumbnail: /assets/img/2022/02/15/post_thumbnail.png
categories:
-
tags:
- jsforce
- javascript
- jest
- testing
---

Testing is one of the most important things you can do your code.  However, when using a library that requires access to a remote system unit testing can become problematic.  You don't want to have to have a real connection and pull down real data since this is slow and requires anyone contributing to your project to set up the remote system as well.  This is where mocking comes in with Jest.

Mocking allows you to detach a module from making a remote call and allows you to define the data that it returns.  This means that you can modify the data how you need to provide a small data set or a large data set or even error out on demand.

In this post, we're going to look at how to set up mocking for JSforce to test logging in and mocking out making queries.

<!--more-->

# Javascript module
Let's create a simple Javascript module that logs into Salesforce and takes that connection to make a query and returns results.

```javascript
const jsforce = require('jsforce');

/**
 * Logs in using environment variables
 * @returns {Promise} A promise for the connection
 */
function login() {
    return new Promise(function (resolve, reject) {
        const conn = new jsforce.Connection();
        conn.login(
            process.env.SFDC_USERNAME,
            process.env.SFDC_PASSWORD,
            function (error) {
                if (error) {
                    reject(error);
                } else {
                    resolve(conn);
                }
            }
        );
    });
}

/**
 * Queries Salesforce
 * @param {String} query_string The query
 * @returns {Promise} A promise for the query results
 */
function query(query_string) {
    return new Promise(function (resolve, reject) {
        login()
            .then(function (conn) {
                conn.query(query_string, function (error, results) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            })
            .catch(reject);
    });
}

module.exports = {
    login: login,
    query: query
};
```
[Link to example](https://github.com/Deadlypenguin/blog/tree/master/examples/2022-02-15-mocking-jsforce/index.js)

# Mocking JSforce
Now we need to mock this out so that it never tries to create a connection to Salesforce when we call the `login` function

```javascript
const jsforce = jest.createMockFromModule('jsforce');

const __loginMock = jest.fn(function (user, pass, cb) {
    cb();
});

const __queryMock = jest.fn(function (query_string, cb) {
    cb();
});

jsforce.__loginMock = __loginMock;
jsforce.__queryMock = __queryMock;
jsforce.Connection = jest.fn().mockImplementation(() => {
    return {
        login: jsforce.__loginMock,
        query: jsforce.__queryMock
    };
});

module.exports = jsforce;
```
[Link to example](https://github.com/Deadlypenguin/blog/tree/master/examples/2022-02-15-mocking-jsforce/__mocks__/jsforce.js)

Let's break down this mock to explain what we're doing.

```javascript
const __loginMock = jest.fn(function (user, pass, cb) {
    cb();
});

const __queryMock = jest.fn(function (query_string, cb) {
    cb();
});
```

Here we define mocked functions that no matter what is passed in, we call the `cb()` function without any results so this will count as a "successful" login or a query with no results

```javascript
jsforce.__loginMock = __loginMock;
jsforce.__queryMock = __queryMock;
jsforce.Connection = jest.fn().mockImplementation(() => {
    return {
        login: jsforce.__loginMock,
        query: jsforce.__queryMock
    };
});
```

Here we set our `__loginMock` and `__queryMock` functions to be able to access it in our test.  We then also mock out the `Connection` object so that we return our new login and query functions as part of our connection.

This mock is the bare minimum we need but it doesn't actually do anything.  We will re-mock these function in our tests to change their behavior.  But if we don't mock it now then we could accidentally call a function

# Jest tests

```javascript
const index = require('..');
const jsforce = require('jsforce');

const SFDC_USERNAME = 'bob@example.com';
const SFDC_PASSWORD = 'test123';

jest.mock('jsforce');

describe('login', function () {
    beforeEach(function () {
        process.env = {
            SFDC_USERNAME: SFDC_USERNAME,
            SFDC_PASSWORD: SFDC_PASSWORD
        };

        jsforce.__loginMock = jest.fn(function (user, pass, cb) {
            cb();
        });
    });

    afterEach(function () {
        jest.clearAllMocks();
    });

    test('valid login', function () {
        expect.assertions(2);

        return index.login().then(function () {
            return new Promise(function (resolve) {
                expect(jsforce.__loginMock).toHaveBeenCalled();
                expect(jsforce.__loginMock).toHaveBeenCalledWith(SFDC_USERNAME, SFDC_PASSWORD, expect.anything());
                resolve();
            });
        });
    });

    test('login failed', function () {
        expect.assertions(3);

        jsforce.__loginMock = jest.fn(function (user, pass, cb) {
            cb(new Error('Invalid password'));
        });

        return index.login().catch(function (error) {
            return new Promise(function (resolve) {
                expect(error.message).toBe('Invalid password');
                expect(jsforce.__loginMock).toHaveBeenCalled();
                expect(jsforce.__loginMock).toHaveBeenCalledWith(SFDC_USERNAME, SFDC_PASSWORD, expect.anything());
                resolve();
            });
        });
    });
});

describe('query', function () {
    beforeEach(function () {
        process.env = {
            SFDC_USERNAME: SFDC_USERNAME,
            SFDC_PASSWORD: SFDC_PASSWORD
        };

        jsforce.__loginMock = jest.fn(function (user, pass, cb) {
            cb();
        });

        jsforce.__queryMock = jest.fn(function (query_string, cb) {
            cb();
        });
    });

    afterEach(function () {
        jest.clearAllMocks();
    });

    test('login failed', function () {
        expect.assertions(3);

        jsforce.__loginMock = jest.fn(function (user, pass, cb) {
            cb(new Error('Invalid password'));
        });

        return index.query().catch(function (error) {
            return new Promise(function (resolve) {
                expect(error.message).toBe('Invalid password');
                expect(jsforce.__loginMock).toHaveBeenCalled();
                expect(jsforce.__loginMock).toHaveBeenCalledWith(SFDC_USERNAME, SFDC_PASSWORD, expect.anything());
                resolve();
            });
        });
    });

    test('results', function () {
        expect.assertions(5);

        const data = [
            {
                Id: '1234567890abcdefg1',
                Name: 'Example1'
            },
            {
                Id: '1234567890abcdefg2',
                Name: 'Example2'
            }
        ];

        jsforce.__queryMock = jest.fn(function (query_string, cb) {
            cb(undefined, data);
        });

        const query_string = 'select Id, Name from Account';

        return index.query(query_string).then(function (results) {
            return new Promise(function (resolve) {
                expect(results).toEqual(data);
                expect(jsforce.__queryMock).toHaveBeenCalled();
                expect(jsforce.__queryMock).toHaveBeenCalledWith(query_string, expect.anything());
                expect(jsforce.__loginMock).toHaveBeenCalled();
                expect(jsforce.__loginMock).toHaveBeenCalledWith(SFDC_USERNAME, SFDC_PASSWORD, expect.anything());
                resolve();
            });
        });
    });

    test('error', function () {
        expect.assertions(5);

        jsforce.__queryMock = jest.fn(function (query_string, cb) {
            cb(new Error('Invalid query'));
        });

        const query_string = 'select Id, Name from Account';

        return index.query(query_string).catch(function (error) {
            return new Promise(function (resolve) {
                expect(error.message).toBe('Invalid query');
                expect(jsforce.__queryMock).toHaveBeenCalled();
                expect(jsforce.__queryMock).toHaveBeenCalledWith(query_string, expect.anything());
                expect(jsforce.__loginMock).toHaveBeenCalled();
                expect(jsforce.__loginMock).toHaveBeenCalledWith(SFDC_USERNAME, SFDC_PASSWORD, expect.anything());
                resolve();
            });
        });
    });
});
```
[Link to example](https://github.com/Deadlypenguin/blog/tree/master/examples/2022-02-15-mocking-jsforce/__tests__/index.test.js)

This test class contains two groupings of tests (login and query) and then five total tests for these.  Let's start by looking at the login tests to see how we can use mocks to test our login call

```javascript
jsforce.__loginMock = jest.fn(function (user, pass, cb) {
    cb();
});
```

In our `beforeEach` we reset our login function to the default so that it will always be "successful"

```javascript
test('valid login', function () {
    expect.assertions(2);

    return index.login().then(function () {
        return new Promise(function (resolve) {
            expect(jsforce.__loginMock).toHaveBeenCalled();
            expect(jsforce.__loginMock).toHaveBeenCalledWith(SFDC_USERNAME, SFDC_PASSWORD, expect.anything());
            resolve();
        });
    });
});
```

Then in our valid test we call our login function and check to make sure it was called with what we expected.

Now for our failed test, we need to change how the mock works

```javascript
jsforce.__loginMock = jest.fn(function (user, pass, cb) {
    cb(new Error('Invalid password'));
});
```

Here we make our callback with an error so that our main code will reject the promise.

```javascript
return index.login().catch(function (error) {
    return new Promise(function (resolve) {
        expect(error.message).toBe('Invalid password');
        expect(jsforce.__loginMock).toHaveBeenCalled();
        expect(jsforce.__loginMock).toHaveBeenCalledWith(SFDC_USERNAME, SFDC_PASSWORD, expect.anything());
        resolve();
    });
});
```

Here we call `catch` and check that the `error.message` is what we expect and that the mock function was called with the right parameters.

We do similar things with our query functions either returning our `data` or by making a callback with an error that the promise then rejects.

# Conclusion

Once you get the framework for mocking calls down, it's not super difficult to reproduce.  It can be a bit time consuming and a bit fiddly in spots but it's worth being able fully test your code.  Just remember to create your module mock in `__mocks__` and then overwrite your mocked function in your test to return the data you need.