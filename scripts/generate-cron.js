#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { DateTime } = require("luxon");

const settingsPath = path.join(__dirname, "../.github/settings.json");
const workflowPath = path.join(
  __dirname,
  "../.github/workflows/update-readme.yml"
);

const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
const UPDATE_HOURS =
  settings.update_hours ||
  Array.from({ length: 24 }, (_, i) => i).filter(h => h % 2 === 0);

if (!UPDATE_HOURS.length) {
  console.error("❌ update_hours vazio");
  process.exit(1);
}

/* ===============================
   CONVERSÃO BR → UTC (SEGURA)
================================= */
function toUTC(hour) {
  const brTime = DateTime.fromObject(
    { hour, minute: 0 },
    { zone: settings.timezone || "America/Sao_Paulo" }
  );

  return brTime.toUTC().hour;
}

const cronLines = UPDATE_HOURS
  .sort((a, b) => a - b)
  .map(hour => `    - cron: "0 ${toUTC(hour)} * * *"`);

const workflow = `name: Update README

on:
  schedule:
${cronLines.join("\n")}
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update-readme:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - run: npm ci

      - run: node scripts/update_readme.js

      - run: |
          git config user.name "RafaelaSommer"
          git config user.email "camilaerafaelagoncalves@hotmail.com"
          git add README.md
          git commit -m "Atualização automática do README" || echo "Nada para commitar"
          git push
`;

fs.writeFileSync(workflowPath, workflow, "utf8");

console.log("✅ Workflow gerado e sincronizado com timezone real");
console.log("🇧🇷 Horários Brasil:", UPDATE_HOURS.join(", "));
console.log(
  "🌍 Horários UTC:",
  UPDATE_HOURS.map(toUTC).join(", ")
);
