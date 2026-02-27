# GitHub Profile Auto Updater 🚀

Projeto em **Python** que atualiza automaticamente o README do perfil do GitHub usando **GitHub Actions**.

Ele coleta informações do próprio GitHub e mantém o README sempre atualizado, sem intervenção manual.

---

## ✨ Funcionalidades

- 📊 Monitoramento automático de estatísticas do perfil  
- 🧠 Distribuição inteligente de projetos por linguagem  
- 🔄 Atualização híbrida com horários fixos e intervalo controlado  
- 🕒 Execução otimizada dentro do horário comercial  
- 🚀 Sistema de retry automático para maior estabilidade  
- 🧼 Commit inteligente (evita alterações desnecessárias)  
- 🎨 Geração dinâmica de badges com paleta avançada de cores  

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
Responsáveis por coletar dados do GitHub e gerar o README automaticamente.

- `scripts/update_readme.py`  
  Script principal que consulta a GitHub API e gera o `README.md`.

---

### 🔧 Configurações
Centraliza as informações do projeto.

- `config/settings.json`  
  Usuário do GitHub, fuso horário e intervalo de atualização.

---

### 🤖 Automação (GitHub Actions)
Workflows que executam o script automaticamente.

- `.github/workflows/update-readme.yml`  
  Agenda a execução automática e permite execução manual.

---

### 📄 Arquivos principais

- `README.md`  
  README final do perfil (gerado automaticamente).

- `requirements.txt`  
  Dependências do projeto.

- `.gitignore`  
  Arquivos ignorados pelo Git.

---

## ⚙️ Como Funciona

1. O **GitHub Actions** executa o script Python  
2. O script consulta a **GitHub REST API**  
3. Os dados são processados em tempo real  
4. O `README.md` é gerado a partir do `README.template.md`  
5. Se não houver alterações, **nenhum commit é feito**  

---

## 📊 Última Atualização Automática

📌 **Últimas Atualizações**  

📦 **Total de projetos:** 9  
👥 **Seguidores:** 303  
⭐ **Total de Stars recebidas:** 15  

🧠 **Projetos por linguagem:**  
![Python](https://img.shields.io/badge/Python-3-ff6b6b?style=flat) ![C#](https://img.shields.io/badge/C%23-3-feca57?style=flat) ![Jupyter Notebook](https://img.shields.io/badge/Jupyter%20Notebook-1-48dbfb?style=flat) ![JavaScript](https://img.shields.io/badge/JavaScript-1-1dd1a1?style=flat) ![TSQL](https://img.shields.io/badge/TSQL-1-5f27cd?style=flat)

⚙️ **Atualização automática:** GitHub Actions (a cada 20 minutos)

🕒 **Última atualização:**  
27-02-2026_16-06 (Horário de Brasília)

🔄 **Próxima atualização automática:**  
27/02/2026 16:26 (Horário de Brasília)

⏭ **Próxima atualização principal:**  
27/02/2026 18:00 (Horário de Brasília)

---

## ▶️ Executar Manualmente

1. Vá até a aba **Actions** do repositório  
2. Selecione o workflow **Update README**  
3. Clique em **Run workflow**  

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
