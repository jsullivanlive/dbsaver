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
  // TODO paginate
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

async function archive(keyPrefix, localPath, content) {
  if (!localPath) throw new Error("missing localPath");
  let fullKeyPath = path.join(keyPrefix, localPath, new Date().toISOString());
  return put(fullKeyPath, content);
}

async function archiveRestObject(keyPrefix, obj) {
  return archive(keyPrefix, obj.attributes.url, obj);
}

function signedGetUrl(key, seconds) {
  var params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: seconds
  };
  return s3.getSignedUrl("getObject", params);
}

module.exports = {
  getConnections: getConnections,
  get: get,
  put: put,
  archive: archive,
  archiveRestObject: archiveRestObject,
  signedGetUrl: signedGetUrl
};
