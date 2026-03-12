const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")
const { DateTime } = require("luxon")

const ROOT = path.join(__dirname, "..")
const activityDir = path.join(ROOT, "activity")

function randomMessage() {

  const msgs = [
    "✨ Atualização de projeto",
    "🐛 Correção de bug",
    "🚀 Melhorias de performance",
    "🧠 Refatoração de código",
    "📦 Atualizando dependências",
    "📊 Ajustes no dashboard",
    "⚡ Otimizações internas"
  ]

  return msgs[Math.floor(Math.random() * msgs.length)]
}

function createActivityFile() {

  if (!fs.existsSync(activityDir)) {
    fs.mkdirSync(activityDir, { recursive: true })
  }

  const file = path.join(
    activityDir,
    `activity-${Date.now()}.md`
  )

  const now = DateTime.now().toISO()

  fs.writeFileSync(
    file,
`# Activity Log

Atualização automática.

Timestamp: ${now}
`
  )

  return file
}

function commit(file) {

  try {

    execSync(`git add ${file}`, { cwd: ROOT })

    execSync(
      `git commit -m "${randomMessage()}"`,
      { cwd: ROOT, stdio: "inherit" }
    )

    execSync(
      "git push https://github.com/RafaelaSommer/GitHub-Profile-Auto-Updater.git HEAD",
      { cwd: ROOT, stdio: "inherit" }
    )

    console.log("🚀 Commit automático realizado")

  } catch (e) {

    console.log("⚠️ Commit não realizado")

  }

}

function main() {

  const file = createActivityFile()

  commit(file)

}

main()