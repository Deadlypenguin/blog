const fm = require('front-matter');
const fs = require('fs');
const lodash = require('lodash');
const path = require('path');
const Q = require('q');

const POST_PATH = path.join(__dirname, '../_posts');
const TAG_PATH = path.join(__dirname, '../_tag');
const TAGS_NAME = 'attributes.tags';

/**
 * Deletes the file
 * @param {String} file The file name
 * @returns {Promise} A promise for when the file is deleted
 */
function deleteFile(file) {
    return new Promise(function (resolve, reject) {
        fs.unlink(path.join(TAG_PATH, file), function (err) {
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
        fs.readdir(TAG_PATH, function (dir_err, files) {
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
 * Gets the tags for a given filename
 * @param {String} filename The filename
 * @returns {Promise} A promise fo the tags
 */
function getTags(filename) {
    return new Promise(function (resolve, reject) {
        const fpath = path.join(POST_PATH, filename);
        fs.readFile(fpath, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(lodash.get(fm(data), TAGS_NAME));
            }
        });
    });
}

/**
 * Get all the tags we know about
 * @param {String[]} filenames The filenames to read
 * @returns {Promise} A promise for all the tags
 */
function getAllTags(filenames) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        var tags = [];

        lodash.forEach(filenames, function (filename) {
            promises.push(getTags(filename));
        });

        Q.allSettled(promises)
            .then(function (results) {
                lodash.forEach(results, function (result) {
                    if (result.state === 'fulfilled') {
                        tags = lodash.union(tags, result.value);
                    } else {
                        console.error(result.reason);
                    }
                });

                resolve(tags);
            })
            .catch(reject);
    });
}

/**
 * Writes out the tag markdown file
 * @param {String} tag The tag name
 * @returns {Promise} A promise for when the tag file has been written
 */
function writeTag(tag) {
    return new Promise(function (resolve, reject) {
        const fileContent = `---\nname: ${tag}\npermalink: "/tag/${tag}"\n---`;
        const fpath = path.join(TAG_PATH, `${tag}.md`);

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
 * Writes out all the tag markdown files
 * @param {String[]} tags The tags
 * @returns {Promise} A promise for when all the tags have been written
 */
function writeTags(tags) {
    return new Promise(function (resolve, reject) {
        var promises = [];

        lodash.forEach(tags, function (tag) {
            promises.push(writeTag(tag));
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
    .then(getAllTags)
    .then(writeTags)
    .catch(function (err) {
        console.error(err);
    });