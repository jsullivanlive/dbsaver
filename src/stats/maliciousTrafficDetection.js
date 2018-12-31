const readline = require("readline");
const fs = require("fs");

async function maliciousTrafficDetection(keyPrefix, conn, storage) {
  // load blocklists
  // TODO convert to faster data source, cache, etc.

  const fileStream = fs.createReadStream("temp/ipsum.txt");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.
  let blockList = [];
  for await (const line of rl) {
    blockList.push(line.split("\t")[0]);
  }

  const sessions = await conn
    .sobject("AuthSession")
    .select("*, LoginGeo.*, LoginHistory.*")
    .where("CreatedDate = last_n_days:7")
    .execute();
  const ips = [...new Set(sessions.map(s => s.SourceIp))];
  const badIpsFound = ips.filter(i => blockList.indexOf(i) > -1);
  const goodIcon = "noun_Ok_108699.png";
  const badIcon = "noun_Close_316878.png";
  const icon = badIpsFound.length ? badIcon : goodIcon;

  return {
    html: `
        <div>
            <h3><img src="https://app.dbsaver.com/public/${icon}"/>Malicious traffic Detection</h3>
            <p>Scannig ${sessions.length} sessions with ${
      ips.length
    } IP addresses against blocklists with ${blockList.length} IP addresses.</p>
        <div>
            ${
              badIpsFound.length
                ? `<strong>Bad IPs: ${badIpsFound}</strong>`
                : `No bad IPs found`
            }
        </div>
    `
  };
}

module.exports = maliciousTrafficDetection;
