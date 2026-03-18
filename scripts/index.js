#!/usr/bin/env node

const axios = require("axios");
const generateDashboard = require("./generate-dashboard");

const USERNAME = "RafaelaSommer";

if (!process.env.GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN não encontrado");
  process.exit(1);
}

async function fetchGitHubData() {
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };

  try {
    // 👤 Usuário
    const userRes = await axios.get(
      `https://api.github.com/users/${USERNAME}`,
      { headers }
    );

    // 📦 Repositórios
    const reposRes = await axios.get(
      `https://api.github.com/users/${USERNAME}/repos?per_page=100`,
      { headers }
    );

    const repos = reposRes.data;

    // ⭐ Stars
    const totalStars = repos.reduce(
      (acc, repo) => acc + repo.stargazers_count,
      0
    );

    // 💻 Linguagens
    const languages = {};

    repos.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] =
          (languages[repo.language] || 0) + 1;
      }
    });

    return {
      followers: userRes.data.followers,
      totalProjects: repos.length,
      stars: totalStars,
      languages,
      repos: repos.map((r) => ({
        name: r.name,
        stars: r.stargazers_count,
        language: r.language,
      })),
    };

  } catch (error) {
    console.error("❌ Erro na API do GitHub:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Mensagem:", error.response.data);
    } else {
      console.error(error.message);
    }

    process.exit(1);
  }
}

async function main() {
  const data = await fetchGitHubData();

  generateDashboard(data);

  console.log("✅ Dashboard atualizado!");
}

main();