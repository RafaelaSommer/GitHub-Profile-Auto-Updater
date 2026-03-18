const axios = require("axios");
const generateDashboard = require("./generate-dashboard")

const USERNAME = "RafaelaSommer";

async function fetchGitHubData() {
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };

  // 👤 Dados do usuário
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

  // ⭐ Total de stars
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
}

(async () => {
  try {
    const data = await fetchGitHubData();
    generateDashboard(data);
    console.log("✅ Dashboard atualizado!");
  } catch (err) {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  }
})();