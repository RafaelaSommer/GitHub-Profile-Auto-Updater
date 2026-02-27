#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { DateTime } = require("luxon");
require("dotenv").config();

// ================= TIMEOUT GLOBAL (1 MIN) =================
const TIMEOUT_LIMIT = 60 * 1000;

const timeout = setTimeout(() => {
  console.error("⛔ Execução excedeu 1 minuto. Encerrando...");
  process.exit(1);
}, TIMEOUT_LIMIT);

// ================= CONFIG =================
const settingsPath = path.join(__dirname, "../.github/settings.json");
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

const GITHUB_USER = settings.github_user;
const TIMEZONE = settings.timezone || "America/Sao_Paulo";

const README_PATH = path.join(__dirname, "../README.md");
const TEMPLATE_PATH = path.join(__dirname, "../templates/README.template.md");
const LAST_RUN_PATH = path.join(__dirname, "../.github/last-run.json");

// ================= GITHUB CLIENT =================
if (!process.env.GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN não encontrado.");
  process.exit(1);
}

const graphql = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN.trim()}`,
    "Content-Type": "application/json",
    "User-Agent": "Rafaela-Profile-Bot"
  },
  timeout: 8000
});

// ================= HELPERS =================
function loadLastRun() {
  if (!fs.existsSync(LAST_RUN_PATH)) return { total_updates: 0 };
  return JSON.parse(fs.readFileSync(LAST_RUN_PATH, "utf8"));
}

function saveLastRun(data) {
  fs.writeFileSync(LAST_RUN_PATH, JSON.stringify(data, null, 2));
}

function getNextMainUpdate(now) {
  const UPDATE_HOURS = settings.update_hours || [0, 6, 12, 18];
  const today = now.startOf("day");

  const futureHours = UPDATE_HOURS
    .map(hour => today.plus({ hours: hour }))
    .filter(date => date > now);

  return futureHours.length > 0
    ? futureHours[0]
    : today.plus({ days: 1, hours: UPDATE_HOURS[0] });
}

function getNextUpdate15(now) {
  return now.plus({ minutes: 20 });
}

// ================= FETCH COM RETRY =================
async function fetchGitHubData(retries = 2) {
  const query = `
    query {
      user(login: "${GITHUB_USER}") {
        followers { totalCount }
        repositories(first: 100, ownerAffiliations: OWNER) {
          totalCount
          nodes {
            stargazerCount
            primaryLanguage { name }
          }
        }
      }
    }
  `;

  try {
    const response = await graphql.post("", { query });

    if (response.data.errors) {
      throw new Error(JSON.stringify(response.data.errors));
    }

    return response.data.data.user;

  } catch (err) {
    if (retries > 0) {
      console.log("🔁 Tentando novamente...");
      await new Promise(r => setTimeout(r, 1500));
      return fetchGitHubData(retries - 1);
    }
    throw err;
  }
}

// ================= BADGES COM 70+ CORES =================
function generateLanguageBadges(repos) {
  const languageCount = {};

  repos.forEach(repo => {
    const lang = repo.primaryLanguage?.name || "Other";
    languageCount[lang] = (languageCount[lang] || 0) + 1;
  });

  const colors = [
    "ff6b6b","feca57","48dbfb","1dd1a1","5f27cd","54a0ff","00d2d3",
    "ff9ff3","ee5253","0abde3","10ac84","222f3e","c8d6e5","576574",
    "ff9f43","1e90ff","2ed573","ffa502","3742fa","70a1ff","ff4757",
    "7bed9f","5352ed","ff6348","2f3542","ff7f50","6495ed","dc143c",
    "00fa9a","8a2be2","ff1493","7fff00","ff4500","00ced1","ffd700",
    "20b2aa","ff69b4","ba55d3","cd5c5c","4682b4","9acd32","ff8c00",
    "8fbc8f","9932cc","e9967a","8b0000","006400","483d8b","2e8b57",
    "ff00ff","00ff7f","b22222","5d6d7e","a569bd","52be80","f4d03f",
    "dc7633","5dade2","48c9b0","af7ac5","34495e","e74c3c","16a085",
    "2980b9","8e44ad","2c3e50","f39c12","d35400","e84393","6c5ce7",
    "00b894","fdcb6e","0984e3","e17055","81ecec","fab1a0","00cec9",
    "fd79a8","6ab04c","eb4d4b","30336b","be2edd","f0932b"
  ];

  let colorIndex = 0;

  return Object.entries(languageCount)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => {
      const color = colors[colorIndex % colors.length];
      colorIndex++;
      return `![${lang}](https://img.shields.io/badge/${encodeURIComponent(lang)}-${count}-${color}?style=flat)`;
    })
    .join(" ");
}

// ================= MAIN =================
async function updateReadme() {
  try {
    const now = DateTime.now().setZone(TIMEZONE);
    const lastRunData = loadLastRun();

    console.log("🔎 Buscando dados do GitHub...");
    const user = await fetchGitHubData();

    const followers = user.followers.totalCount;
    const repos = user.repositories.nodes;
    const totalProjects = user.repositories.totalCount;
    const totalStars = repos.reduce((acc, repo) => acc + repo.stargazerCount, 0);

    const next15 = getNextUpdate15(now);
    const nextMain = getNextMainUpdate(now);

    const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

    let content = template
      .replace("{followers}", followers)
      .replace("{stars}", totalStars)
      .replace("{total_projects}", totalProjects)
      .replace("{language_lines}", generateLanguageBadges(repos))
      .replace("{last_update}", now.toFormat("dd-MM-yyyy_HH-mm"))
      .replace("{next_update_15}", next15.toFormat("dd/MM/yyyy HH:mm"))
      .replace("{next_update_main}", nextMain.toFormat("dd/MM/yyyy HH:mm"));

    // ================= BADGE DE ÚLTIMA ATUALIZAÇÃO =================
    const formattedDate = now.toFormat("dd/MM/yyyy HH:mm");
    const encodedDate = encodeURIComponent(formattedDate);

    const lastUpdateBadge =
      `![Last Update](https://img.shields.io/badge/Last%20Update-${encodedDate}-blue?style=flat-square)\n\n`;

    content = content.replace(
      /📌 \*\*Últimas Atualizações\*\*\s*/,
      `📌 **Últimas Atualizações**\n\n${lastUpdateBadge}`
    );

    fs.writeFileSync(README_PATH, content);

    saveLastRun({
      last_run: now.toISO(),
      total_updates: (lastRunData.total_updates || 0) + 1
    });

    console.log("✅ README atualizado com sucesso!");
  } catch (err) {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  } finally {
    clearTimeout(timeout);
  }
}

updateReadme();