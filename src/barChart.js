function barChart(values) {
  let max = 0;
  for (const k of Object.keys(values)) {
    if (max < values[k]) max = values[k];
  }
  const width = k => {
    return 100 * (values[k] / max);
  };
  const sortedKeys = Object.keys(values).sort((a, b) => width(b) - width(a));
  const bar = k => `
    <div style="
      padding-top: 2px;
      padding-bottom: 2px;
      margin-top: 2px;
      margin-bottom: 2px;
      background-color: rgb(182, 186, 239); 
      width: ${width(k)}%">
      ${k}
    </div>
  `;
  return `
    <div>
      ${sortedKeys.map(bar).join("")}
    </div>
  `;
}

module.exports = barChart;
