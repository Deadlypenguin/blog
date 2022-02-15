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