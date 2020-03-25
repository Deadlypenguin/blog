const fm = require('front-matter');
const fs = require('fs');
const lodash = require('lodash');
const path = require('path');
const Q = require('q');

/**
 * Checks the front matter for a list and throws an error if the list doesn't meet the checker
 * @param {String} root_path The root path of the file
 * @param {Function} checker_fn The function to filter the frontmatter data on
 * @param {String} filename The filename to check
 * @returns {Promise} A promise for when the files have been checked
 */
function checkFrontmatterFile(root_path, checker_fn, filename) {
    return new Promise(function (resolve, reject) {
        getFrontmatter(root_path, filename)
            .then(function (data) {
                const results = checker_fn(data);

                if (lodash.isEmpty(results)) {
                    resolve();
                } else {
                    reject(`${filename} => ${lodash.join(results)}`);
                }
            }).catch(reject);
    });
}

/**
 * Checks the front matter for a list and throws an error if the list doesn't meet the checker
 * @param {String} root_path The root path of the file
 * @param {String} path The frontmatter path to check
 * @param {Function} checker_fn The function to filter the frontmatter data on
 * @param {String} filename The filename to check
 * @returns {Promise} A promise for when the files have been checked
 */
function checkSpecificFrontmatterFile(root_path, path, checker_fn, filename) {
    return new Promise(function (resolve, reject) {
        getSpecificFrontmatter(root_path, path, filename)
            .then(function (data) {
                const results = checker_fn(data);

                if (lodash.isEmpty(results)) {
                    resolve();
                } else {
                    reject(`${filename} => ${lodash.join(results)}`);
                }
            }).catch(reject);
    });
}

/**
 * Checks the front matter and throws an error if the checker returns a non-empty list
 * @param {String} root_path The root path of the file
 * @param {Function} checker_fn The function to filter the frontmatter data on
 * @param {String[]} filenames The filenames to check
 * @returns {Promise} A promise for when the files have been checked
 */
function checkFrontmatter(root_path, checker_fn, filenames) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        var errors = [];

        lodash.forEach(filenames, function (filename) {
            promises.push(checkFrontmatterFile(root_path, checker_fn, filename));
        });

        Q.allSettled(promises)
            .then(function (results) {
                lodash.forEach(results, function (result) {
                    if (result.state !== 'fulfilled') {
                        errors.push(result.reason);
                    }
                });

                if (lodash.isEmpty(errors)) {
                    resolve(filenames);
                } else {
                    reject(lodash.join(errors, '\n'));
                }
            })
            .catch(reject);
    });
}

/**
 * Checks the front matter for a list and throws an error if the list doesn't meet the checker
 * @param {String} root_path The root path of the file
 * @param {String} path The frontmatter path to check
 * @param {Function} checker_fn The function to filter the frontmatter data on
 * @param {String[]} filenames The filenames to check
 * @returns {Promise} A promise for when the files have been checked
 */
function checkSpecificFrontmatterLists(root_path, path, checker_fn, filenames) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        var errors = [];

        lodash.forEach(filenames, function (filename) {
            promises.push(checkSpecificFrontmatterFile(root_path, path, checker_fn, filename));
        });

        Q.allSettled(promises)
            .then(function (results) {
                lodash.forEach(results, function (result) {
                    if (result.state !== 'fulfilled') {
                        errors.push(result.reason);
                    }
                });

                if (lodash.isEmpty(errors)) {
                    resolve(filenames);
                } else {
                    reject(lodash.join(errors, '\n'));
                }
            })
            .catch(reject);
    });
}

/**
 * Removes all the existing files in a path
 * @param {String} root_path The root path
 * @param {Function} delete_fn The function to call to delete
 * @returns {Promise} A promise for when the files are deleted
 */
function cleanFiles(root_path, delete_fn) {
    return new Promise(function (resolve, reject) {
        fs.readdir(root_path, function (dir_err, files) {
            var promises = [];

            if (dir_err) {
                reject(dir_err);
            } else {
                lodash.forEach(files, function (file) {
                    promises.push(delete_fn(file));
                });
            }

            Q.allSettled(promises)
                .then(function (results) {
                    lodash.forEach(results, function (result) {
                        if (result.state !== 'fulfilled') {
                            console.error(result.reason);
                        }
                    });

                    resolve();
                })
                .catch(reject);
        });
    });
}

/**
 * Deletes the file
 * @param {String} root_path The root path
 * @param {String} file The file name
 * @returns {Promise} A promise for when the file is deleted
 */
function deleteFile(root_path, file) {
    return new Promise(function (resolve, reject) {
        fs.unlink(path.join(root_path, file), function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Gets back strings that have capital letters in it
 * @param {String[]} data An array of strings to check if any of them have capitalization
 * @returns {String[]} Any that have capitalized letters
 */
function getCapitals(data) {
    return lodash.filter(data, function (entry) {
        return entry !== lodash.toLower(entry);
    });
}

/**
 * Get all the files in the post directory
 * @param {String} path The folder path
 * @returns {Promise} A promise for when the files are listed
 */
function getFiles(path) {
    return new Promise(function (resolve, reject) {
        fs.readdir(path, function (err, files) {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

/**
 * Gets the frontmatter for a specified file
 * @param {String} root_path The root path
 * @param {String} filename The filename
 * @returns {Promise} A promise for when the frontmatter is returned
 */
function getFrontmatter(root_path, filename) {
    return new Promise(function (resolve, reject) {
        const fpath = path.join(root_path, filename);
        fs.readFile(fpath, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(fm(data));
            }
        });
    });
}

/**
 * Gets a specific frontmatter entry
 * @param {String} root_path The root path
 * @param {String} path The selector for which frontmatter
 * @param {String} filename The filename
 * @returns {Promise} A promise for the specific frontmatter
 */
function getSpecificFrontmatter(root_path, path, filename) {
    return new Promise(function (resolve, reject) {
        getFrontmatter(root_path, filename)
            .then(function (data) {
                resolve(lodash.get(data, path));
            }).catch(reject);
    });
}

/**
 * Get all the categories we know about
 * @param {Function} frontmatter_fn The function to call to get the frontmatter
 * @param {String[]} filenames The filenames to read
 * @returns {Promise} A promise for all the categories
 */
function getAllSpecificFrontmatter(frontmatter_fn, filenames) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        var categories = [];

        lodash.forEach(filenames, function (filename) {
            promises.push(frontmatter_fn(filename));
        });

        Q.allSettled(promises)
            .then(function (results) {
                lodash.forEach(results, function (result) {
                    if (result.state === 'fulfilled') {
                        categories = lodash.union(categories, result.value);
                    } else {
                        console.error(result.reason);
                    }
                });

                resolve(categories);
            })
            .catch(reject);
    });
}

/**
 * Writes out a file
 * @param {Function} filename_fn A function to get the filename
 * @param {Function} fileContents_fn A function to get the file contents
 * @param {Object} data The data
 * @returns {Promise} A promise for when the file is written
 */
function writeFile(filename_fn, fileContents_fn, data) {
    return new Promise(function (resolve, reject) {
        const fpath = filename_fn(data);
        const fileContent = fileContents_fn(data);

        fs.writeFile(fpath, fileContent, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Writes out a list of files by calling a function after iterating over the data
 * @param {Function} writeFile_fn The function to call to write the file
 * @param {Object[]} data The data we're using to write files
 * @returns {Promise} A promise for when the files have been written
 */
function writeFiles(writeFile_fn, data) {
    return new Promise(function (resolve, reject) {
        var promises = [];

        lodash.forEach(data, function (entry) {
            promises.push(writeFile_fn(entry));
        });

        Q.allSettled(promises)
            .then(function (results) {
                lodash.forEach(results, function (result) {
                    if (result.state !== 'fulfilled') {
                        console.error(result.reason);
                    }
                });

                resolve();
            })
            .catch(reject);
    });
}

module.exports = {
    checkFrontmatter: checkFrontmatter,
    checkSpecificFrontmatterLists: checkSpecificFrontmatterLists,
    cleanFiles: cleanFiles,
    deleteFile: deleteFile,
    getCapitals: getCapitals,
    getFiles: getFiles,
    getAllSpecificFrontmatter: getAllSpecificFrontmatter,
    getSpecificFrontmatter: getSpecificFrontmatter,
    writeFile: writeFile,
    writeFiles: writeFiles
};