#!/usr/bin/env python3
"""
pipeline-captacao.py — Sistema de acompanhamento de captação com máquina de estados.
Victor Capital | Titanio Studio

Gerencia o ciclo completo de editais:
  DETECTADO → ANALISADO → APROVADO_PARA_INSCRICAO → EM_PREENCHIMENTO →
  SUBMETIDO → EM_ANALISE → APROVADO / REPROVADO / COMPLEMENTACAO_SOLICITADA →
  EM_RECURSO → APROVADO_FINAL → CONTRATO_ASSINADO → RECURSO_RECEBIDO

Uso:
    python pipeline-captacao.py --listar
    python pipeline-captacao.py --adicionar --url https://... --titulo "FINEP Mulheres"
    python pipeline-captacao.py --atualizar --id ABC123 --estado SUBMETIDO
    python pipeline-captacao.py --dashboard
    python pipeline-captacao.py --processar --id ABC123  # roda análise + preenchimento
"""

import sys
import os
import json
import hashlib
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
from enum import Enum

sys.path.insert(0, str(Path(__file__).parent))

PASTA_BASE = Path(__file__).parent.parent
PASTA_PIPELINE = PASTA_BASE / "pipeline"
PASTA_PIPELINE.mkdir(exist_ok=True)

ARQUIVO_PIPELINE = PASTA_PIPELINE / "editais.json"
ARQUIVO_LOG = PASTA_PIPELINE / "log.jsonl"

# ─── ESTADOS ──────────────────────────────────────────────────────────────────

class Estado(str, Enum):
    DETECTADO = "DETECTADO"
    ANALISADO = "ANALISADO"
    APROVADO_PARA_INSCRICAO = "APROVADO_PARA_INSCRICAO"
    EM_PREENCHIMENTO = "EM_PREENCHIMENTO"
    SUBMETIDO = "SUBMETIDO"
    EM_ANALISE = "EM_ANALISE"
    COMPLEMENTACAO_SOLICITADA = "COMPLEMENTACAO_SOLICITADA"
    EM_RECURSO = "EM_RECURSO"
    APROVADO = "APROVADO"
    REPROVADO = "REPROVADO"
    APROVADO_FINAL = "APROVADO_FINAL"
    CONTRATO_ASSINADO = "CONTRATO_ASSINADO"
    RECURSO_RECEBIDO = "RECURSO_RECEBIDO"

# Transições válidas
TRANSICOES_VALIDAS = {
    Estado.DETECTADO: [Estado.ANALISADO],
    Estado.ANALISADO: [Estado.APROVADO_PARA_INSCRICAO, Estado.REPROVADO],
    Estado.APROVADO_PARA_INSCRICAO: [Estado.EM_PREENCHIMENTO],
    Estado.EM_PREENCHIMENTO: [Estado.SUBMETIDO],
    Estado.SUBMETIDO: [Estado.EM_ANALISE],
    Estado.EM_ANALISE: [Estado.APROVADO, Estado.REPROVADO, Estado.COMPLEMENTACAO_SOLICITADA],
    Estado.COMPLEMENTACAO_SOLICITADA: [Estado.EM_ANALISE, Estado.REPROVADO],
    Estado.APROVADO: [Estado.APROVADO_FINAL, Estado.EM_RECURSO],
    Estado.REPROVADO: [Estado.EM_RECURSO],
    Estado.EM_RECURSO: [Estado.APROVADO_FINAL, Estado.REPROVADO],
    Estado.APROVADO_FINAL: [Estado.CONTRATO_ASSINADO],
    Estado.CONTRATO_ASSINADO: [Estado.RECURSO_RECEBIDO],
    Estado.RECURSO_RECEBIDO: [],
}

EMOJI_ESTADO = {
    Estado.DETECTADO: "🔍",
    Estado.ANALISADO: "📊",
    Estado.APROVADO_PARA_INSCRICAO: "✅",
    Estado.EM_PREENCHIMENTO: "✍️",
    Estado.SUBMETIDO: "📤",
    Estado.EM_ANALISE: "⏳",
    Estado.COMPLEMENTACAO_SOLICITADA: "🚨",
    Estado.EM_RECURSO: "⚖️",
    Estado.APROVADO: "🎉",
    Estado.REPROVADO: "❌",
    Estado.APROVADO_FINAL: "🏆",
    Estado.CONTRATO_ASSINADO: "📋",
    Estado.RECURSO_RECEBIDO: "💰",
}

# ─── BANCO DE DADOS LOCAL ──────────────────────────────────────────────────────

def _carregar_pipeline() -> dict:
    """Carrega o pipeline de editais do arquivo JSON."""
    if ARQUIVO_PIPELINE.exists():
        with open(ARQUIVO_PIPELINE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"editais": {}, "atualizado": None}


def _salvar_pipeline(dados: dict):
    """Salva o pipeline de editais."""
    dados["atualizado"] = datetime.now().isoformat()
    with open(ARQUIVO_PIPELINE, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)


def _registrar_log(edital_id: str, evento: str, detalhes: dict = None):
    """Registra evento no log de auditoria."""
    entrada = {
        "timestamp": datetime.now().isoformat(),
        "edital_id": edital_id,
        "evento": evento,
        "detalhes": detalhes or {},
    }
    with open(ARQUIVO_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(entrada, ensure_ascii=False) + "\n")


def _gerar_id(url: str, titulo: str) -> str:
    """Gera ID único para o edital."""
    chave = f"{url}:{titulo}"
    return hashlib.md5(chave.encode()).hexdigest()[:8].upper()


# ─── AÇÕES POR ESTADO ─────────────────────────────────────────────────────────

def _acao_detectado(edital: dict):
    """Notifica equipe quando edital é detectado."""
    print(f"\n🔍 NOVO EDITAL DETECTADO")
    print(f"   Título: {edital.get('titulo', 'N/A')}")
    print(f"   URL: {edital.get('url', 'N/A')}")
    print(f"   Prazo: {edital.get('prazo_inscricao', 'N/A')}")
    _enviar_notificacao(
        titulo="🔍 Novo edital detectado",
        mensagem=(
            f"*{edital.get('titulo', 'N/A')}*\n"
            f"ID: {edital.get('id', '')}\n"
            f"Prazo: {edital.get('prazo_inscricao', 'a confirmar')}\n"
            f"URL: {edital.get('url', 'N/A')}\n\n"
            f"Aguardando análise de fit."
        ),
        urgencia="normal",
    )


def _acao_aprovado_para_inscricao(edital: dict):
    """Inicia preenchimento automático quando aprovado."""
    score = edital.get("analise", {}).get("fit_titanio_score", 0)
    print(f"\n✅ APROVADO PARA INSCRIÇÃO — Score: {score}/100")
    print(f"   Iniciando preenchimento automático...")

    _enviar_notificacao(
        titulo=f"✅ Aprovado para inscrição (Score: {score}/100)",
        mensagem=(
            f"*{edital.get('titulo', 'N/A')}*\n"
            f"Score de fit: {score}/100\n"
            f"Recomendação: {edital.get('analise', {}).get('recomendacao', 'N/A')}\n\n"
            f"Pontos fortes:\n" +
            "\n".join([f"• {p}" for p in edital.get("analise", {}).get("pontos_fortes", [])[:3]]) +
            f"\n\nIniciando preenchimento automático..."
        ),
        urgencia="normal",
    )


def _acao_submetido(edital: dict):
    """Agenda verificações periódicas após submissão."""
    print(f"\n📤 SUBMETIDO — Aguardando resultado")
    print(f"   Próxima verificação: agendar manualmente no sistema do edital")

    _enviar_notificacao(
        titulo="📤 Inscrição submetida!",
        mensagem=(
            f"*{edital.get('titulo', 'N/A')}* foi submetido com sucesso.\n"
            f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}\n\n"
            f"Acompanhe o status no sistema do edital e atualize aqui quando houver novidades."
        ),
        urgencia="normal",
    )


def _acao_complementacao_solicitada(edital: dict, obs: str = ""):
    """Alerta urgente quando complementação é solicitada."""
    print(f"\n🚨 COMPLEMENTAÇÃO SOLICITADA — AÇÃO URGENTE!")
    print(f"   Observação: {obs or 'Verificar no sistema do edital'}")

    _enviar_notificacao(
        titulo="🚨 URGENTE: Complementação solicitada!",
        mensagem=(
            f"*{edital.get('titulo', 'N/A')}* — complementação necessária!\n\n"
            f"Prazo para complementar: VERIFICAR URGENTE\n"
            f"Observação: {obs or 'Acessar o sistema do edital para ver o que foi solicitado'}\n\n"
            f"⚠️ Ação imediata necessária!"
        ),
        urgencia="alta",
    )


def _acao_aprovado(edital: dict):
    """Celebra aprovação e dá instruções para contrato."""
    valor = edital.get("analise", {}).get("valor_max", 0)
    print(f"\n🎉 APROVADO! Valor: R$ {valor:,.2f}")
    print(f"   Próximo passo: assinatura de contrato")

    _enviar_notificacao(
        titulo="🎉🏆 APROVADO! Recurso conquistado!",
        mensagem=(
            f"🎊 *{edital.get('titulo', 'N/A')}* foi APROVADO!\n"
            f"Valor: R$ {valor:,.2f}\n\n"
            f"Próximos passos:\n"
            f"1. Verificar condições do contrato\n"
            f"2. Reunião com equipe jurídica\n"
            f"3. Assinar contrato\n"
            f"4. Aguardar liberação dos recursos"
        ),
        urgencia="alta",
    )


def _acao_recurso_recebido(edital: dict):
    """Atualiza dashboard financeiro quando recurso é recebido."""
    valor = edital.get("valor_recebido", edital.get("analise", {}).get("valor_max", 0))
    print(f"\n💰 RECURSO RECEBIDO! R$ {valor:,.2f}")

    _enviar_notificacao(
        titulo="💰 Recurso recebido!",
        mensagem=(
            f"*{edital.get('titulo', 'N/A')}*\n"
            f"Valor recebido: R$ {valor:,.2f}\n"
            f"Data: {datetime.now().strftime('%d/%m/%Y')}\n\n"
            f"Dashboard financeiro atualizado. 🚀"
        ),
        urgencia="normal",
    )


def _enviar_notificacao(titulo: str, mensagem: str, urgencia: str = "normal"):
    """
    Envia notificação para a equipe.
    Integra com N8n webhook se disponível, ou apenas imprime.
    """
    payload = {
        "titulo": titulo,
        "mensagem": mensagem,
        "urgencia": urgencia,
        "timestamp": datetime.now().isoformat(),
        "origem": "Victor Capital — Pipeline de Captação",
    }

    # Tenta enviar via N8n
    n8n_webhook = os.environ.get("N8N_NOTIFICATION_WEBHOOK", "")
    if n8n_webhook:
        try:
            import requests
            resp = requests.post(n8n_webhook, json=payload, timeout=10)
            if resp.status_code == 200:
                print(f"   📱 Notificação enviada via N8n")
                return
        except Exception as e:
            print(f"   ⚠️  N8n indisponível: {e}")

    # Fallback: salva em arquivo de notificações
    pasta_notif = PASTA_PIPELINE / "notificacoes"
    pasta_notif.mkdir(exist_ok=True)
    arquivo_notif = pasta_notif / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(arquivo_notif, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"   📁 Notificação salva: {arquivo_notif.name}")


# ─── OPERAÇÕES PRINCIPAIS ─────────────────────────────────────────────────────

def adicionar_edital(url: str, titulo: str, prazo: str = None) -> str:
    """Adiciona novo edital ao pipeline."""
    dados = _carregar_pipeline()

    edital_id = _gerar_id(url, titulo)

    if edital_id in dados["editais"]:
        print(f"⚠️  Edital já existe: {edital_id}")
        return edital_id

    edital = {
        "id": edital_id,
        "titulo": titulo,
        "url": url,
        "prazo_inscricao": prazo or "a confirmar",
        "estado": Estado.DETECTADO,
        "historico_estados": [
            {"estado": Estado.DETECTADO, "timestamp": datetime.now().isoformat(), "obs": ""}
        ],
        "analise": None,
        "preenchimento": None,
        "arquivos": [],
        "valor_recebido": 0,
        "criado_em": datetime.now().isoformat(),
        "atualizado_em": datetime.now().isoformat(),
    }

    dados["editais"][edital_id] = edital
    _salvar_pipeline(dados)
    _registrar_log(edital_id, "ADICIONADO", {"titulo": titulo, "url": url})
    _acao_detectado(edital)

    print(f"\n✅ Edital adicionado: ID = {edital_id}")
    return edital_id


def atualizar_estado(edital_id: str, novo_estado: str, obs: str = "") -> bool:
    """
    Atualiza o estado de um edital no pipeline.
    Valida a transição e executa ações automáticas.
    """
    dados = _carregar_pipeline()

    if edital_id not in dados["editais"]:
        print(f"❌ Edital não encontrado: {edital_id}")
        return False

    edital = dados["editais"][edital_id]
    estado_atual = Estado(edital["estado"])
    novo = Estado(novo_estado)

    # Valida transição
    transicoes = TRANSICOES_VALIDAS.get(estado_atual, [])
    if novo not in transicoes:
        print(f"❌ Transição inválida: {estado_atual} → {novo}")
        print(f"   Transições válidas: {[e.value for e in transicoes]}")
        return False

    # Atualiza
    edital["estado"] = novo.value
    edital["atualizado_em"] = datetime.now().isoformat()
    edital["historico_estados"].append({
        "estado": novo.value,
        "timestamp": datetime.now().isoformat(),
        "obs": obs,
    })

    _salvar_pipeline(dados)
    _registrar_log(edital_id, "ESTADO_ATUALIZADO", {
        "de": estado_atual.value,
        "para": novo.value,
        "obs": obs,
    })

    emoji = EMOJI_ESTADO.get(novo, "📌")
    print(f"\n{emoji} Estado atualizado: {estado_atual.value} → {novo.value}")

    # Executa ação automática
    acoes = {
        Estado.DETECTADO: _acao_detectado,
        Estado.APROVADO_PARA_INSCRICAO: _acao_aprovado_para_inscricao,
        Estado.SUBMETIDO: _acao_submetido,
        Estado.APROVADO: _acao_aprovado,
        Estado.RECURSO_RECEBIDO: _acao_recurso_recebido,
    }

    if novo == Estado.COMPLEMENTACAO_SOLICITADA:
        _acao_complementacao_solicitada(edital, obs)
    elif novo in acoes:
        acoes[novo](edital)

    return True


def processar_edital(edital_id: str) -> bool:
    """
    Processa edital completo: análise → aprovação → preenchimento.
    """
    dados = _carregar_pipeline()
    if edital_id not in dados["editais"]:
        print(f"❌ Edital não encontrado: {edital_id}")
        return False

    edital = dados["editais"][edital_id]

    # Importa scripts
    scripts_dir = Path(__file__).parent
    sys.path.insert(0, str(scripts_dir))

    try:
        from analisar_edital_module import analisar_edital
    except ImportError:
        # Usa importação direta
        import importlib.util
        spec = importlib.util.spec_from_file_location("analisar", scripts_dir / "analisar-edital.py")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        analisar_edital = mod.analisar_edital

    # Executa análise
    url = edital.get("url", "")
    if not url:
        print("❌ Edital sem URL. Adicione a URL antes de processar.")
        return False

    print(f"\n🔄 Processando: {edital.get('titulo', edital_id)}")
    print("─" * 50)

    analise = analisar_edital(url)

    # Salva análise no edital
    edital["analise"] = analise
    edital["atualizado_em"] = datetime.now().isoformat()

    # Atualiza prazo se extraído
    if analise.get("prazo_inscricao") and analise["prazo_inscricao"] != "Verificar no edital":
        edital["prazo_inscricao"] = analise["prazo_inscricao"]

    _salvar_pipeline(dados)
    atualizar_estado(edital_id, Estado.ANALISADO.value, f"Score: {analise.get('fit_titanio_score', 0)}/100")

    # Decide se aprova para inscrição
    score = analise.get("fit_titanio_score", 0)
    if score >= 50:
        atualizar_estado(edital_id, Estado.APROVADO_PARA_INSCRICAO.value, f"Score {score} >= 50")
        atualizar_estado(edital_id, Estado.EM_PREENCHIMENTO.value)

        # Gera preenchimento
        import importlib.util
        spec = importlib.util.spec_from_file_location("preencher", scripts_dir / "preencher-edital.py")
        mod_preencher = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod_preencher)

        from perfil_titanio import carregar_perfil_titanio
        perfil = carregar_perfil_titanio()
        preenchimento = mod_preencher.preencher_edital(analise, perfil)
        caminho = mod_preencher.salvar_preenchimento(preenchimento, analise.get("titulo", ""))

        edital["preenchimento"] = preenchimento
        edital["arquivos"].append(caminho)
        _salvar_pipeline(dados)

        print(f"\n✅ Processamento completo!")
        print(f"   Score: {score}/100")
        print(f"   Preenchimento: {caminho}")
    else:
        print(f"\n⚠️  Score baixo ({score}/100) — não recomendado para inscrição")
        atualizar_estado(edital_id, Estado.REPROVADO.value, f"Score {score} < 50 — não elegível")

    return True


def listar_editais(filtro_estado: str = None):
    """Lista todos os editais do pipeline."""
    dados = _carregar_pipeline()
    editais = dados.get("editais", {})

    if not editais:
        print("📭 Nenhum edital no pipeline.")
        return

    print("\n" + "═" * 70)
    print("📋 PIPELINE DE CAPTAÇÃO — Victor Capital")
    print("═" * 70)

    # Agrupa por estado
    por_estado = {}
    for eid, edital in editais.items():
        estado = edital.get("estado", "DETECTADO")
        if filtro_estado and estado != filtro_estado:
            continue
        por_estado.setdefault(estado, []).append(edital)

    total_valor = 0
    for estado in Estado:
        items = por_estado.get(estado.value, [])
        if not items:
            continue
        emoji = EMOJI_ESTADO.get(estado, "📌")
        print(f"\n{emoji} {estado.value} ({len(items)})")
        print("─" * 50)
        for edital in items:
            analise = edital.get("analise") or {}
            score = analise.get("fit_titanio_score", "—")
            valor = analise.get("valor_max", 0)
            if estado in [Estado.APROVADO, Estado.APROVADO_FINAL, Estado.CONTRATO_ASSINADO, Estado.RECURSO_RECEBIDO]:
                total_valor += valor
            print(f"   [{edital['id']}] {edital.get('titulo', 'N/A')[:50]}")
            print(f"          Score: {score} | Valor: R$ {valor:,.0f} | Prazo: {edital.get('prazo_inscricao', 'N/A')}")

    print(f"\n💰 Valor total em aprovação/contrato: R$ {total_valor:,.2f}")
    print("═" * 70)


def dashboard():
    """Exibe dashboard visual do pipeline."""
    dados = _carregar_pipeline()
    editais = dados.get("editais", {})

    total = len(editais)
    por_estado = {}
    valor_total_pipeline = 0
    valor_aprovado = 0
    valor_recebido = 0

    for edital in editais.values():
        estado = edital.get("estado", "DETECTADO")
        por_estado[estado] = por_estado.get(estado, 0) + 1
        analise = edital.get("analise") or {}
        valor = analise.get("valor_max", 0)
        valor_total_pipeline += valor
        if estado in ["APROVADO", "APROVADO_FINAL", "CONTRATO_ASSINADO"]:
            valor_aprovado += valor
        if estado == "RECURSO_RECEBIDO":
            valor_recebido += edital.get("valor_recebido", valor)

    print("\n" + "═" * 60)
    print("🎯 DASHBOARD — Victor Capital | Titanio Studio")
    print(f"📅 {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print("═" * 60)
    print(f"\n📊 PIPELINE: {total} editais no total")
    print()

    ordem = [
        Estado.DETECTADO, Estado.ANALISADO, Estado.APROVADO_PARA_INSCRICAO,
        Estado.EM_PREENCHIMENTO, Estado.SUBMETIDO, Estado.EM_ANALISE,
        Estado.COMPLEMENTACAO_SOLICITADA, Estado.APROVADO, Estado.REPROVADO,
        Estado.APROVADO_FINAL, Estado.CONTRATO_ASSINADO, Estado.RECURSO_RECEBIDO,
    ]

    for estado in ordem:
        count = por_estado.get(estado.value, 0)
        if count > 0:
            emoji = EMOJI_ESTADO.get(estado, "📌")
            barra = "█" * count
            print(f"   {emoji} {estado.value:<30} {barra} ({count})")

    print(f"\n💰 FINANCEIRO")
    print(f"   Total no pipeline:   R$ {valor_total_pipeline:>15,.2f}")
    print(f"   Aprovado (ganho):    R$ {valor_aprovado:>15,.2f}")
    print(f"   Recebido (caixa):    R$ {valor_recebido:>15,.2f}")

    # Alertas urgentes
    urgentes = [
        e for e in editais.values()
        if e.get("estado") == Estado.COMPLEMENTACAO_SOLICITADA.value
    ]
    if urgentes:
        print(f"\n🚨 URGENTE — COMPLEMENTAÇÃO SOLICITADA:")
        for e in urgentes:
            print(f"   ⚠️  {e.get('titulo', e['id'])}")

    print("═" * 60)


# ─── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Victor Capital — Pipeline de Captação | Titanio Studio"
    )

    grupo = parser.add_mutually_exclusive_group(required=True)
    grupo.add_argument("--listar", action="store_true", help="Lista todos os editais")
    grupo.add_argument("--dashboard", action="store_true", help="Exibe dashboard visual")
    grupo.add_argument("--adicionar", action="store_true", help="Adiciona novo edital")
    grupo.add_argument("--atualizar", action="store_true", help="Atualiza estado de um edital")
    grupo.add_argument("--processar", action="store_true", help="Processa edital (análise + preenchimento)")

    parser.add_argument("--id", help="ID do edital")
    parser.add_argument("--url", help="URL do edital")
    parser.add_argument("--titulo", help="Título do edital")
    parser.add_argument("--prazo", help="Prazo de inscrição")
    parser.add_argument("--estado", help="Novo estado do edital")
    parser.add_argument("--obs", help="Observação sobre a transição", default="")
    parser.add_argument("--filtro", help="Filtrar por estado ao listar")

    args = parser.parse_args()

    if args.listar:
        listar_editais(args.filtro)

    elif args.dashboard:
        dashboard()

    elif args.adicionar:
        if not args.url or not args.titulo:
            print("❌ --url e --titulo são obrigatórios para adicionar")
            sys.exit(1)
        adicionar_edital(args.url, args.titulo, args.prazo)

    elif args.atualizar:
        if not args.id or not args.estado:
            print("❌ --id e --estado são obrigatórios para atualizar")
            sys.exit(1)
        atualizar_estado(args.id, args.estado, args.obs)

    elif args.processar:
        if not args.id:
            print("❌ --id é obrigatório para processar")
            sys.exit(1)
        processar_edital(args.id)


if __name__ == "__main__":
    main()
