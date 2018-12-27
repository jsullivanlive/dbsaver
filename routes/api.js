const express = require("express");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const { q } = require("../src/salesforce");
const path = require("path");
const app = express.Router();

app.get("/user_count", async (req, res) => {
  s3.listObjectsV2({ Bucket: "officer-k", Prefix: "salesforce/" })
    .promise()
    .then(buckets => {
      res.json(buckets.KeyCount);
    })
    .catch(e => res.status(400).json({ error: e }));
});

app.get("/settings", async (req, res) => {
  // TODO implement auth redirect in middleware
  if (!req.session.keyPrefix) {
    return res.status(401).send({ error: "auth required" });
  }

  // TODO enforce schema + defaults
  let content;
  try {
    content = await s3
      .getObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: path.join(req.session.keyPrefix, "settings")
      })
      .promise();
  } catch (e) {
    if (`${e}`.indexOf("NoSuchKey") > -1) res.json({});
    else res.status(500).json({ error: `${e}` });
    return;
  }

  res.send(content.Body.toString());
});

app.post("/settings", async (req, res) => {
  if (!req.session.keyPrefix) {
    return res.redirect("/auth");
  }
  // todo enfore schema, size
  // todo get settings and merge json data so we can toggle individual settings

  console.log(req.body);

  try {
    await s3
      .putObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: path.join(req.session.keyPrefix, "settings"),
        Body: JSON.stringify(req.body)
      })
      .promise();
  } catch (e) {
    res.status(400).json({ error: "error saving settings: " + e });
  }

  let content = await s3
    .getObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: path.join(req.session.keyPrefix, "settings")
    })
    .promise();
  res.send(content.Body.toString());
});

// JUST FOR TESTING
app.get("/session", async (req, res) => {
  res.json(req.session);
});

app.get("/api/profile", async (req, res) => {
  if (!req.session.accessToken) {
    return res.redirect("/auth");
  }
  // FIXME
  let soql = "SELECT id, name FROM user LIMIT 1";
  return res.json(await q(req.session, soql));
});

module.exports = app;
