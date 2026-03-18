#!/usr/bin/env node

require("dotenv").config()

const fs = require("fs")
const path = require("path")
const axios = require("axios")
const { DateTime } = require("luxon")

const ROOT = path.join(__dirname,"..")

const SETTINGS = JSON.parse(
  fs.readFileSync(path.join(ROOT,".github/settings.json"),"utf8")
)

const USER = SETTINGS.github_user
const TIMEZONE = SETTINGS.timezone
const INTERVAL = SETTINGS.interval_minutes

const TOKEN = process.env.GITHUB_TOKEN

if(!TOKEN){
  console.error("❌ GITHUB_TOKEN não encontrado")
  process.exit(1)
}

async function fetchGitHub(){

  const query = `
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

  const res = await axios.post(
    "https://api.github.com/graphql",
    {query},
    {
      headers:{
        Authorization:`Bearer ${TOKEN}`
      }
    }
  )

  return res.data.data.user

}

function updateReadme(dynamicContent){

  const readmePath = path.join(ROOT,"README.md")

  let content = fs.readFileSync(readmePath,"utf8")

  const start = "<!--START_SECTION:dynamic-->"
  const end = "<!--END_SECTION:dynamic-->"

  const regex = new RegExp(`${start}[\\s\\S]*${end}`)

  const newBlock = `${start}
${dynamicContent}
${end}`

  if(!regex.test(content)){
    console.log("⚠️ Bloco dinâmico não encontrado no README")
    process.exit(1)
  }

  const updated = content.replace(regex,newBlock)

  fs.writeFileSync(readmePath,updated)

}

async function main(){

  const now = DateTime.now().setZone(TIMEZONE)
  const next = now.plus({ minutes: INTERVAL })

  const user = await fetchGitHub()

  const repos = user.repositories.nodes

  const followers = user.followers.totalCount
  const stars = repos.reduce((a,r)=>a+r.stargazerCount,0)

  const dynamicContent = `
## 🔄 Atualização Automática

🕒 Última atualização:  
${now.toFormat("dd/MM/yyyy HH:mm:ss")} (Horário de Brasília)

🔁 Próxima atualização automática:  
${next.toFormat("dd/MM/yyyy HH:mm:ss")} (Horário de Brasília)

📊 **Followers:** ${followers}  
📦 **Projetos:** ${repos.length}  
⭐ **Stars:** ${stars}
`

  updateReadme(dynamicContent)

}

main()