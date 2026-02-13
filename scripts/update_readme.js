#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { DateTime } = require("luxon");

const settingsPath = path.join(__dirname, "../.github/settings.json");
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

const GITHUB_USER = settings.github_user;
const TIMEZONE = settings.timezone;
const UPDATE_HOURS = settings.update_hours;

const README_PATH = path.join(__dirname, "../README.md");
const TEMPLATE_PATH = path.join(__dirname, "../templates/README.template.md");

async function fetchUser() {
  const { data } = await axios.get(
    `https://api.github.com/users/${GITHUB_USER}`,
    {
      headers: {
        "User-Agent": "Profile-Updater",
        Accept: "application/vnd.github+json"
      }
    }
  );

  return data;
}

async function fetchRepos() {
  const repos = [];
  let page = 1;

  while (true) {
    const { data } = await axios.get(
      `https://api.github.com/users/${GITHUB_USER}/repos`,
      {
        params: { per_page: 100, page },
        headers: {
          "User-Agent": "Profile-Updater",
          Accept: "application/vnd.github+json"
        }
      }
    );

    if (!data.length) break;

    repos.push(...data);
    page++;
  }

  return repos;
}

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
      )}-${count}-2d2d2d?style=for-the-badge)`
    )
    .join(" ");
}

function getNextMainUpdate(now) {
  const today = UPDATE_HOURS
    .map(h => now.set({ hour: h, minute: 0, second: 0 }))
    .filter(time => time > now)
    .sort((a, b) => a - b);

  if (today.length > 0) return today[0];

  return now.plus({ days: 1 }).set({
    hour: UPDATE_HOURS[0],
    minute: 0,
    second: 0
  });
}

async function updateReadme() {
  const now = DateTime.now().setZone(TIMEZONE);

  const user = await fetchUser();
  const repos = await fetchRepos();

  const nextMain = getNextMainUpdate(now);
  const next15 = now.plus({ minutes: 15 });

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  const content = template
    .replace("{followers}", user.followers)
    .replace("{stars}", repos.reduce((acc, r) => acc + r.stargazers_count, 0))
    .replace("{total_projects}", repos.length)
    .replace("{language_lines}", generateLanguageBadges(repos))
    .replace("{last_update}", now.toFormat("dd/MM/yyyy HH:mm"))
    .replace("{next_update_15}", next15.toFormat("dd/MM/yyyy HH:mm"))
    .replace("{next_update_main}", nextMain.toFormat("dd/MM/yyyy HH:mm"));

  fs.writeFileSync(README_PATH, content);

  console.log("✅ README atualizado com sucesso");
}

updateReadme().catch(err => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
