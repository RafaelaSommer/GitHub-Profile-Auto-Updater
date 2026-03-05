#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname,"..");
const SETTINGS = JSON.parse(fs.readFileSync(path.join(ROOT,".github/settings.json")));

const interval = SETTINGS.interval_minutes || 20;
const gitUser = SETTINGS.gitUser;
const gitEmail = SETTINGS.gitEmail;

const cronExpression = `*/${interval} * * * *`; // 24h

const workflow = `
name: 🤖 Update README

on:
  schedule:
    - cron: "${cronExpression}"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - run: npm install axios luxon dotenv

      - run: |
          git config user.name "${gitUser}"
          git config user.email "${gitEmail}"

      - run: node scripts/update_readme.js
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;

fs.mkdirSync(path.join(ROOT,".github/workflows"),{recursive:true});
fs.writeFileSync(
  path.join(ROOT,".github/workflows/update-readme.yml"),
  workflow.trim()
);

console.log("✅ Workflow 24h inteligente criado!");