#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const settingsPath = path.join(__dirname, "../.github/settings.json");
const workflowPath = path.join(
  __dirname,
  "../.github/workflows/update-readme.yml"
);

// 🔹 Cron padrão: a cada 15 minutos
let cronSchedule = "*/15 * * * *";

if (fs.existsSync(settingsPath)) {
  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

  if (settings.cron && typeof settings.cron === "string") {
    cronSchedule = settings.cron;
  }
}

const workflow = `name: Update README

on:
  schedule:
    - cron: "${cronSchedule}"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: update-readme
  cancel-in-progress: false

jobs:
  update-readme:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run update script
        run: node scripts/update_readme.js
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Commit and push if changed
        run: |
          git config --global user.name "RafaelaSommer"
          git config --global user.email "camilaerafaelagoncalves@hotmail.com"

          git add README.md

          if git diff --cached --quiet; then
            echo "Nenhuma alteração detectada."
          else
            git commit -m "🤖 Atualização Automática do README"
            git push
          fi
`;

fs.mkdirSync(path.dirname(workflowPath), { recursive: true });
fs.writeFileSync(workflowPath, workflow, "utf8");

console.log("✅ Workflow gerado com sucesso!");
