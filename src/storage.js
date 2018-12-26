const AWS = require("aws-sdk");
const s3 = new AWS.S3();

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

async function get(key) {
  var content = await s3
    .getObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    })
    .promise();
  return content.Body.toString();
}

module.exports = {
  getConnections: getConnections,
  get: get
};
