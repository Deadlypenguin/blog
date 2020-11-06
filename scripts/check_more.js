const path = require('path');

const utils = require('./utils');

const POST_PATH = path.join(__dirname, '../_posts');
const MORE_TAG = '<!--more-->';

const checkForMore = utils.checkForContentList.bind(null, POST_PATH, MORE_TAG);

utils.getFiles(POST_PATH)
    .then(checkForMore)
    .catch(function (err) {
        console.error(err);
        process.exit(-1);
    });