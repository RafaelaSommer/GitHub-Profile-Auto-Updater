#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { DateTime } = require("luxon");

/* ===============================
   CONFIGURAÇÃO DE CAMINHOS
================================= */

// path.resolve garante que o caminho seja absoluto e funcione em qualquer SO
const settingsPath = path.resolve(__dirname, "..", ".git", "settings.json");

if (!fs.existsSync(settingsPath)) {
  console.error(`❌ Erro: settings.json não encontrado!`);
  console.error(`Caminho tentado: ${settingsPath}`);
  process.exit(1);
}

// Lendo configurações
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

const GITHUB_USER = settings.github_user;
const TIMEZONE = settings.timezone || "America/Sao_Paulo";
const UPDATE_HOURS = settings.update_hours || [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

const README_PATH = path.join(__dirname, "../README.md");
const TEMPLATE_PATH = path.join(__dirname, "../templates/README.template.md");
const LAST_RUN_PATH = path.join(__dirname, "../.last-run.json");

/* ===============================
   MAPA DE CORES PARA LINGUAGENS
================================= */

const languageColors = {
  JavaScript: "f1e05a", TypeScript: "3178c6", Python: "3572A5",
  Java: "b07219", "C#": "178600", PHP: "4F5D95",
  Go: "00ADD8", Rust: "dea584", Kotlin: "A97BFF",
  Swift: "ffac45", Dart: "00B4AB", Ruby: "701516",
  C: "555555", "C++": "f34b7d", HTML: "e34c26",
  CSS: "563d7c", Shell: "89e051", SQL: "e38c00",
  Other: "6c757d"
};

/* ===============================
   BUSCA REPOSITÓRIOS
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
  }

  const baseURL = `https://api.github.com/users/${GITHUB_USER}/repos`;

  try {
    while (true) {
      const { data } = await axios.get(baseURL, {
        params: { per_page: 100, page, sort: "updated" },
        headers
      });

      if (!data.length) break;

      const filtered = data.filter(repo => !repo.fork);
      repos.push(...filtered);
      page++;
    }
    return repos;
  } catch (error) {
    console.error("❌ Erro na API do GitHub:", error.message);
    throw error;
  }
}

/* ===============================
   GERADOR DE CONTEÚDO DINÂMICO
================================= */

function generateLanguageLines(repos) {
  const map = {};

  repos.forEach(repo => {
    const lang = repo.language || "Other";
    map[lang] = (map[lang] || 0) + 1;
  });

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => {
      const color = languageColors[lang] || languageColors["Other"];
      return `![${lang}](https://img.shields.io/badge/${encodeURIComponent(lang)}-${count}-${color}?style=flat-square)`;
    })
    .join(" ");
}

/* ===============================
   LÓGICA DE AGENDAMENTO
================================= */

function shouldRun(now) {
  if (process.env.MANUAL_RUN === "true") return true;

  if (!UPDATE_HOURS.includes(now.hour)) return false;

  if (fs.existsSync(LAST_RUN_PATH)) {
    const lastRun = JSON.parse(fs.readFileSync(LAST_RUN_PATH, "utf8"));
    const lastTime = DateTime.fromISO(lastRun.timestamp).setZone(TIMEZONE);

    if (lastTime.hour === now.hour && lastTime.hasSame(now, "day")) {
      return false;
    }
  }
  return true;
}

function getNextUpdate(now) {
  const upcoming = UPDATE_HOURS
    .map(h => now.set({ hour: h, minute: 0, second: 0, millisecond: 0 }))
    .filter(time => time > now);

  if (upcoming.length > 0) return upcoming[0];

  return now.plus({ days: 1 }).set({ hour: UPDATE_HOURS[0], minute: 0, second: 0, millisecond: 0 });
}

/* ===============================
   EXECUÇÃO PRINCIPAL
================================= */

async function updateReadme() {
  const now = DateTime.now().setZone(TIMEZONE);

  if (!shouldRun(now)) {
    console.log(`⏭️ Próxima atualização em: ${getNextUpdate(now).toFormat("HH:mm")}`);
    return;
  }

  console.log(`📡 Coletando dados para ${GITHUB_USER}...`);
  const repos = await fetchRepos();

  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error("❌ Erro: README.template.md não encontrado.");
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const nextUpdate = getNextUpdate(now);

  // Substituição das tags no Template
  const finalContent = template
    .replace(/{total_projects}/g, repos.length)
    .replace(/{language_lines}/g, generateLanguageLines(repos))
    .replace(/{last_update}/g, now.toFormat("dd/MM/yyyy HH:mm"))
    .replace(/{next_update_str}/g, nextUpdate.toFormat("dd/MM/yyyy HH:mm"));

  fs.writeFileSync(README_PATH, finalContent);
  
  // Atualiza o registro da última execução
  fs.writeFileSync(LAST_RUN_PATH, JSON.stringify({ timestamp: now.toISO() }));

  console.log("✅ README.md atualizado com sucesso!");
}

updateReadme().catch(err => {
  console.error("❌ Erro fatal:", err.message);
  process.exit(1);
});