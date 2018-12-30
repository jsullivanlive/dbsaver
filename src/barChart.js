function barChart(values) {
  let max = 0;
  for (const k of Object.keys(values)) {
    if (max < values[k]) max = values[k];
  }
  const width = k => {
    return `${100 * (values[k] / max)}%`;
  };
  const sortedKeys = Object.keys(values).sort((a, b) => width(b) - width(a));
  const bar = k => `
    <div style="
      padding: 2px;
      margin: 2px;
      background-color: rgb(105, 109, 195); 
      width: ${width(k)}">
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
