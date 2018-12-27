const salesforce = require("../src/salesforce");
const storage = require("../src/storage");
const path = require("path");
const mail = require("../src/mail");

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
  console.log([auth, settings]);
  let conn = await salesforce.thawConnection(auth);

  // get user so we know where to send email

  let user = await conn.sobject("User").retrieve(auth.userInfo.id);
  storage.archiveRestObject(keyPrefix, user);
  console.log(user);

  let email = user.Email;

  mail.send(email, `Daily System Status ${new Date()}`, "Testing 123");
}

(async () => {
  console.log("Starting...");
  storage
    .getConnections()
    .then(filterEnabled)
    .then(async keyPrefixes => {
      console.log(keyPrefixes);
      for (keyPrefix of keyPrefixes) {
        await sendEmail(keyPrefix);
      }
    })
    .then(e => console.log("Done."));
})();
