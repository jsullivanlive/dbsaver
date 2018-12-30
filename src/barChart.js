function barChart(values) {
  let max = 0;
  for (const k of Object.keys(values)) {
    if (max < values[k]) max = values[k];
  }
  const width = k => {
    return `${100 * (values[k] / max)}%`;
  };
  const sortedKeys = Object.keys(values).sort((a, b) => width(b) - width(a));
  return `
        <div>
            ${sortedKeys
              .map(
                k =>
                  `<div style="background-color: red; width: ${width(
                    k
                  )}">${k}</div>`
              )
              .join("")}
        </div>
    `;
}

module.exports = barChart;
