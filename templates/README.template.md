# 🚀 GitHub Profile Auto Updater  

✨ **Automatize seu README e deixe seu perfil sempre atualizado, profissional e impactante!**

Projeto em **Node.js** que atualiza automaticamente o README do perfil do GitHub usando **GitHub Actions**, gerando estatísticas, dashboards e badges dinâmicos em tempo real.

---

## 🔥 Destaques

- 📊 Estatísticas atualizadas automaticamente  
- 🧠 Organização inteligente por linguagem  
- ⚡ Atualização contínua (a cada 5 minutos)  
- 🕒 Controle de horário de execução  
- 🔁 Sistema de retry automático  
- 🧼 Evita commits desnecessários  
- 🎨 Dashboards e badges em SVG dinâmicos  
- 💼 Ideal para destacar seu perfil no **GitHub e LinkedIn**  

---

## ⚠️ Requisitos para funcionamento perfeito

Para garantir que o bot funcione sem falhas:

- 💻 **Deixe o computador ligado**  
- 🧠 **Mantenha o VS Code aberto (recomendado para testes locais)**  
- 🌐 Certifique-se de que há conexão com a internet  
- 🔑 Tokens e configurações devem estar corretos  

> 💡 *Mesmo rodando via GitHub Actions, manter o ambiente local ativo ajuda em testes e estabilidade.*

---

## 🛠️ Tecnologias Utilizadas

- Node.js  
- GitHub Actions  
- GitHub REST API  
- JSON  
- Markdown  
- SVG (dashboards e badges)  

---

## 📁 Estrutura do Projeto

### 🧠 Templates
- `templates/README.template.md` → Base do README com placeholders dinâmicos  

---

### ⚙️ Scripts

- `scripts/update-readme.js` → Atualiza o README automaticamente  
- `scripts/generate-dashboard.js` → Gera dashboards em SVG  
- `scripts/generate-cron.js` → Controla horários de execução  
- `scripts/bot-local.js` → Execução local  
- `iniciar-bot.bat` → Inicialização rápida no Windows  

---

### 🔧 Configurações

- `.github/settings.json` → Define usuário, horário e intervalos  

---

### 🤖 Automação

- `.github/workflows/update-readme.yml`  
  Executa automaticamente e permite execução manual  

---

### 📄 Arquivos principais

- `README.md` → Gerado automaticamente  
- `package.json` → Dependências  
- `package-lock.json` → Controle de versões  
- `.gitignore` → Arquivos ignorados  

---

## ⚙️ Como Funciona

1. GitHub Actions executa o script  
2. O bot consulta a GitHub API  
3. Os dados são processados  
4. O README é gerado automaticamente  
5. Se não houver mudanças → nenhum commit é feito  

---

## 📊 Dashboard

<p align="center">
  <img src="./assets/dashboard.svg" />
</p>

---

<!--START_SECTION:dynamic-->

## 🔄 Atualização Automática

🕒 **Última atualização:**  
Carregando...

🔁 **Próxima atualização:**  
Carregando...

<!--END_SECTION:dynamic-->

---

## ▶️ Executar Manualmente

### 🔹 No GitHub
1. Vá em **Actions**  
2. Clique em **Update README**  
3. Selecione **Run workflow**  

---

### 🔹 Localmente

```bash
node scripts/bot-local.js

Ou no Windows:

iniciar-bot.bat

---

#3💡 Ideal para
💼 Portfólio profissional
📄 README de perfil
🤖 Projetos de automação
🔗 Destaque no LinkedIn
🧠 Demonstração de habilidades com APIs

##👩‍💻 Autora
<p align="center"> <a href="https://www.linkedin.com/in/rafaelasommergon%C3%A7alves16/"> <img src="https://img.shields.io/badge/LinkedIn-Rafaela%20Sommer-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white"/> </a> <a href="https://github.com/RafaelaSommer"> <img src="https://img.shields.io/badge/GitHub-RafaelaSommer-181717?style=for-the-badge&logo=github&logoColor=white"/> </a> <a href="https://wa.me/5519971015465"> <img src="https://img.shields.io/badge/WhatsApp-Entre%20em%20contato-25D366?style=for-the-badge&logo=whatsapp&logoColor=white"/> </a> </p>

##🌟 Diferencial

✔️ README sempre atualizado automaticamente
✔️ Perfil mais profissional e atrativo
✔️ Destaque imediato para recrutadores
✔️ Integração perfeita com GitHub e LinkedIn

##💬 Sobre

Desenvolvedora focada em automação, dados e boas práticas, criando soluções inteligentes com:

🐍 Python
🔗 APIs
⚙️ GitHub Actions
⚠️ IMPORTANTE
✏️ Edite apenas: templates/README.template.md
🤖 O README.md é gerado automaticamente