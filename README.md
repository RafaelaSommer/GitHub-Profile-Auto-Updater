# GitHub Profile Auto Updater 🚀

Projeto em **Python** que atualiza automaticamente o README do perfil do GitHub usando **GitHub Actions**.

Ele coleta informações do próprio GitHub e mantém o README sempre atualizado, sem intervenção manual.

---

## ✨ Funcionalidades

- 📊 Total de repositórios públicos
- 🧠 Contagem de projetos por linguagem
- 🕛 Horários fixos de atualização (12h e 19h – Horário de Brasília)
- ⏱️ Execução automática a cada 10 minutos
- 🔁 Atualização imediata via workflow manual
- 🧼 Evita commits quando não há mudanças

---

## 🛠️ Tecnologias Utilizadas

- **Python 3.11**
- **GitHub Actions**
- **GitHub REST API**
- **Requests**
- **Regex**
- **JSON**
- **Markdown**

---

## 📁 Estrutura do Projeto

.
├── scripts/
│ └── update_readme.py # Script principal de atualização
├── .github/
│ ├── workflows/
│ │ └── update-readme.yml # Workflow do GitHub Actions
│ └── settings.json # Dados gerados automaticamente
├── README.md # README do perfil
├── requirements.txt


---

## ⚙️ Como Funciona

1. O GitHub Actions executa o script Python
2. O script consulta a API do GitHub
3. Os dados são processados e salvos em `.github/settings.json`
4. O bloco entre `<!-- INFO-START -->` e `<!-- INFO-END -->` é atualizado no README
5. Se não houver mudanças, nenhum commit é feito

---

## ▶️ Executar Manualmente

1. Vá até a aba **Actions** do repositório
2. Selecione o workflow **Atualizar README do Perfil**
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

**Rafaela Sommer**  
GitHub: https://github.com/RafaelaSommer# GitHub-Profile-Auto-Updater
