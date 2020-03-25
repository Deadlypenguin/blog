const lodash = require('lodash');
const path = require('path');

const utils = require('./utils');

const POST_PATH = path.join(__dirname, '../_posts');
const CATEGORIES_NAME = 'attributes.categories';
const TAGS_NAME = 'attributes.tags';

const checkCapitalization = utils.checkSpecificFrontmatterLists.bind(null, POST_PATH, TAGS_NAME, utils.getCapitals);

/**
 * Check that tags are not in the categories
 * @param {object} data The data
 * @returns {String[]} A list of tags that appear also in the categories
 */
function categoryChecker(data) {
    const categories = lodash.get(data, CATEGORIES_NAME);
    const tags = lodash.get(data, TAGS_NAME);
    const results = [];

    lodash.forEach(tags, function (tag) {
        if (lodash.includes(categories, tag)) {
            results.push(tag);
        }
    });

    return results;
}

const checkTagsNotCategories = utils.checkFrontmatter.bind(null, POST_PATH, categoryChecker);

utils.getFiles(POST_PATH)
    .then(checkCapitalization)
    .then(checkTagsNotCategories)
    .catch(function (err) {
        console.error(err);
        process.exit(-1);
    });