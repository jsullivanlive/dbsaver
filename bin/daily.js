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

async function sendEmail(keyPrefix) {
  console.log("sending email: ", keyPrefix);
  // TODO loop through files in stats folder to process dynamically
  const auth = await storage.get(path.join(keyPrefix, "auth"));
  const settings = await storage.get(path.join(keyPrefix, "settings"));
  let conn = await salesforce.thawConnection(auth);

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

  // TODO make config way to do this
  let stats = await Promise.all([
    require("../src/stats/sessions")(keyPrefix, conn, storage),
    require("../src/stats/apiUsage")(keyPrefix, conn, storage),
    require("../src/stats/setupAuditTrail")(keyPrefix, conn, storage)
  ]);

  var emailContent =
    `<h1>Daily System Report for ${organization.Name}</h1>` +
    stats.map(s => s.html).join("<hr/>");

  mail.send(
    email,
    `Daily System Status ${new Date().toISOString()}`,
    emailContent
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
