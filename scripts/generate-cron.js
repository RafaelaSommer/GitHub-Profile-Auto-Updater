#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// ================= CAMINHOS =================
const settingsPath = path.join(__dirname, "../.github/settings.json");
const workflowPath = path.join(__dirname, "../.github/workflows/update-readme.yml");

if (!fs.existsSync(settingsPath)) {
  console.error("❌ settings.json não encontrado.");
  process.exit(1);
}

const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

// ================= CONFIGURAÇÕES =================
const businessStart = settings.business_hours?.start ?? 8;
const businessEnd = settings.business_hours?.end ?? 18;

const fixedInterval = settings.fixed_interval_hours ?? 2;
const enableInterval = settings.enable_interval_minutes ?? false;
const intervalMinutes = settings.interval_minutes ?? 20;
const intervalOnlyBusiness = settings.interval_only_business_hours ?? true;

// ================= VALIDAÇÃO =================
if (fixedInterval <= 0 || fixedInterval > 12) {
  console.error("❌ fixed_interval_hours deve estar entre 1 e 12.");
  process.exit(1);
}

if (intervalMinutes <= 0 || intervalMinutes > 59) {
  console.error("❌ interval_minutes deve estar entre 1 e 59.");
  process.exit(1);
}

// ================= GERA HORÁRIOS FIXOS =================
let fixedHours = [];

for (let h = businessStart; h <= businessEnd; h += fixedInterval) {
  fixedHours.push(h);
}

fixedHours = [...new Set(fixedHours)].sort((a, b) => a - b);

// ================= GERA CRONS =================
let cronEntries = [];

// Horários fixos
if (fixedHours.length > 0) {
  cronEntries.push(`0 ${fixedHours.join(",")} * * *`);
}

// Intervalo de minutos
if (enableInterval) {
  if (intervalOnlyBusiness) {
    cronEntries.push(`*/${intervalMinutes} ${businessStart}-${businessEnd} * * *`);
  } else {
    cronEntries.push(`*/${intervalMinutes} * * * *`);
  }
}

if (cronEntries.length === 0) {
  console.error("❌ Nenhuma regra de agendamento foi gerada.");
  process.exit(1);
}

console.log("📅 Cron gerado:");
cronEntries.forEach(c => console.log("   ", c));

// ================= MONTA WORKFLOW =================
const workflow = `name: Update README

on:
  schedule:
${cronEntries.map(c => `    - cron: "${c}"`).join("\n")}
  workflow_dispatch:

concurrency:
  group: profile-auto-update
  cancel-in-progress: true

permissions:
  contents: write

jobs:
  update-profile:
    runs-on: ubuntu-latest
    timeout-minutes: 3

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - run: npm ci

      - name: Run Profile Updater
        run: npm run update
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Commit changes
        run: |
          git config --global user.name "${settings.gitUser}"
          git config --global user.email "${settings.gitEmail}"

          git add README.md .github/last-run.json

          if git diff --cached --quiet; then
            echo "No changes detected."
          else
            git commit -m "chore: update profile README"
            git push
          fi
`;

fs.mkdirSync(path.dirname(workflowPath), { recursive: true });
fs.writeFileSync(workflowPath, workflow);

console.log("✅ Workflow gerado com sucesso!");