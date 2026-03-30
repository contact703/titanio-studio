#!/usr/bin/env python3
"""
Victor Capital — Buscador Semanal de Editais
Titanio Studio | Atualizado: 2026-03-18

Busca editais abertos em fontes relevantes para a Titanio:
- FINEP, BNDES, FAPEMIG, FAPs estaduais
- Aceleradoras internacionais: Microsoft, Google, NVIDIA, YC
- Filtra por relevância: audiovisual, tecnologia, IA, cultura, acessibilidade

Uso:
    python buscar-editais.py
    python buscar-editais.py --verbose
    python buscar-editais.py --saida /caminho/personalizado/

Saída:
    editais-semana-YYYY-MM-DD.json
    editais-semana-YYYY-MM-DD.md (relatório resumido)
"""

import json
import argparse
import sys
from datetime import datetime, timedelta
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("⚠️  Dependências ausentes. Instalando...")
    import subprocess
    # Tentar instalação com flag para macOS Homebrew Python
    for pip_flags in [
        [sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4", "lxml"],
        [sys.executable, "-m", "pip", "install", "--break-system-packages", "requests", "beautifulsoup4", "lxml"],
        [sys.executable, "-m", "pip", "install", "--user", "requests", "beautifulsoup4", "lxml"],
    ]:
        try:
            subprocess.check_call(pip_flags, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            break
        except subprocess.CalledProcessError:
            continue
    import requests
    from bs4 import BeautifulSoup

# ─────────────────────────────────────────────
# CONFIGURAÇÃO
# ─────────────────────────────────────────────

BASE_DIR = Path(__file__).parent.parent
SAIDA_DIR = BASE_DIR

KEYWORDS_RELEVANTES = [
    # Audiovisual e mídia
    "audiovisual", "cinema", "filme", "série", "tv", "televisão", "streaming",
    "produção audiovisual", "conteúdo digital", "mídia",
    # Tecnologia e IA
    "inteligência artificial", "ia ", " ai ", "machine learning", "deep learning",
    "nlp", "processamento de linguagem", "visão computacional", "tts", "síntese de voz",
    "tecnologia", "inovação", "software", "aplicativo", "app", "plataforma digital",
    # Acessibilidade e impacto social
    "acessibilidade", "audiodescrição", "deficiência visual", "inclusão digital",
    "impacto social", "tecnologia assistiva",
    # Cultura e criatividade
    "cultura", "criatividade", "economia criativa", "indústria criativa",
    "artes", "entretenimento",
    # Startups
    "startup", "empreendedorismo", "scale-up", "inovação aberta",
    # Mercados
    "educação", "edtech", "healthtech", "games", "animação",
]

KEYWORDS_BLOQUEIO = [
    "defesa nacional", "armamentos", "militar", "agropecuária exclusiva",
    "saneamento básico", "infraestrutura portuária", "mineração",
]

FONTES = [
    {
        "nome": "FINEP",
        "url": "http://www.finep.gov.br/chamadas-publicas?situacao=aberta",
        "tipo": "scraping",
        "seletor_itens": "table tbody tr, .chamada-item, .views-row",
        "seletor_titulo": "td:first-child a, .chamada-titulo a, h3 a",
        "seletor_data": "td:nth-child(3), .chamada-prazo",
        "seletor_link": "td:first-child a, .chamada-titulo a",
        "base_url": "http://www.finep.gov.br",
        "prioridade": "alta",
    },
    {
        "nome": "BNDES Garagem",
        "url": "https://garagem.bndes.gov.br/",
        "tipo": "estatico",
        "descricao_fixa": "Programa de aceleração de negócios de impacto. Ciclo 3 previsto 2º semestre 2026. Prêmios R$20k–R$30k + aceleração sem equity.",
        "status": "monitorar",
        "prazo_estimado": "2026-07-01",
        "valor": "R$20k–R$30k + aceleração",
        "relevancia": "alta",
        "prioridade": "media",
    },
    {
        "nome": "FAPEMIG",
        "url": "https://fapemig.br/pt/chamadas/",
        "tipo": "scraping",
        "seletor_itens": ".views-row, .chamada, article",
        "seletor_titulo": "h2 a, h3 a, .chamada-titulo",
        "seletor_data": ".field-prazo, .data-limite",
        "seletor_link": "h2 a, h3 a",
        "base_url": "https://fapemig.br",
        "prioridade": "alta",
    },
    {
        "nome": "Microsoft for Startups",
        "url": "https://foundershub.startups.microsoft.com/signup",
        "tipo": "estatico",
        "descricao_fixa": "Microsoft for Startups Founders Hub — até USD 150.000 em créditos Azure + OpenAI API + GitHub Copilot. Programa perene, sem prazo. Inscrição gratuita.",
        "status": "aberto",
        "prazo_estimado": "perene",
        "valor": "USD 150.000 em créditos",
        "relevancia": "critica",
        "prioridade": "urgente",
    },
    {
        "nome": "NVIDIA Inception",
        "url": "https://www.nvidia.com/en-us/startups/",
        "tipo": "estatico",
        "descricao_fixa": "NVIDIA Inception Program — créditos de computação, acesso a hardware e rede de investidores para startups de IA. Gratuito, sem equity, sem prazo.",
        "status": "aberto",
        "prazo_estimado": "perene",
        "valor": "Créditos GPU + ferramentas NVIDIA",
        "relevancia": "critica",
        "prioridade": "urgente",
    },
    {
        "nome": "AWS Activate",
        "url": "https://aws.amazon.com/pt/startups/",
        "tipo": "estatico",
        "descricao_fixa": "AWS Activate Founders — USD 1.000 a USD 100.000 em créditos AWS (SageMaker, Bedrock, ML). Programa perene. Tier Founders grátis, sem aceleradora.",
        "status": "aberto",
        "prazo_estimado": "perene",
        "valor": "USD 1k–100k em créditos AWS",
        "relevancia": "alta",
        "prioridade": "urgente",
    },
    {
        "nome": "Y Combinator",
        "url": "https://www.ycombinator.com/apply",
        "tipo": "estatico",
        "descricao_fixa": "Y Combinator S26 — USD 500k (USD 125k por 7% equity + USD 375k SAFE). Aceleração 3 meses em San Francisco. Encaixe alto para VoxDescriber em inglês.",
        "status": "aberto",
        "prazo_estimado": "2026-05-04",
        "valor": "USD 500.000",
        "relevancia": "alta",
        "prioridade": "alta",
    },
    {
        "nome": "Google for Startups LATAM",
        "url": "https://startup.google.com/programs/accelerator/",
        "tipo": "estatico",
        "descricao_fixa": "Google for Startups Accelerator LATAM — sem equity + mentoria + até USD 200k em créditos Google Cloud + acesso a Gemini/VertexAI.",
        "status": "monitorar",
        "prazo_estimado": "variavel",
        "valor": "USD 200k em créditos Google Cloud",
        "relevancia": "alta",
        "prioridade": "media",
    },
    {
        "nome": "IDB Lab (BID)",
        "url": "https://bidlab.org/en",
        "tipo": "estatico",
        "descricao_fixa": "IDB Lab — grants USD 200k–3M para inovação e impacto social na América Latina. Chamadas periódicas. VoxDescriber tem encaixe forte (acessibilidade + ODS).",
        "status": "monitorar",
        "prazo_estimado": "variavel",
        "valor": "USD 200k–3M",
        "relevancia": "alta",
        "prioridade": "media",
    },
]

# ─────────────────────────────────────────────
# FUNÇÕES PRINCIPAIS
# ─────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
}


def calcular_relevancia(titulo: str, descricao: str = "") -> dict:
    """Calcula score de relevância para a Titanio Studio."""
    texto = (titulo + " " + descricao).lower()
    
    # Checar palavras de bloqueio
    for kw in KEYWORDS_BLOQUEIO:
        if kw in texto:
            return {"score": 0, "nivel": "irrelevante", "matches": []}
    
    matches = []
    for kw in KEYWORDS_RELEVANTES:
        if kw.strip() in texto:
            matches.append(kw.strip())
    
    score = len(matches)
    
    # Bônus para palavras-chave prioritárias
    prioritarias = ["audiovisual", "inteligência artificial", "ia", "acessibilidade",
                    "startup", "inovação", "cultura", "audiodescrição"]
    for p in prioritarias:
        if p in matches:
            score += 2
    
    if score >= 6:
        nivel = "muito_alta"
    elif score >= 4:
        nivel = "alta"
    elif score >= 2:
        nivel = "media"
    elif score >= 1:
        nivel = "baixa"
    else:
        nivel = "irrelevante"
    
    return {"score": score, "nivel": nivel, "matches": matches[:10]}


def scrape_fonte(fonte: dict, verbose: bool = False) -> list:
    """Faz scraping de uma fonte para extrair editais."""
    resultados = []
    
    if verbose:
        print(f"  📡 Acessando {fonte['nome']}...")
    
    try:
        resp = requests.get(fonte["url"], headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")
        
        itens = soup.select(fonte.get("seletor_itens", "article"))
        
        if verbose:
            print(f"  📋 {len(itens)} itens encontrados em {fonte['nome']}")
        
        for item in itens[:30]:  # Limitar a 30 por fonte
            titulo_el = item.select_one(fonte.get("seletor_titulo", "h2 a"))
            link_el = item.select_one(fonte.get("seletor_link", "a"))
            data_el = item.select_one(fonte.get("seletor_data", ".data"))
            
            titulo = titulo_el.get_text(strip=True) if titulo_el else ""
            link = link_el.get("href", "") if link_el else ""
            data_prazo = data_el.get_text(strip=True) if data_el else ""
            
            if not titulo or len(titulo) < 5:
                continue
            
            # Construir URL absoluta
            if link and not link.startswith("http"):
                base = fonte.get("base_url", "")
                link = base + link if link.startswith("/") else base + "/" + link
            
            relevancia = calcular_relevancia(titulo)
            
            if relevancia["nivel"] != "irrelevante":
                resultados.append({
                    "fonte": fonte["nome"],
                    "titulo": titulo,
                    "url": link or fonte["url"],
                    "prazo": data_prazo,
                    "relevancia": relevancia["nivel"],
                    "score_relevancia": relevancia["score"],
                    "keywords_match": relevancia["matches"],
                    "status": "aberto",
                    "tipo": "scraping",
                    "data_captura": datetime.now().isoformat(),
                })
    
    except requests.exceptions.Timeout:
        print(f"  ⚠️  Timeout ao acessar {fonte['nome']} ({fonte['url']})")
    except requests.exceptions.ConnectionError:
        print(f"  ⚠️  Erro de conexão em {fonte['nome']} — verificar manualmente: {fonte['url']}")
    except Exception as e:
        if verbose:
            print(f"  ⚠️  Erro em {fonte['nome']}: {e}")
    
    return resultados


def processar_fonte_estatica(fonte: dict) -> dict:
    """Retorna dados de uma fonte estática (programas perenes)."""
    return {
        "fonte": fonte["nome"],
        "titulo": fonte["nome"],
        "descricao": fonte.get("descricao_fixa", ""),
        "url": fonte["url"],
        "prazo": fonte.get("prazo_estimado", "variavel"),
        "valor": fonte.get("valor", ""),
        "relevancia": fonte.get("relevancia", "alta"),
        "score_relevancia": 10 if fonte.get("relevancia") == "critica" else 7,
        "keywords_match": ["startup", "inovação", "tecnologia"],
        "status": fonte.get("status", "aberto"),
        "prioridade": fonte.get("prioridade", "alta"),
        "tipo": "programa_perene",
        "data_captura": datetime.now().isoformat(),
    }


def buscar_todos_editais(verbose: bool = False) -> list:
    """Executa busca em todas as fontes e retorna lista consolidada."""
    todos = []
    
    print("\n🔍 Iniciando busca de editais...\n")
    
    for fonte in FONTES:
        print(f"➡️  {fonte['nome']} ({fonte['tipo']})")
        
        if fonte["tipo"] == "scraping":
            resultados = scrape_fonte(fonte, verbose)
            todos.extend(resultados)
            print(f"   ✅ {len(resultados)} editais relevantes encontrados")
        
        elif fonte["tipo"] == "estatico":
            resultado = processar_fonte_estatica(fonte)
            todos.append(resultado)
            print(f"   ✅ Programa registrado: {resultado['titulo']}")
    
    # Ordenar por relevância (decrescente) e depois por prazo
    todos.sort(key=lambda x: x.get("score_relevancia", 0), reverse=True)
    
    return todos


def gerar_json(editais: list, data_str: str, saida_dir: Path) -> Path:
    """Salva resultados em JSON."""
    arquivo = saida_dir / f"editais-semana-{data_str}.json"
    
    payload = {
        "data_busca": datetime.now().isoformat(),
        "total_encontrados": len(editais),
        "empresa": "Titanio Studio",
        "cnpj": "Titanio Produções Artísticas Ltda",
        "editais": editais,
    }
    
    with open(arquivo, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    
    return arquivo


def gerar_relatorio_md(editais: list, data_str: str, saida_dir: Path) -> Path:
    """Gera relatório Markdown resumido dos editais encontrados."""
    arquivo = saida_dir / f"editais-semana-{data_str}.md"
    
    hoje = datetime.now().strftime("%d/%m/%Y")
    urgentes = [e for e in editais if e.get("prioridade") == "urgente" or e.get("relevancia") == "critica"]
    altos = [e for e in editais if e.get("relevancia") in ("muito_alta", "alta") and e not in urgentes]
    medios = [e for e in editais if e.get("relevancia") == "media"]
    
    linhas = [
        f"# 📋 Editais da Semana — {hoje}",
        f"**Titanio Studio | Victor Capital | Gerado em:** {hoje}",
        "",
        f"**Total encontrado:** {len(editais)} oportunidades",
        f"- 🔴 Urgentes: {len(urgentes)}",
        f"- 🟠 Alta relevância: {len(altos)}",
        f"- 🟡 Média relevância: {len(medios)}",
        "",
        "---",
        "",
        "## 🔴 AÇÃO IMEDIATA (Hoje/Esta Semana)",
        "",
    ]
    
    for e in urgentes:
        linhas += [
            f"### {e['fonte']} — {e.get('titulo', e['fonte'])}",
            f"- **Valor:** {e.get('valor', 'Ver site')}",
            f"- **Prazo:** {e.get('prazo', 'Perene')}",
            f"- **Status:** {e.get('status', 'Aberto')}",
            f"- **URL:** {e['url']}",
            f"- **Descrição:** {e.get('descricao', '')}",
            "",
        ]
    
    linhas += [
        "---",
        "",
        "## 🟠 ALTA PRIORIDADE",
        "",
    ]
    
    for e in altos[:10]:
        prazo_display = e.get("prazo", "Verificar")
        linhas += [
            f"### {e['fonte']} — {e.get('titulo', e['fonte'])}",
            f"- **Valor:** {e.get('valor', 'Ver site')}",
            f"- **Prazo:** {prazo_display}",
            f"- **Relevância:** {e.get('relevancia', '—')} (score: {e.get('score_relevancia', '—')})",
            f"- **URL:** {e['url']}",
            "",
        ]
    
    linhas += [
        "---",
        "",
        "## 🟡 MÉDIA PRIORIDADE (monitorar)",
        "",
    ]
    
    for e in medios[:5]:
        linhas += [
            f"- **{e['fonte']}** — {e.get('titulo', '')} | Prazo: {e.get('prazo', '?')} | {e['url']}",
        ]
    
    linhas += [
        "",
        "---",
        "",
        "## 📅 Próximos Passos Recomendados",
        "",
        "1. ✅ **Microsoft Founders Hub** — cadastrar HOJE (30 min, USD 150k grátis)",
        "2. ✅ **NVIDIA Inception** — cadastrar HOJE (30 min, créditos GPU grátis)",
        "3. ✅ **AWS Activate Founders** — cadastrar esta semana",
        "4. 📋 **Y Combinator S26** — iniciar aplicação (prazo 04/05/2026)",
        "5. 📋 **FINEP Mulheres Inovadoras** — verificar elegibilidade (prazo 04/05/2026)",
        "",
        "---",
        "",
        f"*Gerado automaticamente pelo Victor Capital em {hoje}*",
        "*Titanio Studio — 20 anos, 40 países, 470M espectadores, IA aplicada*",
    ]
    
    with open(arquivo, "w", encoding="utf-8") as f:
        f.write("\n".join(linhas))
    
    return arquivo


def main():
    parser = argparse.ArgumentParser(
        description="Victor Capital — Buscador de Editais para a Titanio Studio"
    )
    parser.add_argument("--verbose", "-v", action="store_true", help="Modo detalhado")
    parser.add_argument("--saida", "-s", type=str, help="Diretório de saída")
    args = parser.parse_args()
    
    saida_dir = Path(args.saida) if args.saida else SAIDA_DIR
    saida_dir.mkdir(parents=True, exist_ok=True)
    
    data_str = datetime.now().strftime("%Y-%m-%d")
    
    print("=" * 60)
    print("🏦 VICTOR CAPITAL — Buscador de Editais")
    print("🎬 Titanio Studio | Belo Horizonte, MG")
    print("=" * 60)
    
    editais = buscar_todos_editais(verbose=args.verbose)
    
    arquivo_json = gerar_json(editais, data_str, saida_dir)
    arquivo_md = gerar_relatorio_md(editais, data_str, saida_dir)
    
    print(f"\n✅ Busca concluída!")
    print(f"📄 JSON: {arquivo_json}")
    print(f"📋 Relatório: {arquivo_md}")
    print(f"📊 Total: {len(editais)} oportunidades")
    
    relevantes = [e for e in editais if e.get("relevancia") in ("critica", "muito_alta", "alta")]
    print(f"⭐ Alta relevância: {len(relevantes)}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
