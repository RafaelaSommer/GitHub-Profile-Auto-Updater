#!/usr/bin/env node

require("dotenv").config()

const fs = require("fs")
const path = require("path")
const axios = require("axios")
const { DateTime } = require("luxon")

const ROOT = path.join(__dirname, "..")

const SETTINGS = JSON.parse(
  fs.readFileSync(path.join(ROOT, ".github/settings.json"), "utf8")
)

const USER = SETTINGS.github_user
const TIMEZONE = SETTINGS.timezone
const INTERVAL = SETTINGS.interval_minutes

const TOKEN = process.env.GITHUB_TOKEN

if (!TOKEN) {
  console.error("❌ GITHUB_TOKEN não encontrado")
  process.exit(1)
}

async function fetchGitHub() {
  try {
    const res = await axios.post(
      "https://api.github.com/graphql",
      {
        query: `
        query {
          user(login:"${USER}") {
            followers { totalCount }
            repositories(first:100) {
              nodes {
                stargazerCount
              }
            }
          }
        }`
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      }
    )

    return res.data.data.user

  } catch (err) {
    console.error("❌ Erro ao buscar dados do GitHub")

    if (err.response) {
      console.error("Status:", err.response.status)
      console.error("Resposta:", err.response.data)
    } else {
      console.error(err.message)
    }

    process.exit(1)
  }
}

function updateReadme(dynamicContent) {

  const readmePath = path.join(ROOT, "README.md")

  let content = fs.readFileSync(readmePath, "utf8")

  const start = "<!--START_SECTION:dynamic-->"
  const end = "<!--END_SECTION:dynamic-->"

  const regex = /<!--START_SECTION:dynamic-->[\s\S]*<!--END_SECTION:dynamic-->/

  const newBlock = `${start}
${dynamicContent.trim()}
${end}`

  if (!regex.test(content)) {
    console.error("❌ Bloco dinâmico NÃO encontrado no README")
    console.error("👉 Verifique se existe exatamente:")
    console.error(start)
    console.error(end)
    process.exit(1)
  }

  // 🔥 Remove seção "IMPORTANTE" de forma robusta (somente no README final)
 content = content.replace(
  /<!--START_IMPORTANTE-->[\s\S]*?<!--END_IMPORTANTE-->/g,
  ''
).trim()

  const updated = content.replace(regex, newBlock)

  fs.writeFileSync(readmePath, updated, "utf8")

  console.log("✅ README atualizado com sucesso (sem seção IMPORTANTE)")
}

async function main() {

  const now = DateTime.now().setZone(TIMEZONE)
  const next = now.plus({ minutes: INTERVAL })

  const user = await fetchGitHub()

  const repos = user.repositories.nodes

  const followers = user.followers.totalCount
  const stars = repos.reduce((a, r) => a + r.stargazerCount, 0)

  const dynamicContent = `
## 🔄 Atualização Automática

🕒 Última atualização:  
${now.toFormat("dd/MM/yyyy HH:mm:ss")} (Horário de Brasília)

🔁 Próxima atualização automática:  
${next.toFormat("dd/MM/yyyy HH:mm:ss")} (Horário de Brasília)

📊 **Followers:** ${followers}  
⭐ **Stars:** ${stars}
`

  updateReadme(dynamicContent)
}

main()