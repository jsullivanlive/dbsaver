const salesforce = require("../src/salesforce");
const storage = require("../src/storage");
const path = require("path");

// TODO get all connections

async function filterEnabled(keys) {
  let res = [];
  for (const k of keys) {
    let keyPrefix = path.dirname(k.Key);
    let settings = await storage.get(path.join(keyPrefix, "settings"));
    console.log(settings);
    if (JSON.parse(settings).daily) {
      res.push(k);
    }
  }
  return res;
}

(async () => {
  console.log("Starting...");
  let connections = await storage.getConnections();
  console.log(connections);
  connections = filterEnabled(connections);
  console.log(connections);
  console.log("Done.");
})();
