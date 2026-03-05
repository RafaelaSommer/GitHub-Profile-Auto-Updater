const fs = require("fs");
const path = require("path");

const COLORS = [
"#FF6B6B","#6BCB77","#4D96FF","#FFD93D","#845EC2","#FF9671","#00C9A7","#C34A36",
"#0081CF","#B39CD0","#FF8066","#FFC75F","#F9F871","#008E9B","#D65DB1","#2C73D2"
];

function generateSVG(languageData) {
  const total = Object.values(languageData).reduce((a,b)=>a+b,0);

  const width = 760;
  const cardPadding = 30;
  const barMaxWidth = 420;

  let y = 120;
  let i = 0;
  let bars = "";

  const sorted = Object.entries(languageData)
    .sort((a,b)=>b[1]-a[1]);

  sorted.forEach(([lang,val])=>{

    const percent = ((val/total)*100).toFixed(1);
    const barWidth = (val/total)*barMaxWidth;
    const color = COLORS[i % COLORS.length];

    bars += `
      <!-- Nome linguagem -->
      <text x="${cardPadding}" y="${y}" fill="#E6EDF3" font-size="15" font-weight="500">
        ${lang}
      </text>

      <!-- Percentual -->
      <text x="${width-40}" y="${y}" fill="#8B949E" font-size="13" text-anchor="end">
        ${percent}%
      </text>

      <!-- Background bar -->
      <rect x="220" y="${y-14}" rx="10"
        width="${barMaxWidth}" height="16"
        fill="#21262D"/>

      <!-- Animated bar -->
      <rect x="220" y="${y-14}" rx="10"
        width="0" height="16"
        fill="${color}">
        <animate attributeName="width"
                 from="0"
                 to="${barWidth}"
                 dur="1.4s"
                 fill="freeze"/>
      </rect>
    `;

    y += 45;
    i++;
  });

  const height = y + 40;

  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">

    <!-- Fundo -->
    <rect width="100%" height="100%" fill="#0D1117"/>

    <!-- Card -->
    <rect x="10" y="10" width="${width-20}" height="${height-20}"
      rx="20"
      fill="#161B22"
      stroke="#30363D"
      stroke-width="1"/>

    <!-- Header -->
    <text x="${cardPadding}" y="60"
      fill="#58A6FF"
      font-size="22"
      font-weight="bold">
      🚀 GitHub Premium Languages Dashboard
    </text>

    <text x="${cardPadding}" y="85"
      fill="#8B949E"
      font-size="13">
      Distribuição das linguagens mais utilizadas
    </text>

    ${bars}

  </svg>
  `;
}

module.exports = generateSVG;