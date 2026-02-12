#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/* ===============================
   CAMINHOS
================================= */

const settingsPath = path.join(__dirname, "../.github/settings.json");
const workflowPath = path.join(
  __dirname,
  "../.github/workflows/update-readme.yml"
);

/* ===============================
   CARREGA SETTINGS (OPCIONAL)
================================= */

let cronSchedule = "*/15 * * * *"; // padrão: a cada 15 minutos

if (fs.existsSync(settingsPath)) {
  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  if (settings.cron) {
    cronSchedule = settings.cron;
  }
}

/* ===============================
   WORKFLOW YAML
================================= */

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
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm install

      - name: Run update script
        run: node scripts/update_readme.js
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Commit README if changed
        run: |
          git config user.name "RafaelaSommer"
          git config user.email "camilaerafaelagoncalves@hotmail.com"
          git add README.md || true
          git diff --cached --quiet || git commit -m "🤖 Atualização Automática do README"
          git push
`;

/* ===============================
   CRIA PASTA + ARQUIVO
================================= */

fs.mkdirSync(path.dirname(workflowPath), { recursive: true });
fs.writeFileSync(workflowPath, workflow, "utf8");

console.log("✅ Workflow gerado com sucesso!");
console.log(`🕒 Cron configurado: ${cronSchedule}`);
console.log("🚀 Atualização automática ativada.");
