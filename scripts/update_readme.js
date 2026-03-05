#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { DateTime } = require("luxon");
const { execSync } = require("child_process");
const generateSVG = require("./generate-dashboard");

const ROOT = path.join(__dirname, "..");

const SETTINGS = JSON.parse(
  fs.readFileSync(path.join(ROOT, ".github/settings.json"))
);

const TIMEZONE = SETTINGS.timezone;
const USER = SETTINGS.github_user;
const INTERVAL = SETTINGS.interval_minutes;

function log(msg){
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

/* -------------------------------------------------- */
/* FETCH GITHUB DATA                                  */
/* -------------------------------------------------- */
async function fetchGitHub(){

  const query = `
  query {
    user(login:"${USER}") {
      followers { totalCount }
      repositories(first:100, ownerAffiliations:OWNER) {
        totalCount
        nodes {
          name
          stargazerCount
          languages(first:10){
            edges{
              size
              node{ name }
            }
          }
        }
      }
    }
  }`;

  const res = await axios.post(
    "https://api.github.com/graphql",
    { query },
    {
      timeout: 15000,
      headers:{
        Authorization:`Bearer ${process.env.GITHUB_TOKEN}`
      }
    }
  );

  return res.data.data.user;
}

/* -------------------------------------------------- */
/* BUILD LANGUAGE MAP                                 */
/* -------------------------------------------------- */
function buildLanguageMap(repositories){

  const map = {};

  repositories.forEach(repo=>{
    repo.languages.edges.forEach(lang=>{
      const name = lang.node.name;
      const size = lang.size;
      map[name] = (map[name] || 0) + size;
    });
  });

  return map;
}

/* -------------------------------------------------- */
/* SAFE COMMIT                                        */
/* -------------------------------------------------- */
function commitIfChanged(){

  execSync("git add README.md assets/dashboard.svg",{cwd:ROOT});

  try{
    execSync(`git commit -m "♻️ README auto-update [skip ci]"`,{cwd:ROOT});
  }catch{
    log("ℹ️ Nenhuma alteração detectada.");
    return false;
  }

  execSync("git push",{cwd:ROOT,stdio:"inherit"});
  return true;
}

/* -------------------------------------------------- */
/* MAIN                                               */
/* -------------------------------------------------- */
async function main(){

  const now = DateTime.now().setZone(TIMEZONE);

  log("🔎 Buscando dados do GitHub...");
  const user = await fetchGitHub();

  const followers = user.followers.totalCount;
  const totalProjects = user.repositories.totalCount;
  const reposRaw = user.repositories.nodes;

  const stars = reposRaw.reduce(
    (acc,r)=>acc+r.stargazerCount,0
  );

  const languageMap = buildLanguageMap(reposRaw);

  /* 🔥 FORMATAÇÃO PARA DASHBOARD */
  const repos = reposRaw.map(r => ({
    name: r.name,
    stars: r.stargazerCount,
    language: r.languages.edges[0]?.node?.name || "—"
  }));

  /* ----------------------------------------------- */
  /* GENERATE DASHBOARD SVG                         */
  /* ----------------------------------------------- */
  generateSVG({
    followers,
    totalProjects,
    stars,
    languages: languageMap,
    repos
  });

  /* ----------------------------------------------- */
  /* UPDATE README                                   */
  /* ----------------------------------------------- */
  const template = fs.readFileSync(
    path.join(ROOT,"templates/README.template.md"),
    "utf8"
  );

  const finalReadme = template
    .replace(/{last_update}/g,
      now.toFormat("dd/MM/yyyy HH:mm:ss"))
    .replace(/{next_update}/g,
      now.plus({minutes:INTERVAL})
      .toFormat("dd/MM/yyyy HH:mm:ss")
    );

  fs.writeFileSync(
    path.join(ROOT,"README.md"),
    finalReadme
  );

  if(commitIfChanged()){
    log("🚀 Atualização enviada.");
  }

}

main();