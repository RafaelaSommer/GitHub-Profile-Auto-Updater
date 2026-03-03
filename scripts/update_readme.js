#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { DateTime } = require("luxon");
require("dotenv").config();

const TIMEOUT_LIMIT = 20 * 60 * 1000;

const ROOT = path.join(__dirname, "..");
const SETTINGS_PATH = path.join(ROOT, ".github/settings.json");
const LOCK_PATH = path.join(ROOT, ".github/lock.json");
const LAST_RUN_PATH = path.join(ROOT, ".github/last-run.json");
const TEMPLATE_PATH = path.join(ROOT, "templates/README.template.md");
const README_PATH = path.join(ROOT, "README.md");
const SVG_PATH = path.join(ROOT, "assets/languages.svg");

if (!process.env.GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN não encontrado.");
  process.exit(1);
}

const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH));
const TIMEZONE = settings.timezone;
const USER = settings.github_user;

const timeout = setTimeout(() => {
  console.error("⛔ Timeout 20min.");
  releaseLock();
  process.exit(1);
}, TIMEOUT_LIMIT);

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function acquireLock() {
  if (fs.existsSync(LOCK_PATH)) {
    const lock = JSON.parse(fs.readFileSync(LOCK_PATH));
    const diff = Date.now() - new Date(lock.started_at).getTime();

    if (diff < TIMEOUT_LIMIT) {
      log("⚠ Outro processo em execução.");
      process.exit(0);
    }
  }

  fs.writeFileSync(LOCK_PATH, JSON.stringify({
    started_at: new Date().toISOString()
  }));
}

function releaseLock() {
  if (fs.existsSync(LOCK_PATH)) {
    fs.unlinkSync(LOCK_PATH);
  }
}

async function fetchGitHub() {
  const query = `
  query {
    user(login: "${USER}") {
      followers { totalCount }
      repositories(first: 100, ownerAffiliations: OWNER) {
        totalCount
        nodes {
          stargazerCount
          primaryLanguage { name }
        }
      }
    }
  }`;

  const res = await axios.post(
    "https://api.github.com/graphql",
    { query },
    { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
  );

  return res.data.data.user;
}

function generateSVG(languageData) {
  const total = Object.values(languageData).reduce((a,b)=>a+b,0);

  const barWidthMax = 420;
  const barHeight = 18;
  const spacing = 45;
  const startY = 70;

  let y = startY;
  let i = 0;
  let bars = "";

  const COLORS = [
    "#FF6B6B","#6BCB77","#4D96FF","#FFD93D",
    "#845EC2","#FF9671","#00C9A7","#D65DB1",
    "#2C73D2","#B39CD0"
  ];

  Object.entries(languageData)
    .sort((a,b)=>b[1]-a[1])
    .forEach(([lang,val])=>{

      const percent = ((val/total)*100).toFixed(1);
      const width = (val/total)*barWidthMax;
      const color = COLORS[i % COLORS.length];

      bars += `
        <text x="40" y="${y}" fill="#E6EDF3" font-size="15">
          ${lang}
        </text>

        <text x="600" y="${y}" fill="#8B949E" font-size="13" text-anchor="end">
          ${percent}%
        </text>

        <rect x="200" y="${y-14}" rx="8"
          width="${barWidthMax}" height="${barHeight}"
          fill="#21262D"/>

        <rect x="200" y="${y-14}" rx="8"
          width="0" height="${barHeight}"
          fill="${color}">
          <animate attributeName="width"
                   from="0"
                   to="${width}"
                   dur="1.4s"
                   fill="freeze"/>
        </rect>
      `;

      y += spacing;
      i++;
    });

  const height = y + 40;

  return `
  <svg width="700" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#0D1117"/>

    <text x="40" y="40"
      fill="#58A6FF"
      font-size="20"
      font-weight="bold">
      📊 Linguagens mais utilizadas
    </text>

    ${bars}
  </svg>`;
}

async function main() {
  acquireLock();
  log("🚀 Atualização iniciada");

  try {
    const now = DateTime.now().setZone(TIMEZONE);
    const user = await fetchGitHub();

    const repos = user.repositories.nodes;
    const followers = user.followers.totalCount;
    const totalProjects = user.repositories.totalCount;
    const stars = repos.reduce((a,b)=>a+b.stargazerCount,0);

    const langCount = {};
    repos.forEach(r=>{
      const lang = r.primaryLanguage?.name || "Other";
      langCount[lang] = (langCount[lang]||0)+1;
    });

    fs.mkdirSync(path.join(ROOT,"assets"),{recursive:true});
    fs.writeFileSync(SVG_PATH, generateSVG(langCount));

    const template = fs.readFileSync(TEMPLATE_PATH,"utf8");

    const content = template
      .replace("{followers}",followers)
      .replace("{stars}",stars)
      .replace("{total_projects}",totalProjects)
      .replace("{last_update}",now.toFormat("dd/MM/yyyy HH:mm"))
      .replace("{next_update}",now.plus({minutes:20}).toFormat("dd/MM/yyyy HH:mm"));

    fs.writeFileSync(README_PATH,content);

    fs.writeFileSync(LAST_RUN_PATH, JSON.stringify({
      last_run: now.toISO()
    },null,2));

    log("✅ Atualização concluída");

  } catch(err) {
    log("❌ Erro: "+err.message);
  } finally {
    releaseLock();
    clearTimeout(timeout);
  }
}

main();