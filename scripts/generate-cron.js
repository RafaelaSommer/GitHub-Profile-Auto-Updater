#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SETTINGS_PATH = path.join(ROOT, ".github", "settings.json");

let SETTINGS = {
  gitUser: "RafaelaSommer",
  gitEmail: "camilaerafaelagoncalves@hotmail.com",
  interval_minutes: 20
};

// LOAD SETTINGS
if (fs.existsSync(SETTINGS_PATH)) {
  try {
    SETTINGS = {
      ...SETTINGS,
      ...JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"))
    };
  } catch {
    console.warn("⚠️ settings.json inválido");
  }
}

// INTERVAL
let interval = Number(SETTINGS.interval_minutes) || 20;
if (interval < 5) interval = 5;

// WORKFLOW PROFILE PRO
function createWorkflow() {
  return `
name: 🔥 Profile Auto Update

on:
  schedule:
    - cron: "*/${interval} * * * *"
  workflow_dispatch:

concurrency:
  group: profile-auto
  cancel-in-progress: true

permissions:
  contents: write

jobs:
  update:
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: ⚙️ Setup Node
        uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: "npm"

      - name: 📦 Install deps
        run: npm install

      - name: 🚀 Run updater
        run: |
          echo "Iniciando bot..."
          node scripts/index.js || echo "⚠️ Script falhou mas workflow continua"

        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: 🧠 Force change (timestamp)
        run: |
          echo $(date) > .last-update

      - name: 💾 Commit & Push
        run: |
          git config user.name "${SETTINGS.gitUser}"
          git config user.email "${SETTINGS.gitEmail}"

          git add .

          git commit --allow-empty -m "🔥 profile update $(date +'%d/%m %H:%M:%S')"

          git push
`;
}

// WRITE
const workflowDir = path.join(ROOT, ".github", "workflows");
fs.mkdirSync(workflowDir, { recursive: true });

fs.writeFileSync(
  path.join(workflowDir, "update-readme.yml"),
  createWorkflow().trim() + "\n"
);

console.log("🔥 Workflow PRO criado!");
console.log(`⏱ Intervalo: ${interval} min`);