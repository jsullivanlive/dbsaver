async function setupAuditTrail(keyPrefix, conn, storage) {
  let history = await conn
    .sobject("SetupAuditTrail")
    .select("*")
    .execute();
  console.log(history);
  // TODO save audit history so user can get it after 6 months of history
  process.exit();
  return {
    utilization: 0.99,
    html: `
      <div>
        <h3>System Audit Trail Changes</h3>
        ${JSON.stringify(history)}
      </div>
    `
  };
}

module.exports = setupAuditTrail;
