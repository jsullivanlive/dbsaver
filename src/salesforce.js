const jsforce = require("jsforce");

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

async function thawConnection(auth, refreshNow = false) {
  return new Promise(async (resolve, reject) => {
    var conn = new jsforce.Connection({
      oauth2: oauth2,
      instanceUrl: auth.instanceUrl,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken
    });
    conn.on("refresh", function(accessToken, res) {
      console.log("JSFORCE REFRESH HAPPENED");
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
