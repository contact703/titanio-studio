#!/usr/bin/env python3
"""
analisar-edital.py — Motor de leitura e análise de editais para a Titanio Studio.
Victor Capital | Titanio Studio

Uso:
    python analisar-edital.py --url https://finep.gov.br/chamadas-publicas/chamadapublica/788
    python analisar-edital.py --texto edital.txt
    python analisar-edital.py --url URL --saida resultado.json
"""

import sys
import os
import re
import json
import argparse
import hashlib
from datetime import datetime
from pathlib import Path

# Adiciona o diretório pai ao path para importar perfil_titanio
sys.path.insert(0, str(Path(__file__).parent))
from perfil_titanio import PERFIL_TITANIO, carregar_perfil_titanio

# Dependências externas (instalar via pip)
try:
    import requests
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    print("⚠️  Aviso: requests/beautifulsoup4 não instalados. Instale com: pip install requests beautifulsoup4")

try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False
    print("⚠️  Aviso: anthropic não instalado. Instale com: pip install anthropic")

# ─── CONFIGURAÇÃO ──────────────────────────────────────────────────────────────

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
MODELO_IA = "claude-opus-4-5"  # Modelo premium para análise precisa
PASTA_SAIDAS = Path(__file__).parent.parent / "saidas"
PASTA_SAIDAS.mkdir(exist_ok=True)

# ─── EXTRAÇÃO DE CONTEÚDO ──────────────────────────────────────────────────────

def baixar_conteudo(url: str) -> str:
    """Faz scraping do conteúdo da URL do edital."""
    if not HAS_BS4:
        raise ImportError("requests e beautifulsoup4 são necessários. pip install requests beautifulsoup4")

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
    }

    print(f"📥 Baixando edital de: {url}")
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise RuntimeError(f"Erro ao baixar edital: {e}")

    # Tenta detectar PDF
    content_type = resp.headers.get("Content-Type", "")
    if "application/pdf" in content_type:
        return _extrair_pdf(resp.content)

    # HTML normal
    soup = BeautifulSoup(resp.text, "html.parser")

    # Remove scripts, estilos e menus
    for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
        tag.decompose()

    # Tenta pegar o conteúdo principal
    for seletor in ["main", "article", ".content", "#content", ".edital", ".chamada"]:
        elem = soup.select_one(seletor)
        if elem:
            texto = elem.get_text(separator="\n", strip=True)
            if len(texto) > 500:
                return texto

    # Fallback: pega todo o body
    body = soup.find("body")
    if body:
        return body.get_text(separator="\n", strip=True)

    return soup.get_text(separator="\n", strip=True)


def _extrair_pdf(conteudo_bytes: bytes) -> str:
    """Extrai texto de PDF. Requer pdfplumber ou pypdf."""
    try:
        import io
        import pdfplumber
        with pdfplumber.open(io.BytesIO(conteudo_bytes)) as pdf:
            textos = []
            for pagina in pdf.pages:
                t = pagina.extract_text()
                if t:
                    textos.append(t)
            return "\n".join(textos)
    except ImportError:
        pass

    try:
        import io
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(conteudo_bytes))
        textos = []
        for pagina in reader.pages:
            t = pagina.extract_text()
            if t:
                textos.append(t)
        return "\n".join(textos)
    except ImportError:
        pass

    raise ImportError("Para PDFs, instale: pip install pdfplumber  ou  pip install pypdf")


def ler_arquivo_texto(caminho: str) -> str:
    """Lê conteúdo de arquivo de texto local."""
    with open(caminho, "r", encoding="utf-8") as f:
        return f.read()


# ─── ANÁLISE COM IA ────────────────────────────────────────────────────────────

def _montar_prompt_analise(texto_edital: str, perfil: dict) -> str:
    """Monta o prompt para análise do edital pela IA."""
    historico = perfil["historico"]
    produtos_desc = "\n".join([
        f"- {k}: {v['descricao']}" for k, v in perfil["produtos"].items()
    ])

    return f"""Você é Victor Capital, especialista em captação de recursos para a Titanio Studio.

## Perfil da Empresa
- Nome: {perfil['nome']}
- Fundação: {perfil['fundacao']} (20 anos de atividade)
- Sede: {perfil['sede']} + escritório em {perfil['escritorio_internacional']}
- Fundador: {perfil['fundador']} ({perfil['formacao_fundador']})
- Histórico: {historico['producoes']} produções, {historico['paises_distribuicao']} países, {historico['espectadores_formatado']} espectadores
- Em 2024: pivotou para IA — apps, comerciais generativos, cinema com IA

## Produtos
{produtos_desc}

## Diferenciais
{chr(10).join('- ' + d for d in perfil['diferenciais'])}

---

## Texto do Edital
{texto_edital[:8000]}

---

## SUA TAREFA
Analise este edital com atenção e retorne um JSON com a seguinte estrutura EXATA:

{{
  "titulo": "título do edital",
  "organizacao": "organização responsável",
  "valor_max": 0.0,
  "prazo_inscricao": "data/prazo de inscrição",
  "elegibilidade": ["critério 1", "critério 2"],
  "despesas_elegiveis": ["tipo despesa 1", "tipo despesa 2"],
  "documentos_obrigatorios": ["doc 1", "doc 2"],
  "criterios_avaliacao": [
    {{"criterio": "nome do critério", "peso": 0, "descricao": "descrição"}}
  ],
  "fit_titanio_score": 75.0,
  "recomendacao": "inscrever",
  "justificativa": "explicação detalhada da recomendação",
  "pontos_fortes": ["por que a Titanio se encaixa 1", "ponto 2"],
  "pontos_atencao": ["o que precisa adaptar 1", "ponto 2"],
  "produto_recomendado": "VoxDescriber",
  "angulo_recomendado": "impacto_social",
  "tom_recomendado": "técnico-científico",
  "tags_detectadas": ["acessibilidade", "IA"],
  "tipo_programa": "FINEP",
  "resumo_executivo": "resumo em 2-3 frases para enviar à equipe"
}}

## REGRAS PARA O SCORE (0-100):
- +20: empresa elegível (porte, tipo, setor)
- +15: produto relevante para o tema do edital
- +15: localização/abrangência compatível
- +15: histórico da empresa é diferencial real
- +10: impacto social mensurável (se o edital valoriza)
- +10: capacidade técnica comprovada
- +5: fundador com formação internacional
- +5: presença internacional
- -20: restrição que exclui a empresa (CNPJ específico, setor não autorizado)
- -15: prazo impossível ou já encerrado
- -10: escopo incompatível com o que a Titanio faz

## RECOMENDAÇÃO:
- "inscrever": score >= 70 (boa chance de aprovação)
- "adaptar": score >= 50 e < 70 (vale tentar com ajustes)
- "não inscrever": score < 50 (improvável aprovação ou incompatível)

Retorne APENAS o JSON, sem texto adicional."""


def analisar_com_ia(texto_edital: str, perfil: dict) -> dict:
    """Usa Claude para analisar o edital e extrair informações estruturadas."""
    if not HAS_ANTHROPIC or not ANTHROPIC_API_KEY:
        print("⚠️  IA não disponível. Usando análise básica por palavras-chave.")
        return _analise_basica(texto_edital, perfil)

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    prompt = _montar_prompt_analise(texto_edital, perfil)

    print("🧠 Analisando edital com IA...")
    mensagem = client.messages.create(
        model=MODELO_IA,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    resposta = mensagem.content[0].text.strip()

    # Extrai JSON da resposta
    try:
        # Tenta direto
        return json.loads(resposta)
    except json.JSONDecodeError:
        # Tenta extrair bloco JSON
        match = re.search(r'\{.*\}', resposta, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"IA retornou resposta inválida: {resposta[:200]}")


def _analise_basica(texto: str, perfil: dict) -> dict:
    """Análise básica por regex/palavras-chave quando IA não está disponível."""
    texto_lower = texto.lower()

    # Extrai título (primeira linha não vazia)
    linhas = [l.strip() for l in texto.split("\n") if l.strip()]
    titulo = linhas[0] if linhas else "Edital sem título"

    # Detecta valor
    valor_max = 0.0
    for padrao in [
        r'R\$\s*([\d.,]+)\s*milh[ãa]o',
        r'R\$\s*([\d.,]+)\s*mil',
        r'R\$\s*([\d.]+,\d{2})',
        r'valor[:\s]+R\$\s*([\d.,]+)',
    ]:
        m = re.search(padrao, texto, re.IGNORECASE)
        if m:
            val_str = m.group(1).replace(".", "").replace(",", ".")
            try:
                valor_max = float(val_str)
                if "milh" in padrao:
                    valor_max *= 1_000_000
                elif "mil" in padrao:
                    valor_max *= 1_000
            except ValueError:
                pass
            break

    # Detecta prazo
    prazo = "Verificar no edital"
    for padrao in [
        r'prazo[:\s]+(\d{2}/\d{2}/\d{4})',
        r'inscri[çc][ãa]o[:\s]+at[eé]\s+(\d{2}/\d{2}/\d{4})',
        r'(\d{2}/\d{2}/\d{4})',
    ]:
        m = re.search(padrao, texto, re.IGNORECASE)
        if m:
            prazo = m.group(1)
            break

    # Score básico baseado em palavras-chave
    score = 50.0
    tags_detectadas = []

    palavras_positivas = {
        "audiovisual": 15, "cinema": 15, "produção": 10,
        "acessibilidade": 20, "deficiência": 15, "inclusão": 15,
        "tecnologia": 10, "inovação": 10, "startup": 10,
        "inteligência artificial": 20, "ia ": 15,
        "impacto social": 15, "cultura": 10,
        "educação": 10, "app": 10, "aplicativo": 10,
        "internacional": 10, "exportação": 10,
    }

    for palavra, pontos in palavras_positivas.items():
        if palavra in texto_lower:
            score = min(100, score + pontos)
            tags_detectadas.append(palavra.strip())

    # Penalidades
    if "exclusiv" in texto_lower and ("ong" in texto_lower or "pessoa física" in texto_lower):
        score -= 20
    if "encerrad" in texto_lower or "resultado" in texto_lower:
        score -= 30

    score = max(0, min(100, score))

    if score >= 70:
        recomendacao = "inscrever"
    elif score >= 50:
        recomendacao = "adaptar"
    else:
        recomendacao = "não inscrever"

    return {
        "titulo": titulo,
        "organizacao": "Identificar no edital",
        "valor_max": valor_max,
        "prazo_inscricao": prazo,
        "elegibilidade": ["Verificar critérios no texto do edital"],
        "despesas_elegiveis": ["Verificar seção de despesas elegíveis"],
        "documentos_obrigatorios": ["Verificar lista de documentos no edital"],
        "criterios_avaliacao": [{"criterio": "Verificar no edital", "peso": 0, "descricao": ""}],
        "fit_titanio_score": score,
        "recomendacao": recomendacao,
        "justificativa": f"Análise básica por palavras-chave (score {score}/100). Recomenda-se análise com IA para resultado preciso.",
        "pontos_fortes": ["Histórico de 20 anos", "Portfólio internacional"],
        "pontos_atencao": ["Análise manual necessária para confirmar elegibilidade"],
        "produto_recomendado": "cinema",
        "angulo_recomendado": "empresa_tecnologia",
        "tom_recomendado": "técnico-científico",
        "tags_detectadas": tags_detectadas,
        "tipo_programa": "Desconhecido",
        "resumo_executivo": f"Edital analisado automaticamente. Score estimado: {score}/100. Recomendação: {recomendacao}.",
    }


# ─── FUNÇÃO PRINCIPAL ──────────────────────────────────────────────────────────

def analisar_edital(url_ou_texto: str) -> dict:
    """
    Analisa um edital e retorna análise estruturada com recomendação.

    Args:
        url_ou_texto: URL do edital OU caminho para arquivo de texto OU texto direto

    Returns:
        dict com análise completa e recomendação
    """
    perfil = carregar_perfil_titanio()

    # Determina a fonte do conteúdo
    if url_ou_texto.startswith(("http://", "https://")):
        texto_edital = baixar_conteudo(url_ou_texto)
        fonte = url_ou_texto
    elif os.path.isfile(url_ou_texto):
        texto_edital = ler_arquivo_texto(url_ou_texto)
        fonte = url_ou_texto
    else:
        # Assume que é texto direto
        texto_edital = url_ou_texto
        fonte = "texto_direto"

    if not texto_edital or len(texto_edital) < 100:
        raise ValueError("Conteúdo do edital muito curto ou vazio.")

    print(f"📄 Conteúdo extraído: {len(texto_edital)} caracteres")

    # Análise com IA
    analise = analisar_com_ia(texto_edital, perfil)

    # Adiciona metadados
    analise["_meta"] = {
        "fonte": fonte,
        "data_analise": datetime.now().isoformat(),
        "versao": "1.0",
        "caracteres_analisados": len(texto_edital),
    }

    return analise


def salvar_analise(analise: dict, caminho: str = None) -> str:
    """Salva a análise em arquivo JSON."""
    if not caminho:
        titulo_slug = re.sub(r'[^\w\s-]', '', analise.get("titulo", "edital"))
        titulo_slug = re.sub(r'[-\s]+', '-', titulo_slug).strip('-').lower()[:50]
        data = datetime.now().strftime("%Y%m%d_%H%M")
        caminho = str(PASTA_SAIDAS / f"analise_{titulo_slug}_{data}.json")

    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(analise, f, ensure_ascii=False, indent=2)

    print(f"💾 Análise salva em: {caminho}")
    return caminho


def imprimir_resumo(analise: dict):
    """Imprime resumo formatado da análise."""
    score = analise.get("fit_titanio_score", 0)
    emoji_score = "🟢" if score >= 70 else "🟡" if score >= 50 else "🔴"
    emoji_rec = {"inscrever": "✅", "adaptar": "⚠️", "não inscrever": "❌"}.get(
        analise.get("recomendacao", ""), "❓"
    )

    print("\n" + "═" * 60)
    print(f"📋 ANÁLISE DE EDITAL — Victor Capital")
    print("═" * 60)
    print(f"📌 Título: {analise.get('titulo', 'N/A')}")
    print(f"🏢 Organização: {analise.get('organizacao', 'N/A')}")
    print(f"💰 Valor máximo: R$ {analise.get('valor_max', 0):,.2f}")
    print(f"📅 Prazo: {analise.get('prazo_inscricao', 'N/A')}")
    print(f"\n{emoji_score} Score de fit Titanio: {score:.0f}/100")
    print(f"{emoji_rec} Recomendação: {analise.get('recomendacao', 'N/A').upper()}")
    print(f"\n📝 Justificativa:\n{analise.get('justificativa', 'N/A')}")

    pontos_fortes = analise.get("pontos_fortes", [])
    if pontos_fortes:
        print(f"\n✅ Pontos fortes:")
        for p in pontos_fortes:
            print(f"   • {p}")

    pontos_atencao = analise.get("pontos_atencao", [])
    if pontos_atencao:
        print(f"\n⚠️  Pontos de atenção:")
        for p in pontos_atencao:
            print(f"   • {p}")

    docs = analise.get("documentos_obrigatorios", [])
    if docs:
        print(f"\n📎 Documentos obrigatórios:")
        for d in docs:
            print(f"   • {d}")

    print(f"\n🎯 Produto recomendado: {analise.get('produto_recomendado', 'N/A')}")
    print(f"💬 Tom recomendado: {analise.get('tom_recomendado', 'N/A')}")
    print("═" * 60)


# ─── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Victor Capital — Analisador de editais para a Titanio Studio"
    )
    grupo = parser.add_mutually_exclusive_group(required=True)
    grupo.add_argument("--url", help="URL do edital para download e análise")
    grupo.add_argument("--texto", help="Caminho para arquivo de texto com o edital")
    grupo.add_argument("--stdin", action="store_true", help="Lê edital da entrada padrão")

    parser.add_argument("--saida", help="Caminho para salvar resultado JSON")
    parser.add_argument("--silencioso", action="store_true", help="Não imprime resumo, só salva JSON")

    args = parser.parse_args()

    if args.stdin:
        print("📥 Lendo edital da entrada padrão...")
        conteudo = sys.stdin.read()
    elif args.url:
        conteudo = args.url  # analisar_edital vai detectar e fazer download
    else:
        conteudo = args.texto

    analise = analisar_edital(conteudo)

    if not args.silencioso:
        imprimir_resumo(analise)

    caminho_salvo = salvar_analise(analise, args.saida)

    # Output JSON para integração com outros scripts
    print(f"\n📤 JSON: {caminho_salvo}")
    return analise


if __name__ == "__main__":
    main()
