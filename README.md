# GitHub Profile Auto Updater 🚀

Projeto em **Python** que atualiza automaticamente o README do perfil do GitHub usando **GitHub Actions**.

Ele coleta informações do próprio GitHub e mantém o README sempre atualizado, sem intervenção manual.

---

## ✨ Funcionalidades

- 📊 Total de repositórios públicos  
- 🧠 Contagem de projetos por linguagem  
- ⏱️ Execução automática a cada 2 horas  
- 🔁 Atualização imediata via workflow manual  
- 🧼 Evita commits quando não há mudanças  

---

## 🛠️ Tecnologias Utilizadas

- **Python 3.11**
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

### 📌 Últimas Atualizações

📊 <strong>Total de projetos:</strong> 8<br>
🧠 <strong>Projetos por linguagem:</strong><br>
• Python: 3<br>• C#: 1<br>
🔄 <strong>Atualização automática:</strong> GitHub Actions<br>

⏱️ <strong>Última atualização:</strong><br>
• 10/02/2026 16:58 (Horário de Brasília)<br>

🔮 <strong>Próxima atualização prevista:</strong><br>
• 10/02/2026 17:00 (Horário de Brasília)<br>

---

## ▶️ Executar Manualmente

1. Vá até a aba **Actions** do repositório  
2. Selecione o workflow **Update Profile README**  
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
### Rafaela Sommer  

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rafaela%20Sommer-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rafaelasommergon%C3%A7alves16/)
[![GitHub](https://img.shields.io/badge/GitHub-RafaelaSommer-181717?style=for-the-badge&logo=github)](https://github.com/RafaelaSommer)

### 🔎 Repositório do Projeto

[![Repo](https://img.shields.io/badge/Repositório-GitHub--Profile--Auto--Updater-24292e?style=for-the-badge&logo=github)](https://github.com/RafaelaSommer/RafaelaSommer.git)

---

### 💡 Sobre

Desenvolvedora focada em **automação**, **dados** e **boas práticas**, utilizando  
**Python**, **GitHub Actions** e **APIs** para criar soluções inteligentes e reutilizáveis.

---

⚠️ **Este arquivo é um template**  
✏️ Edite apenas `templates/README.template.md`  
🤖 O arquivo `README.md` é gerado automaticamente
