#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SETTINGS_PATH = path.join(ROOT, ".github/settings.json");

if (!fs.existsSync(SETTINGS_PATH)) {
  console.error("❌ settings.json não encontrado em .github/");
  process.exit(1);
}

const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));

const gitUser = settings.gitUser;
const gitEmail = settings.gitEmail;
const startHour = settings.business_hours.start;
const endHour = settings.business_hours.end;
const interval = settings.interval_minutes || 20;

if (!gitUser || !gitEmail) {
  console.error("❌ gitUser ou gitEmail não definidos no settings.json");
  process.exit(1);
}

/*
IMPORTANTE:
Cron usa UTC.
GitHub Actions roda em UTC.
Se quiser horário de Brasília fixo, manteremos 7-23 direto
pois seu script já valida timezone internamente.
*/

const cronExpression = `*/${interval} ${startHour}-${endHour} * * *`;

const workflow = `
name: 🤖 Update README

on:
  schedule:
    - cron: "${cronExpression}"
  workflow_dispatch:

concurrency:
  group: profile-auto-update
  cancel-in-progress: true

permissions:
  contents: write

jobs:
  update:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4

      - name: ⚙️ Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: 📦 Install Dependencies
        run: npm install axios luxon dotenv

      - name: 👤 Configurar Git
        run: |
          git config user.name "${gitUser}"
          git config user.email "${gitEmail}"

      - name: 🚀 Executar Update
        run: node scripts/update_readme.js
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;

const WORKFLOW_DIR = path.join(ROOT, ".github/workflows");
fs.mkdirSync(WORKFLOW_DIR, { recursive: true });

fs.writeFileSync(
  path.join(WORKFLOW_DIR, "update-readme.yml"),
  workflow.trim()
);

console.log("✅ Workflow gerado com sucesso!");
console.log("🕒 Horário:", `${startHour}h até ${endHour}h`);
console.log("⏱ Intervalo:", `${interval} minutos`);
console.log("👤 Git User:", gitUser);
console.log("📧 Git Email:", gitEmail);