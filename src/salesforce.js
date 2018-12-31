const jsforce = require("jsforce");
const storage = require("./storage");
const path = require("path");

const oauth2 = new jsforce.OAuth2({
  loginUrl: "https://login.salesforce.com",
  clientId: process.env.SALESFORCE_OAUTH_CLIENT_ID || "MISSING",
  clientSecret: process.env.SALESFORCE_OAUTH_CLIENT_SECRET,
  redirectUri: process.env.SALESFORCE_OAUTH_REDIRECT_URI
});

function getConnection(session) {
  return new jsforce.Connection({
    oauth2: { oauth2 },
    accessToken: session.accessToken,
    instanceUrl: session.instanceUrl
  });
}

async function thawConnection(keyPrefix, refreshNow = false) {
  const authKey = path.join(keyPrefix, "auth");
  const accessTokenKey = path.join(keyPrefix, "auth_accessToken");

  let auth = await storage.get(authKey);

  return new Promise(async (resolve, reject) => {
    var conn = new jsforce.Connection({
      oauth2: oauth2,
      instanceUrl: auth.instanceUrl,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken
    });
    try {
      conn.accessToken = await storage.get(accessTokenKey);
    } catch (e) {
      console.log("Ignoring error when reloading sessoin id:", e);
      // ignore, will be fixed on restart
    }
    conn.on("refresh", function(accessToken, res) {
      // console.log("JSFORCE REFRESH HAPPENED", accessToken, res);
      storage.put(accessTokenKey, accessToken);
    });
    if (refreshNow === true) {
      let res = await conn.oauth2.refreshToken(refreshToken);
      console.log("refreshed", res);
    }
    resolve(conn);
  });
}

async function q(session, soql) {
  return getConnection(session).query(soql);
}

module.exports = {
  getConnection: getConnection,
  thawConnection: thawConnection,
  q: q
};
