const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const cookieSession = require("cookie-session");
const jsforce = require("jsforce");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const request = require("request");

app.set("trust proxy", 1);
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_SECRET || "owijoIJFOEFJE*083839*#F#<3", "key2"]
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

  const keyPrefix = path.join("salesforce", u.organizationId, u.id);
  const fileName = path.join(keyPrefix, "auth");

  let { instanceUrl, accessToken, refreshToken, userInfo } = conn;
  let authToSave = { instanceUrl, accessToken, refreshToken, userInfo };

  await s3
    .putObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: JSON.stringify(authToSave)
    })
    .promise();

  req.session.keyPrefix = keyPrefix;
  req.session.accessToken = conn.accessToken;
  req.session.instanceUrl = conn.instanceUrl;
  req.session.refreshToken = conn.refreshToken;

  res.redirect("/home");
});

app.use("/api", require("./routes/api"));

// app.use(express.static(path.join(__dirname, "frontend/build")));
app.get("*", (req, res) => {
  return res.sendFile(path.join(__dirname + "/frontend/build/index.html"));
  // var newurl = "http://localhost:5100" + req.url;
  // request(newurl).pipe(res);
});

app.listen(PORT, function() {
  console.log("Server is running on Port: ", PORT);
});
