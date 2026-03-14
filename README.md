# GitHub Profile Auto Updater 🚀

Projeto em **Node.js** que atualiza automaticamente o README do perfil do GitHub usando **GitHub Actions**.

Ele coleta informações do próprio GitHub, gera dashboards e badges, e mantém o README sempre atualizado, sem intervenção manual.

---

## ✨ Funcionalidades

- 📊 Monitoramento automático de estatísticas do perfil  
- 🧠 Distribuição inteligente de projetos por linguagem  
- ⏱️ Atualização automática a cada 20 minutos, com horário controlado das 7h às 23h  
- 🕒 Execução otimizada dentro do horário permitido  
- 🚀 Sistema de retry automático para maior estabilidade  
- 🧼 Commit inteligente (evita alterações desnecessárias)  
- 🎨 Geração dinâmica de badges e dashboards em SVG  

---

## 🛠️ Scripts e Ferramentas

- `generate-cron.js` — Calcula os próximos horários de execução e controla o agendamento.  
- `update-readme.js` — Script principal que atualiza o `README.md` a partir do template.  
- `generate-svg.js` — Gera badges e dashboards em SVG com base nas estatísticas.  
- `bot-local.js` — Permite execução local e testes do bot.  
- `iniciar-bot.bat` — Script para iniciar o bot diretamente no Windows.

---

## 🛠️ Tecnologias Utilizadas

- **GitHub Actions**
- **GitHub REST API**
- **Requests**
- **JSON**
- **Markdown**
- **Node.js**

---

## 📁 Estrutura do Projeto

### 🧠 Templates
Arquivos base usados para gerar automaticamente o README final.

- `templates/README.template.md`  
  Template do README, onde ficam os textos fixos e os placeholders dinâmicos.

---

### ⚙️ Scripts
Responsáveis por coletar dados do GitHub, gerar dashboards e atualizar o README automaticamente.

- `scripts/update-readme.js`  
  Script principal que consulta a GitHub API, processa os dados e gera o `README.md`.  
- `scripts/generate-dashboard.js`  
  Gera badges e dashboards em SVG com base nas estatísticas do perfil.  
- `scripts/generate-cron.js`  
  Calcula os próximos horários de atualização e controla a execução do bot.  
- `scripts/bot-local.js`  
  Permite executar o bot localmente para testes e atualizações manuais.  
- `iniciar-bot.bat`  
  Script para iniciar o bot diretamente no Windows.

---

### 🔧 Configurações
Centraliza as informações do projeto.

- `.github/settings.json`  
  Usuário do GitHub, fuso horário, intervalo de atualização e horários permitidos.

---

### 🤖 Automação (GitHub Actions)
Workflows que executam os scripts automaticamente.

- `.github/workflows/update-readme.yml`  
  Agenda a execução automática a cada 20 minutos, dentro do horário permitido, e permite execução manual.

---

### 📄 Arquivos principais

- `README.md`  
  README final do perfil (gerado automaticamente).  
- `package.json`  
  Dependências do projeto Node.js e scripts NPM.  
- `package-lock.json`  
  Trava de versões de pacotes.  
- `.gitignore`  
  Arquivos e pastas ignorados pelo Git.
---

## ⚙️ Como Funciona

1. O **GitHub Actions** executa o script JavaScript 
2. O script consulta a **GitHub REST API**  
3. Os dados são processados em tempo real  
4. O `README.md` é gerado a partir do `README.template.md`  
5. Se não houver alterações, **nenhum commit é feito**  

---

## 📊 Dashboard

![Dashboard](./assets/dashboard.svg)

---

<!--START_SECTION:dynamic-->

📊 **Followers:** 336

📦 **Projetos:** 9

⭐ **Stars:** 7

🕒 Última atualização:  
14/03/2026 09:48:36

<!--END_SECTION:dynamic-->

---

## ▶️ Executar Manualmente

### No GitHub
1. Vá até a aba **Actions** do repositório.  
2. Selecione o workflow **Update README**.  
3. Clique em **Run workflow**.

### Localmente
1. Execute `bot-local.js` via Node.js.  
2. Ou use o `iniciar-bot.bat` no Windows para iniciar o bot.

---

## 📌 Exemplo de Uso

Ideal para:
- README de perfil  
- Portfólio de desenvolvedor  
- Demonstração de automação com GitHub Actions  
- Projetos open source  

---

## 👩‍💻 Autora  

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rafaela%20Sommer-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rafaelasommergon%C3%A7alves16/)
[![GitHub](https://img.shields.io/badge/GitHub-RafaelaSommer-181717?style=for-the-badge&logo=github)](https://github.com/RafaelaSommer)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Entre%20em%20contato-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/5519971015465)

---

### 💡 Sobre

Desenvolvedora focada em **automação**, **dados** e **boas práticas**, utilizando  
**Python**, **GitHub Actions** e **APIs** para criar soluções inteligentes e reutilizáveis.

---

⚠️ **Este arquivo é um template**  
✏️ Edite apenas `templates/README.template.md`  
🤖 O arquivo `README.md` é gerado automaticamente
