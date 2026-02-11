#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { DateTime } = require("luxon");

const settingsPath = path.join(__dirname, "../.github/settings.json");
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

const GITHUB_USER = settings.github_user;
const TIMEZONE = settings.timezone || "America/Sao_Paulo";

// Atualiza a cada 2 horas (horário BR)
const UPDATE_HOURS = Array.from({ length: 24 }, (_, i) => i).filter(
  h => h % 2 === 0
);

const GRACE_MINUTES = settings.grace_minutes ?? 15;

const README_PATH = path.join(__dirname, "../README.md");
const TEMPLATE_PATH = path.join(__dirname, "../templates/README.template.md");

// Cores para +50 linguagens populares
const LANGUAGE_COLORS = {
  "JavaScript": "f1e05a",
  "TypeScript": "2b7489",
  "Python": "3572A5",
  "Java": "b07219",
  "HTML": "e34c26",
  "CSS": "563d7c",
  "C": "555555",
  "C++": "f34b7d",
  "C#": "178600",
  "Ruby": "701516",
  "PHP": "4F5D95",
  "Go": "00ADD8",
  "Shell": "89e051",
  "Rust": "dea584",
  "Kotlin": "F18E33",
  "Swift": "ffac45",
  "Scala": "c22d40",
  "Dart": "00B4AB",
  "Lua": "000080",
  "Objective-C": "438eff",
  "PowerShell": "012456",
  "R": "198CE7",
  "Elixir": "6e4a7e",
  "Haskell": "5e5086",
  "Perl": "0298c3",
  "Vue": "41b883",
  "React": "61dafb",
  "Angular": "dd1b16",
  "Sass": "cc6699",
  "Less": "1d365d",
  "D": "ba595e",
  "CoffeeScript": "244776",
  "Matlab": "e16737",
  "Groovy": "e69f56",
  "VimL": "199f4b",
  "Ada": "02f88c",
  "Assembly": "6E4C13",
  "F#": "b845fc",
  "Fortran": "4d41b1",
  "Crystal": "000100",
  "OCaml": "3be133",
  "Scheme": "1e4aec",
  "Prolog": "74283c",
  "Julia": "a270ba",
  "Elm": "60B5CC",
  "Solidity": "AA6746",
  "Terraform": "6f42c1",
  "Makefile": "427819",
  "Dockerfile": "384d54",
  "Other": "lightgrey"
};

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

function generateLanguageBadges(repos) {
  const map = {};

  repos.forEach(repo => {
    const lang = repo.language || "Other";
    map[lang] = (map[lang] || 0) + 1;
  });

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => {
      const color = LANGUAGE_COLORS[lang] || LANGUAGE_COLORS["Other"];
      return `![${lang}](https://img.shields.io/badge/${encodeURIComponent(
        lang
      )}-${count}-${color})`;
    })
    .join(" ");
}

function getNextUpdate(now) {
  for (const hour of UPDATE_HOURS) {
    const scheduled = now.set({ hour, minute: 0, second: 0 });
    const diff = scheduled.diff(now, "minutes").minutes;

    // tolerância de até 15 minutos
    if (diff >= -GRACE_MINUTES && diff <= 0) return scheduled;
    if (scheduled > now) return scheduled;
  }

  return now
    .plus({ days: 1 })
    .set({ hour: UPDATE_HOURS[0], minute: 0, second: 0 });
}

async function updateReadme() {
  const repos = await fetchRepos(GITHUB_USER);

  const now = DateTime.now().setZone(TIMEZONE);
  const next = getNextUpdate(now);

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  const content = template
    .replace("{total_projects}", repos.length)
    .replace("{language_lines}", generateLanguageBadges(repos))
    .replace("{last_update_str}", now.toFormat("dd/MM/yyyy HH:mm"))
    .replace("{next_update_str}", next.toFormat("dd/MM/yyyy HH:mm"));

  fs.writeFileSync(README_PATH, content);
  console.log("✅ README atualizado com tolerância de 15 min");
}

updateReadme().catch(err => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
