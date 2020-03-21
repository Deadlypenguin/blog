const fm = require('front-matter');
const fs = require('fs');
const lodash = require('lodash');
const path = require('path');
const Q = require('q');

const POST_PATH = path.join(__dirname, '../_posts');
const CATEGORY_PATH = path.join(__dirname, '../_category');
const CATEGORIES_NAME = 'attributes.categories';

/**
 * Deletes the file
 * @param {String} file The file name
 * @returns {Promise} A promise for when the file is deleted
 */
function deleteFile(file) {
    return new Promise(function (resolve, reject) {
        fs.unlink(path.join(CATEGORY_PATH, file), function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Removes all the existing tag files
 * @returns {Promise} A promise for when the files are deleted
 */
function cleanFiles() {
    return new Promise(function (resolve, reject) {
        fs.readdir(CATEGORY_PATH, function (dir_err, files) {
            var promises = [];

            if (dir_err) {
                reject(dir_err);
            } else {
                lodash.forEach(files, function (file) {
                    promises.push(deleteFile(file));
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
 * Get all the files in the post directory
 * @returns {Promise} A promise for when the files are listed
 */
function getFiles() {
    return new Promise(function (resolve, reject) {
        fs.readdir(POST_PATH, function (err, files) {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

/**
 * Gets the categories for a given filename
 * @param {String} filename The filename
 * @returns {Promise} A promise fo the categories
 */
function getCategories(filename) {
    return new Promise(function (resolve, reject) {
        const fpath = path.join(POST_PATH, filename);
        fs.readFile(fpath, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(lodash.get(fm(data), CATEGORIES_NAME));
            }
        });
    });
}

/**
 * Get all the categories we know about
 * @param {String[]} filenames The filenames to read
 * @returns {Promise} A promise for all the categories
 */
function getAllCategories(filenames) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        var categories = [];

        lodash.forEach(filenames, function (filename) {
            promises.push(getCategories(filename));
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
 * Writes out the category markdown file
 * @param {String} category The category name
 * @returns {Promise} A promise for when the category file has been written
 */
function writeCategory(category) {
    return new Promise(function (resolve, reject) {
        const fileContent = `---\nname: ${category}\npermalink: "/category/${category}"\n---`;
        const fpath = path.join(CATEGORY_PATH, `${category}.md`);

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
 * Writes out all the category markdown files
 * @param {String[]} categories The categories
 * @returns {Promise} A promise for when all the categories have been written
 */
function writeCategories(categories) {
    return new Promise(function (resolve, reject) {
        var promises = [];

        lodash.forEach(categories, function (category) {
            promises.push(writeCategory(category));
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
cleanFiles()
    .then(getFiles)
    .then(getAllCategories)
    .then(writeCategories)
    .catch(function (err) {
        console.error(err);
    });