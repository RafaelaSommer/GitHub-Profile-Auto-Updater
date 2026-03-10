#!/usr/bin/env node

require("dotenv").config()

const fs = require("fs")
const path = require("path")
const axios = require("axios")
const { DateTime } = require("luxon")
const { execSync } = require("child_process")
const generateDashboard = require("./generate-dashboard")
const { readCache, writeCache } = require("./cache")

const ROOT = path.join(__dirname,"..")

const SETTINGS = JSON.parse(
  fs.readFileSync(path.join(ROOT,".github/settings.json"))
)

const USER = SETTINGS.github_user
const TIMEZONE = SETTINGS.timezone
const INTERVAL = SETTINGS.interval_minutes

const TOKEN = process.env.GITHUB_TOKEN

if(!TOKEN){
  console.error("❌ GITHUB_TOKEN não encontrado no .env")
  process.exit(1)
}

function configureGit(){

  try{

    execSync(`git config user.name "${SETTINGS.gitUser}"`,{cwd:ROOT})
    execSync(`git config user.email "${SETTINGS.gitEmail}"`,{cwd:ROOT})

    const repo = `https://${TOKEN}@github.com/${USER}/${USER}.git`

    execSync(`git remote set-url origin ${repo}`,{cwd:ROOT})

  }catch(e){

    console.log("git já configurado")

  }

}

async function fetchGitHub(){

  try{

    let hasNextPage = true
    let cursor = null

    let allRepos = []
    let followers = 0

    while(hasNextPage){

      const query = `
      query {
        user(login:"${USER}") {
          followers { totalCount }
          repositories(first:100 ${cursor ? `after:"${cursor}"` : ""}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              name
              stargazerCount
              primaryLanguage { name }
              languages(first:5){
                edges{
                  size
                  node{ name }
                }
              }
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

      const user = res.data.data.user

      followers = user.followers.totalCount

      const repos = user.repositories.nodes

      allRepos = allRepos.concat(repos)

      hasNextPage = user.repositories.pageInfo.hasNextPage
      cursor = user.repositories.pageInfo.endCursor

    }

    const data = {
      followers,
      repositories:{
        nodes:allRepos
      }
    }

    writeCache({
      lastFetch:Date.now(),
      data
    })

    return data

  }catch(err){

    console.log("⚠️ API falhou, usando cache")

    const cache = readCache()

    if(cache.data){
      return cache.data
    }

    throw err

  }

}

function buildLanguages(repos){

  const map = {}

  repos.forEach(r=>{

    if(!r.languages) return

    r.languages.edges.forEach(lang=>{

      const name = lang.node.name
      map[name]=(map[name]||0)+lang.size

    })

  })

  return map
}

function commit(){

  try{

    execSync("git add .",{cwd:ROOT})

    const status = execSync(
      "git status --porcelain",
      {cwd:ROOT}
    ).toString()

    if(!status){
      console.log("📭 Nenhuma Mudança")
      return
    }

    const msg = `🤖 Auto Update ${DateTime.now().toFormat("HH:mm:ss")}`

    execSync(
      `git commit -m "${msg}"`,
      {cwd:ROOT,stdio:"inherit"}
    )

    execSync(
      "git push origin HEAD",
      {cwd:ROOT,stdio:"inherit"}
    )

    console.log("🚀 Push Realizado com sucesso!")

  }catch(e){

    console.error("erro git:",e.message)

  }

}

async function main(){

  configureGit()

  const now = DateTime.now().setZone(TIMEZONE)

  const user = await fetchGitHub()

  const repos = user.repositories.nodes

  const followers = user.followers

  const stars = repos.reduce(
    (a,r)=>a+(r.stargazerCount || 0),0
  )

  const languages = buildLanguages(repos)

  const formattedRepos = repos.map(r=>({
    name:r.name,
    stars:r.stargazerCount,
    language:r.primaryLanguage
      ? r.primaryLanguage.name
      : "—"
  }))

  generateDashboard({
    followers,
    totalProjects: repos.length,
    stars,
    languages,
    repos: formattedRepos
  })

  const template = fs.readFileSync(
    path.join(ROOT,"templates/README.template.md"),
    "utf8"
  )

  const readme = template
  .replace("{last_update}",now.toFormat("dd/MM/yyyy HH:mm:ss"))
  .replace("{next_update}",now.plus({minutes:INTERVAL}).toFormat("dd/MM/yyyy HH:mm:ss"))
  + `\n<!-- ${Date.now()} -->`

  fs.writeFileSync(path.join(ROOT,"README.md"),readme)

  commit()

}

main()