#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { DateTime } = require("luxon");

const settingsPath = path.join(__dirname, "../.github/settings.json");
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

const GITHUB_USER = settings.github_user;
const TIMEZONE = settings.timezone || "America/Sao_Paulo";
const UPDATE_HOURS = (settings.update_hours || []).sort((a, b) => a - b);

const README_PATH = path.join(__dirname, "../README.md");
const TEMPLATE_PATH = path.join(__dirname, "../templates/README.template.md");

async function fetchRepos(user) {
  const repos = [];
  let page = 1;

  while (true) {
    const { data } = await axios.get(
      `https://api.github.com/users/${user}/repos`,
      {
        params: { per_page: 100, page },
        headers: { "User-Agent": "GitHub-Profile-Updater" }
      }
    );

    if (data.length === 0) break;
    repos.push(...data);
    page++;
  }

  return repos;
}

function generateLanguageStats(repos) {
  const map = {};

  repos.forEach(repo => {
    if (!repo.language) return;
    map[repo.language] = (map[repo.language] || 0) + 1;
  });

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => `• ${lang}: ${count}`)
    .join("<br>");
}

function getNextUpdate(now) {
  for (const hour of UPDATE_HOURS) {
    const scheduled = now.set({ hour, minute: 0, second: 0 });
    if (scheduled > now) return scheduled;
  }

  return now.plus({ days: 1 }).set({
    hour: UPDATE_HOURS[0],
    minute: 0,
    second: 0
  });
}

async function updateReadme() {
  const repos = await fetchRepos(GITHUB_USER);

  const now = DateTime.now().setZone(TIMEZONE);
  const next = getNextUpdate(now);

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  const content = template
    .replace("{total_projects}", repos.length)
    .replace(
      "{language_lines}",
      generateLanguageStats(repos) || "• Nenhuma linguagem detectada"
    )
    .replace("{last_update_str}", now.toFormat("dd/MM/yyyy HH:mm"))
    .replace("{next_update_str}", next.toFormat("dd/MM/yyyy HH:mm"));

  fs.writeFileSync(README_PATH, content);
  console.log("✅ README atualizado com sucesso");
}

updateReadme().catch(err => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
