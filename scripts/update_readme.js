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

function getNextMainUpdate(now) {
  const today = now.startOf("day");

  const futureHours = UPDATE_HOURS
    .map(hour => today.plus({ hours: hour }))
    .filter(date => date > now);

  if (futureHours.length > 0) {
    return futureHours[0];
  }

  // se já passou todos horários do dia, pega o primeiro horário do próximo dia
  return today.plus({ days: 1, hours: UPDATE_HOURS[0] });
}

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
  const languageColors = {
    JavaScript: "f7df1e",
    TypeScript: "3178c6",
    Python: "3776ab",
    Java: "b07219",
    C: "555555",
    "C++": "00599c",
    "C#": "239120",
    PHP: "777bb4",
    Go: "00add8",
    Ruby: "cc342d",
    Swift: "fa7343",
    Kotlin: "7f52ff",
    Rust: "dea584",
    Dart: "0175c2",
    Shell: "89e051",
    HTML: "e34c26",
    CSS: "1572b6",
    Other: "6e7681"
  };

  const languageCount = {};

  repos.forEach(repo => {
    const lang = repo.language || "Other";
    languageCount[lang] = (languageCount[lang] || 0) + 1;
  });

  return Object.entries(languageCount).map(([lang, count]) => {
    const color = languageColors[lang] || "6e7681";
    const safeLang = lang === "C#" ? "C%23" : encodeURIComponent(lang);
    return `![${lang}](https://img.shields.io/badge/${safeLang}-${count}-${color}?style=for-the-badge)`;
  }).join(" ");
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
