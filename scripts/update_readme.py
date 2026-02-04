from datetime import datetime, timedelta, timezone
import requests
import json
import re
import os
from collections import Counter

# ==============================
# CONTROLE DE EXECUÇÃO
# ==============================
SCRIPT_ATIVO = False  # ← mude para True quando quiser reativar

if not SCRIPT_ATIVO:
    print("⏸️ Script temporariamente desativado")
    exit(0)

# ==============================
# CONFIGURAÇÕES
# ==============================
USERNAME = "RafaelaSommer"
README_PATH = "README.md"
SETTINGS_PATH = ".github/settings.json"
TOKEN = os.getenv("GITHUB_TOKEN")

BRAZIL_TZ = timezone(timedelta(hours=-3))
TZ_LABEL = "Horário de Brasília"

now_utc = datetime.now(timezone.utc)
now_brazil = now_utc.astimezone(BRAZIL_TZ)

# ==============================
# FUNÇÕES
# ==============================
def load_settings(path):
    if not os.path.exists(path):
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
    except Exception:
        return {}

settings = load_settings(SETTINGS_PATH)

headers = {"Accept": "application/vnd.github+json"}
if TOKEN:
    headers["Authorization"] = f"Bearer {TOKEN}"

# ==============================
# BUSCAR REPOSITÓRIOS
# ==============================
repos = []
page = 1
while True:
    response = requests.get(
        f"https://api.github.com/users/{USERNAME}/repos?per_page=100&page={page}",
        headers=headers
    )
    response.raise_for_status()
    batch = response.json()
    if not batch:
        break
    repos.extend(batch)
    page += 1

# ==============================
# CONTAGENS
# ==============================
total_projects = len(repos)

languages = Counter()
for repo in repos:
    if repo.get("language"):
        languages[repo["language"]] += 1

lang_lines = "<br>\n".join(
    f"• {lang}: {count}" for lang, count in languages.most_common()
) if languages else "• Nenhuma linguagem detectada"

last_update = now_brazil.strftime("%d/%m/%Y %H:%M:%S")

# ==============================
# ATUALIZAR SETTINGS.JSON
# ==============================
settings.update({
    "username": USERNAME,
    "total_projects": total_projects,
    "languages": dict(languages),
    "last_update": last_update,
    "updated_by": "manual-run"
})

os.makedirs(".github", exist_ok=True)
with open(SETTINGS_PATH, "w", encoding="utf-8") as f:
    json.dump(settings, f, indent=2, ensure_ascii=False)

# ==============================
# BLOCO README
# ==============================
info_block = (
    "<!-- INFO-START -->\n"
    "📌 <strong>Últimas Atualizações</strong><br>\n"
    f"📊 <strong>Total de projetos:</strong> {total_projects}<br>\n"
    "🧠 <strong>Projetos por linguagem:</strong><br>\n"
    f"{lang_lines}<br>\n"
    "⏸️ <strong>Atualização automática:</strong> pausada temporariamente<br>\n"
    f"⏱️ <strong>Última atualização:</strong> {last_update} ({TZ_LABEL})\n"
    "<!-- INFO-END -->"
)

# ==============================
# ATUALIZAR README
# ==============================
with open(README_PATH, "r", encoding="utf-8") as f:
    content = f.read()

pattern = r"<!-- INFO-START -->.*?<!-- INFO-END -->"

if re.search(pattern, content, flags=re.DOTALL):
    content = re.sub(pattern, info_block, content, flags=re.DOTALL)
else:
    content += "\n\n" + info_block

with open(README_PATH, "w", encoding="utf-8") as f:
    f.write(content)
