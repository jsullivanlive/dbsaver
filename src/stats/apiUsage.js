async function apiUsage(keyPrefix, conn, storage) {
  // TODO check full api usage
  // TODO store api usage over time
  const goodIcon = "noun_Ok_108699.png";
  const badIcon = "noun_Close_316878.png";
  const usage = conn.limitInfo.apiUsage;
  const utilizationPercentage = 100 * (usage.used / usage.limit);
  const ok = utilizationPercentage < 50;
  const statusImage = ok ? goodIcon : badIcon;
  return {
    ok: ok,
    html: `
      <div>
        <h3><img src="https://app.dbsaver.com/public/${statusImage}"/>API Usage</h3>
        <p>Current API usage (rolling 24 hours): ${usage.used.toLocaleString()}</p>
        <p>API Limit (rolling 24 hours): ${usage.limit.toLocaleString()}</p>
        <div style="width: 100%; background-color: #bbb;">
          <div style="
            color: white;
            font-weight: bold;
            padding: 2px;
            width: ${utilizationPercentage}%;
            background-color: ${ok ? "green" : "red"};
            text-align: center;
          ">${Math.round(utilizationPercentage)}%</div>
        </div>
      </div>
    `
  };
}

module.exports = apiUsage;
