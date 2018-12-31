const salesforce = require("../src/salesforce");
const storage = require("../src/storage");
const path = require("path");
const mail = require("../src/mail");
const fs = require("fs");

async function filterEnabled(keys) {
  let res = [];
  for (const k of keys) {
    let keyPrefix = path.dirname(k.Key);
    // TODO error handling
    let settings = await storage.get(path.join(keyPrefix, "settings"));
    if (settings.daily === true) {
      res.push(keyPrefix);
    }
  }
  return res;
}

async function makeEmail(keyPrefix) {
  console.log("sending email: ", keyPrefix);
  // TODO loop through files in stats folder to process dynamically
  const auth = await storage.get(path.join(keyPrefix, "auth"));
  const settings = await storage.get(path.join(keyPrefix, "settings"));
  let conn = await salesforce.thawConnection(keyPrefix);

  // get user so we know where to send email

  let identity = await conn.identity();
  storage.archive(keyPrefix, "_identity", identity);
  let email = identity.Email;

  let desc = await conn.describeGlobal();
  storage.archive(keyPrefix, "_describeGlobal", desc);

  let organization = await conn
    .sobject("Organization")
    .select("*")
    .execute();

  if (organization.length != 1)
    throw new Error("organization count != 1: " + organization.length);
  organization = organization[0];
  storage.archiveRestObject(keyPrefix, organization);

  let stats = await Promise.all(
    [
      "../src/stats/sessions",
      "../src/stats/users",
      "../src/stats/apiUsage",
      "../src/stats/maliciousTrafficDetection",
      "../src/stats/setupAuditTrail"
    ].map(f => require(f)(keyPrefix, conn, storage))
  );

  return `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      border-radius: 4px;
      border: 1px solid rgb(199, 208, 212);
      max-width: 720px;
      color: rgb(47, 41, 54);
      margin-left: auto;
      margin-right: auto;
      ">
      <img style="
        margin-left: auto;
        margin-right: auto;
        display: block;
      " src="http://localhost:5000/public/logo-dark.png"/>
      <h2>Daily System Report for ${organization.Name}</h2>
      ${stats.map(s => s.html).join("<hr/>")}
      <hr/>
      Notification Settings
      |
      Home
    </div>
  `;
}

async function sendEmail(keyPrefix) {
  // fs.writeFileSync("temp.html", await makeEmail(keyPrefix));
  // require("open")("./temp.html");
  // process.exit();
  mail.send(
    email,
    `Daily System Status ${new Date().toISOString()}`,
    await makeEmail(keyPrefix)
  );
}

(async () => {
  console.log("Starting...");
  storage
    .getConnections()
    .then(filterEnabled)
    .then(async keyPrefixes => {
      for (keyPrefix of keyPrefixes) {
        await sendEmail(keyPrefix);
      }
    })
    .then(e => console.log("Done."));
})();
