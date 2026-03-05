#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { DateTime } = require("luxon");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");

const SETTINGS_PATH = path.join(ROOT, ".github/settings.json");
const TEMPLATE_PATH = path.join(ROOT, "templates/README.template.md");
const README_PATH = path.join(ROOT, "README.md");

if (!fs.existsSync(SETTINGS_PATH)) {
  console.error("❌ Arquivo .github/settings.json não encontrado.");
  process.exit(1);
}

const SETTINGS = JSON.parse(fs.readFileSync(SETTINGS_PATH));

const TIMEZONE = SETTINGS.timezone;
const USER = SETTINGS.github_user;
const INTERVAL = SETTINGS.interval_minutes;

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function getCurrentBranch() {
  return execSync("git rev-parse --abbrev-ref HEAD", {
    cwd: ROOT,
  })
    .toString()
    .trim();
}

function hasLocalChanges() {
  const status = execSync("git status --porcelain", { cwd: ROOT })
    .toString()
    .trim();
  return status.length > 0;
}

function syncWithRemote(branch) {
  log("🔄 Preparando sincronização...");

  try {
    // Se houver mudanças locais, salva temporariamente
    if (hasLocalChanges()) {
      log("💾 Salvando alterações locais (stash)...");
      execSync("git stash --include-untracked", { cwd: ROOT });
    }

    log("🌐 Puxando atualizações do remoto...");
    execSync(`git pull origin ${branch} --rebase`, {
      cwd: ROOT,
      stdio: "inherit",
    });

    // Se houver stash, aplica de volta
    const stashList = execSync("git stash list", { cwd: ROOT })
      .toString()
      .trim();

    if (stashList) {
      log("📦 Restaurando alterações locais...");
      execSync("git stash pop", { cwd: ROOT, stdio: "inherit" });
    }

  } catch (err) {
    console.error("❌ Erro ao sincronizar com remoto.");
    process.exit(1);
  }
}

async function fetchGitHub() {
  if (!process.env.GITHUB_TOKEN) {
    console.error("❌ GITHUB_TOKEN não definido.");
    process.exit(1);
  }

  const query = `
    query {
      user(login:"${USER}") {
        followers { totalCount }
        repositories(first:100, ownerAffiliations:OWNER) {
          totalCount
          nodes { stargazerCount }
        }
      }
    }`;

  const res = await axios.post(
    "https://api.github.com/graphql",
    { query },
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  );

  return res.data.data.user;
}

function commitAndPush(branch) {
  execSync("git add -A", { cwd: ROOT });

  try {
    execSync(
      `git commit -m "♻️ README gerado automaticamente - ${Date.now()}"`,
      { cwd: ROOT }
    );
  } catch {
    log("ℹ️ Nenhuma alteração detectada.");
    return;
  }

  execSync(`git push origin ${branch}`, {
    cwd: ROOT,
    stdio: "inherit",
  });

  log("🚀 Commit e push realizados com sucesso.");
}

async function main() {
  try {
    const branch = getCurrentBranch();

    // 🔄 Sincroniza primeiro
    syncWithRemote(branch);

    const now = DateTime.now().setZone(TIMEZONE);

    log("🔎 Buscando dados do GitHub...");
    const user = await fetchGitHub();

    const followers = user.followers.totalCount;
    const totalProjects = user.repositories.totalCount;
    const stars = user.repositories.nodes.reduce(
      (acc, repo) => acc + repo.stargazerCount,
      0
    );

    const lastUpdate = now.toFormat("dd/MM/yyyy HH:mm:ss");
    const nextUpdate = now
      .plus({ minutes: INTERVAL })
      .toFormat("dd/MM/yyyy HH:mm:ss");

    if (!fs.existsSync(TEMPLATE_PATH)) {
      console.error("❌ Template não encontrado.");
      process.exit(1);
    }

    const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

    const finalReadme = template
      .replace(/{total_projects}/g, totalProjects)
      .replace(/{followers}/g, followers)
      .replace(/{stars}/g, stars)
      .replace(/{last_update}/g, lastUpdate)
      .replace(/{next_update}/g, nextUpdate);

    fs.writeFileSync(README_PATH, finalReadme);

    log("✅ README.md gerado com sucesso.");

    commitAndPush(branch);

  } catch (error) {
    console.error("❌ Erro:", error.response?.data || error.message);
    process.exit(1);
  }
}

main();