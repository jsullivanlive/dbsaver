async function apiUsage(keyPrefix, conn, storage) {
  // TODO check api usage
  // TODO store api usage over time

  return {
    utilization: 0.99,
    html: `
      <div>
        <h3>API Usage</h3>
        ${JSON.stringify(conn.limitInfo)}
      </div>
    `
  };
}

module.exports = apiUsage;
