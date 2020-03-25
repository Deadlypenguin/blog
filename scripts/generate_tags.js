const path = require('path');

const utils = require('./utils');

const POST_PATH = path.join(__dirname, '../_posts');
const TAG_PATH = path.join(__dirname, '../_tag');
const TAGS_NAME = 'attributes.tags';

/**
 * Gets the file contents
 * @param {String} tag The tag name
 * @returns {String} The file contents
 */
function fileContent(tag) {
    return `---\nname: ${tag}\npermalink: "/tag/${tag}"\n---`;
}

/**
 * Gets the file path
 * @param {String} tag The tag name
 * @returns {String} The file path
 */
function filePath(tag) {
    return path.join(TAG_PATH, `${tag}.md`);
}

const deleteFile = utils.deleteFile.bind(null, TAG_PATH);
const cleanFiles = utils.cleanFiles.bind(null, TAG_PATH, deleteFile);
const getFiles = utils.getFiles.bind(null, POST_PATH);
const getTags = utils.getSpecificFrontmatter.bind(null, POST_PATH, TAGS_NAME);
const getAllTags = utils.getAllSpecificFrontmatter.bind(null, getTags);
const writeTag = utils.writeFile.bind(null, filePath, fileContent);
const writeTags = utils.writeFiles.bind(null, writeTag);

cleanFiles()
    .then(getFiles)
    .then(getAllTags)
    .then(writeTags)
    .catch(function (err) {
        console.error(err);
    });