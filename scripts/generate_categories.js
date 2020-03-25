const path = require('path');

const utils = require('./utils');

const POST_PATH = path.join(__dirname, '../_posts');
const CATEGORY_PATH = path.join(__dirname, '../_category');
const CATEGORIES_NAME = 'attributes.categories';

/**
 * Gets the file contents
 * @param {String} category The category name
 * @returns {String} The file contents
 */
function fileContent(category) {
    return `---\nname: ${category}\npermalink: "/category/${category}"\n---`;
}

/**
 * Gets the file path
 * @param {String} category The category name
 * @returns {String} The file path
 */
function filePath(category) {
    return path.join(CATEGORY_PATH, `${category}.md`);
}

const deleteFile = utils.deleteFile.bind(null, CATEGORY_PATH);
const cleanFiles = utils.cleanFiles.bind(null, CATEGORY_PATH, deleteFile);
const getFiles = utils.getFiles.bind(null, POST_PATH);
const getCategories = utils.getSpecificFrontmatter.bind(null, POST_PATH, CATEGORIES_NAME);
const getAllCategories = utils.getAllSpecificFrontmatter.bind(null, getCategories);
const writeCategory = utils.writeFile.bind(null, filePath, fileContent);
const writeCategories = utils.writeFiles.bind(null, writeCategory);

cleanFiles()
    .then(getFiles)
    .then(getAllCategories)
    .then(writeCategories)
    .catch(function (err) {
        console.error(err);
    });