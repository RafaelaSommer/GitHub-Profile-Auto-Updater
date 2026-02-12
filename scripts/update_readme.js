#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { DateTime } = require("luxon");

/* ===============================
   CAMINHOS
================================= */

const settingsPath = path.join(__dirname, "../.github/settings.json");

if (!fs.existsSync(settingsPath)) {
  console.error("❌ settings.json não encontrado");
  process.exit(1);
}

const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

const GITHUB_USER = settings.github_user;
const TIMEZONE = settings.timezone || "America/Sao_Paulo";
const UPDATE_HOURS = settings.update_hours || [8, 12, 16, 20];

const README_PATH = path.join(__dirname, "../README.md");
const TEMPLATE_PATH = path.join(__dirname, "../templates/README.template.md");
const LAST_RUN_PATH = path.join(__dirname, "../.last-run.json");

/* ===============================
   BUSCA REPOSITÓRIOS (SEM 403)
================================= */

async function fetchRepos() {
  const repos = [];
  let page = 1;

  const headers = {
    "User-Agent": "GitHub-Profile-Updater",
    Accept: "application/vnd.github+json"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    console.log("🔐 Autenticado via GITHUB_TOKEN automático");
  } else {
    console.log("⚠ Executando sem autenticação (rate limit baixo)");
  }

  const baseURL = `https://api.github.com/users/${GITHUB_USER}/repos`;

  while (true) {
    const { data } = await axios.get(baseURL, {
      params: {
        per_page: 100,
        page,
        sort: "updated"
      },
      headers
    });

    if (!data.length) break;

    // Ignora forks
    const filtered = data.filter(repo => !repo.fork);

    repos.push(...filtered);
    page++;
  }

  return repos;
}

/* ===============================
   BADGES DE LINGUAGEM
================================= */

function generateLanguageBadges(repos) {
  const map = {};

  repos.forEach(repo => {
    const lang = repo.language || "Other";
    map[lang] = (map[lang] || 0) + 1;
  });

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) =>
      `![${lang}](https://img.shields.io/badge/${encodeURIComponent(
        lang
      )}-${count}-blue)`
    )
    .join(" ");
}

/* ===============================
   CONTROLE DE EXECUÇÃO
================================= */

function shouldRun(now) {
  if (!UPDATE_HOURS.includes(now.hour)) {
    console.log("⏳ Fora do horário configurado");
    return false;
  }

  if (fs.existsSync(LAST_RUN_PATH)) {
    const lastRun = JSON.parse(fs.readFileSync(LAST_RUN_PATH, "utf8"));
    const lastTime = DateTime.fromISO(lastRun.timestamp).setZone(TIMEZONE);

    if (lastTime.hour === now.hour && lastTime.hasSame(now, "day")) {
      console.log("⚠ Já executado neste horário");
      return false;
    }
  }

  return true;
}

/* ===============================
   CALCULA PRÓXIMA ATUALIZAÇÃO
================================= */

function getNextUpdate(now) {
  const todayHours = UPDATE_HOURS
    .map(h => now.set({ hour: h, minute: 0, second: 0 }))
    .filter(time => time > now);

  if (todayHours.length) {
    return todayHours[0];
  }

  const tomorrow = now.plus({ days: 1 });

  return tomorrow.set({
    hour: UPDATE_HOURS[0],
    minute: 0,
    second: 0
  });
}

/* ===============================
   ATUALIZA README
================================= */

async function updateReadme() {
  const now = DateTime.now().setZone(TIMEZONE);

  if (!shouldRun(now)) {
    process.exit(0);
  }

  const repos = await fetchRepos();

  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error("❌ README.template.md não encontrado");
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  const nextUpdate = getNextUpdate(now);

  const content = template
    .replace("{total_projects}", repos.length)
    .replace("{language_lines}", generateLanguageBadges(repos))
    .replace("{last_update}", now.toFormat("dd/MM/yyyy HH:mm"))
    .replace(
      "{next_update_str}",
      nextUpdate.toFormat("dd/MM/yyyy HH:mm")
    );

  fs.writeFileSync(README_PATH, content);

  fs.writeFileSync(
    LAST_RUN_PATH,
    JSON.stringify({ timestamp: now.toISO() })
  );

  console.log("✅ README atualizado com sucesso");
}

/* ===============================
   EXECUÇÃO
================================= */

updateReadme().catch(err => {
  console.error("❌ Erro:", err.response?.data || err.message);
  process.exit(1);
});
