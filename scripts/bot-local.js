#!/usr/bin/env node

const path = require("path");
const { spawn, execSync } = require("child_process");
const fs = require("fs");

if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

// ================= CONFIG =================
const UPDATE_SCRIPT = path.join(__dirname, "update_readme.js");
const MAX_EXECUTION_TIME = 20 * 60 * 1000; // 20 minutos

let running = false;

// ================= SINCRONIZAÇÃO EXATA 20 MIN =================
function getNextExact20MinDelay() {
  const now = new Date();
  const minutes = now.getMinutes();

  const nextBlock = Math.ceil(minutes / 20) * 20;
  const next = new Date(now);

  next.setMinutes(nextBlock);
  next.setSeconds(0);
  next.setMilliseconds(0);

  if (next <= now) {
    next.setMinutes(next.getMinutes() + 20);
  }

  return next - now;
}

// ================= EXECUTA UPDATE =================
async function runUpdate() {
  return new Promise((resolve, reject) => {
    if (running) {
      console.log("⚠ Já existe execução em andamento. Pulando ciclo.");
      return resolve();
    }

    running = true;

    const child = spawn("node", [UPDATE_SCRIPT], { stdio: "inherit" });

    const timeout = setTimeout(() => {
      console.error("⛔ Timeout de 20 minutos atingido. Encerrando processo...");
      child.kill("SIGKILL");
    }, MAX_EXECUTION_TIME);

    child.on("exit", code => {
      clearTimeout(timeout);
      running = false;

      if (code === 0) resolve();
      else reject(new Error(`update_readme.js terminou com código ${code}`));
    });
  });
}

// ================= EXECUTA GIT =================
function runGit() {
  try {
    console.log("📦 Preparando commit...");

    execSync("git add .", { stdio: "inherit" });

    const status = execSync("git status --porcelain").toString();

    if (!status) {
      console.log("ℹ️ Nenhuma alteração detectada.");
      return;
    }

    execSync(
      `git commit -m "🤖 Auto update README - ${new Date().toISOString()}"`,
      { stdio: "inherit" }
    );

    execSync("git push origin main", { stdio: "inherit" });

    console.log("🚀 Push realizado com sucesso!");
  } catch (err) {
    console.error("❌ Erro no Git:", err.message);
  }
}

// ================= LOOP PRINCIPAL =================
async function startBot() {
  console.log("🤖 Bot local iniciado (sincronizado a cada 20 minutos).");

  while (true) {
    const delay = getNextExact20MinDelay();
    console.log(`⏳ Próxima execução em ${(delay / 60000).toFixed(2)} minutos.`);

    await new Promise(r => setTimeout(r, delay));

    try {
      await runUpdate();
      runGit();
    } catch (err) {
      console.error("❌ Erro no update:", err.message);
    }
  }
}

startBot();