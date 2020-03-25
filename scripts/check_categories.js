const path = require('path');

const utils = require('./utils');

const POST_PATH = path.join(__dirname, '../_posts');
const CATEGORIES_NAME = 'attributes.categories';

const checkCapitalization = utils.checkSpecificFrontmatterLists.bind(null, POST_PATH, CATEGORIES_NAME, utils.getCapitals);

utils.getFiles(POST_PATH)
    .then(checkCapitalization)
    .catch(function (err) {
        console.error(err);
        process.exit(-1);
    });