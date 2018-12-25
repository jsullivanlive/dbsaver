const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 4200;
const cors = require("cors");
const session = require("express-session");
const jsforce = require("jsforce");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.COOKIE_SECRET || "owijoIJFOEFJE*083839*#F#<3",
    resave: true,
    saveUninitialized: true
  })
);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const oauth2 = new jsforce.OAuth2({
  loginUrl: "https://login.salesforce.com",
  clientId: process.env.SALESFORCE_OAUTH_CLIENT_ID || "MISSING",
  clientSecret: process.env.SALESFORCE_OAUTH_CLIENT_SECRET,
  redirectUri: process.env.SALESFORCE_OAUTH_REDIRECT_URI
});

app.get("/auth", (req, res) => {
  res.redirect(oauth2.getAuthorizationUrl({ scope: "api refresh_token" }));
});

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("missing code");
  const conn = new jsforce.Connection({ oauth2: oauth2 });
  try {
    let userInfo = await conn.authorize(code);
  } catch (e) {
    return res
      .status(400)
      .send(
        `error connecting to salesforce, <a href="/auth">click here to try again</a>`
      );
  }

  // save to s3

  const u = conn.userInfo;

  if (!u.id || !u.organizationId)
    return res.status(400).send("userInfo invalid");

  const fileName = `salesforce/${u.organizationId}/${u.id}/auth`;

  let { instanceUrl, accessToken, refreshToken, userInfo } = conn;
  let authToSave = { instanceUrl, accessToken, refreshToken, userInfo };

  await s3
    .putObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: JSON.stringify(authToSave)
    })
    .promise();

  req.session.path = fileName;

  req.session.accessToken = conn.accessToken;
  req.session.instanceUrl = conn.instanceUrl;
  req.session.refreshToken = conn.refreshToken;

  res.redirect("/home");
});

function getConnection(session) {
  return new jsforce.Connection({
    oauth2: { oauth2 },
    accessToken: session.accessToken,
    instanceUrl: session.instanceUrl
  });
}

async function q(session, soql) {
  return getConnection(session).query(soql);
}

app.get("/api/user_count", async (req, res) => {
  s3.listObjectsV2({ Bucket: "officer-k", Prefix: "salesforce/" })
    .promise()
    .then(buckets => {
      res.json(buckets.KeyCount);
    })
    .catch(e => res.status(400).json({ error: e }));
});

// JUST FOR TESTING
app.get("/api/session", async (req, res) => {
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

app.use(express.static(path.join(__dirname, "frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/frontend/build/index.html"));
});

app.listen(PORT, function() {
  console.log("Server is running on Port: ", PORT);
});
