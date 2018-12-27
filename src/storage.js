const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const path = require("path");

async function getConnections() {
  let keys = await s3
    .listObjectsV2({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: "salesforce/"
    })
    .promise();
  // FIXME filter on s3 side
  return keys.Contents.filter(k => k.Key.endsWith("/auth"));
}

async function get(key, jsonParse = true) {
  var content = await s3
    .getObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    })
    .promise();
  if (jsonParse === true) return JSON.parse(content.Body.toString());
  else return content.Body.toString();
}

async function put(key, content, jsonStringify = true) {
  return s3
    .putObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: jsonStringify ? JSON.stringify(content) : content
    })
    .promise();
}

async function archiveRestObject(keyPrefix, obj) {
  let key = path.join(keyPrefix, obj.attributes.url, new Date().toISOString());
  return put(key, obj);
}

module.exports = {
  getConnections: getConnections,
  get: get,
  archiveRestObject: archiveRestObject
};
