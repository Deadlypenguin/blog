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