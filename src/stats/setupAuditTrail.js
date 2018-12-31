const barChart = require("../barChart");

const groupBy = (rows, key) => {
  let result = {};
  for (const row of rows) {
    if (!result[row[key]]) result[row[key]] = 0;
    result[row[key]]++;
  }
  return result;
};

async function setupAuditTrail(keyPrefix, conn, storage) {
  let history = await conn
    .sobject("SetupAuditTrail")
    .select("*, CreatedBy.Username")
    .execute();

  // backup audit history since salesforce deletes it after 6 months
  storage.archive(keyPrefix, "SetupAuditTrail", history);

  let actions = groupBy(history, "Action");
  let impersonatedUsers = groupBy(
    history.filter(h => h.DelegateUser),
    "DelegateUser"
  );

  return {
    html: `
      <div>
        <h3>System Audit Trail Changes</h3>
        ${barChart(actions)}
        <h3>Impersonated Users</h3>
        ${barChart(impersonatedUsers)}
      </div>
    `
  };
}

module.exports = setupAuditTrail;
