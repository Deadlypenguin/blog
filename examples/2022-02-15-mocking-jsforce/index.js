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