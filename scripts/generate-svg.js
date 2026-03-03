const fs = require("fs");
const path = require("path");

const COLORS = [
"#FF6B6B","#6BCB77","#4D96FF","#FFD93D","#845EC2","#FF9671","#00C9A7","#C34A36","#0081CF","#B0A8B9",
"#FF8066","#FFC75F","#F9F871","#008E9B","#D65DB1","#2C73D2","#008F7A","#C34A36","#FF9671","#FFC75F",
"#F9F871","#008E9B","#D65DB1","#2C73D2","#008F7A","#845EC2","#FF6F91","#FF9671","#00C9A7","#4D8076",
"#B39CD0","#FF8066","#4B4453","#C34A36","#0081CF","#6A0572","#AB83A1","#FFAAA5","#00ADB5","#393E46",
"#F67280","#355C7D","#99B898","#2A363B","#E84A5F","#FF847C","#FECEA8","#A8E6CF","#DCEDC1","#FFD3B6",
"#FFAAA6","#A8E6CF","#FFD3B6","#FF8B94","#DCE775","#80DEEA","#CFD8DC","#B39DDB","#FFCC80","#90CAF9"
];

function generateSVG(languageData) {
  const total = Object.values(languageData).reduce((a,b)=>a+b,0);
  let y = 50;
  let i = 0;
  let bars = "";

  Object.entries(languageData)
    .sort((a,b)=>b[1]-a[1])
    .forEach(([lang,val])=>{
      const width = (val/total)*400;
      const color = COLORS[i % COLORS.length];

      bars += `
      <text x="20" y="${y}" fill="#ffffff" font-size="14">${lang} (${val})</text>
      <rect x="180" y="${y-12}" width="0" height="15" fill="${color}">
        <animate attributeName="width" from="0" to="${width}" dur="1.2s" fill="freeze"/>
      </rect>
      `;
      y+=35;
      i++;
    });

  return `
  <svg width="700" height="${y}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#0d1117"/>
    <text x="20" y="25" fill="#58a6ff" font-size="18">
      📊 Linguagens mais usadas
    </text>
    ${bars}
  </svg>`;
}

module.exports = generateSVG;