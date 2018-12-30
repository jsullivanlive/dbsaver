var groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

async function setupAuditTrail(keyPrefix, conn, storage) {
  let history = await conn
    .sobject("SetupAuditTrail")
    .select("*, CreatedBy.Username")
    .execute();

  // backup audit history since salesforce deletes it after 6 months
  storage.archive(keyPrefix, "SetupAuditTrail", history);

  let actions = Object.keys(groupBy(history, "Action"));
  let impersonatedUsers = Object.keys(groupBy(history, "DelegateUser"));

  return {
    html: `
      <div>
        <h3>System Audit Trail Changes</h3>
        <div>${JSON.stringify(actions.join("<br/>"))}</div>
        <h3>Impersonated Users</h3>
        <div>${JSON.stringify(impersonatedUsers).join("<br/>")}</div>
      </div>
    `
  };
}

module.exports = setupAuditTrail;
