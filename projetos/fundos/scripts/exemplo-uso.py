#!/usr/bin/env python3
"""
exemplo-uso.py — Demonstração do ciclo completo Victor Capital.
Simula processamento do edital FINEP Mulheres Inovadoras.

Uso:
    python exemplo-uso.py
    python exemplo-uso.py --url https://finep.gov.br/outra-chamada
    python exemplo-uso.py --modo simulado  # roda sem fazer download real
"""

import sys
import os
import json
import argparse
from pathlib import Path
from datetime import datetime

# Adiciona o diretório de scripts ao path
SCRIPTS_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPTS_DIR))

from perfil_titanio import carregar_perfil_titanio

PASTA_BASE = SCRIPTS_DIR.parent
PASTA_SAIDAS = PASTA_BASE / "saidas"
PASTA_SAIDAS.mkdir(exist_ok=True)

# ─── DADOS SIMULADOS (quando sem acesso à internet) ───────────────────────────

ANALISE_SIMULADA_FINEP = {
    "titulo": "FINEP Mulheres Inovadoras — Chamada Pública 2024",
    "organizacao": "FINEP — Financiadora de Estudos e Projetos",
    "valor_max": 500_000.0,
    "prazo_inscricao": "30/06/2025",
    "elegibilidade": [
        "Empresas com liderança feminina (>50% do corpo gerencial ou CEO mulher)",
        "Empresa brasileira com CNPJ ativo",
        "Micro, Pequena ou Média Empresa",
        "Atividade de inovação tecnológica",
    ],
    "despesas_elegiveis": [
        "Recursos humanos (pesquisadores, técnicos)",
        "Equipamentos e softwares",
        "Serviços de terceiros (consultoria técnica)",
        "Viagens e diárias (nacionais)",
        "Material de consumo",
    ],
    "documentos_obrigatorios": [
        "CNPJ ativo e regular",
        "Balanço patrimonial dos últimos 2 anos",
        "Declaração de empresa de inovação",
        "Currículo do responsável técnico (Lattes ou similar)",
        "Plano de negócios resumido",
        "Certidões negativas de débito (federal, estadual, municipal)",
        "Declaração de composição societária",
    ],
    "criterios_avaliacao": [
        {"criterio": "Mérito técnico e inovação", "peso": 30, "descricao": "Grau de inovação e relevância tecnológica"},
        {"criterio": "Potencial de mercado", "peso": 25, "descricao": "Tamanho do mercado e viabilidade comercial"},
        {"criterio": "Liderança feminina", "peso": 20, "descricao": "Representatividade e protagonismo de mulheres"},
        {"criterio": "Impacto social", "peso": 15, "descricao": "Benefícios para a sociedade"},
        {"criterio": "Capacidade da equipe", "peso": 10, "descricao": "Qualificação para execução do projeto"},
    ],
    "fit_titanio_score": 72.0,
    "recomendacao": "inscrever",
    "justificativa": (
        "A Titanio Studio apresenta forte alinhamento com este edital. "
        "O VoxDescriber é uma inovação tecnológica com impacto social claro (6,5M de beneficiários), "
        "posicionando bem nos critérios de maior peso (mérito técnico + impacto social). "
        "Verificar composição de gênero da liderança para confirmar elegibilidade completa."
    ),
    "pontos_fortes": [
        "VoxDescriber é inovação tecnológica real com mercado definido",
        "Impacto social mensurável: 6,5M brasileiros com deficiência visual",
        "20 anos de histórico comprova capacidade de execução",
        "Presença internacional valida potencial de mercado",
        "Fundador com formação na Sorbonne — credibilidade técnica",
    ],
    "pontos_atencao": [
        "Verificar critério de liderança feminina — pode ser restritivo",
        "Confirmar porte da empresa (MPE) no CNPJ",
        "Documentação financeira (balanços) precisa ser preparada",
        "Adaptar CNPJ e dados cadastrais corretos antes de submeter",
    ],
    "produto_recomendado": "VoxDescriber",
    "angulo_recomendado": "empresa_tecnologia",
    "tom_recomendado": "técnico-científico",
    "tags_detectadas": ["inovação", "tecnologia", "mulheres", "startup", "impacto social"],
    "tipo_programa": "FINEP",
    "resumo_executivo": (
        "Edital FINEP para empresas lideradas por mulheres com foco em inovação tecnológica. "
        "Score 72/100 — recomendado para inscrição com VoxDescriber como produto principal. "
        "Atenção: confirmar critério de liderança feminina na composição atual da empresa."
    ),
    "_meta": {
        "fonte": "simulado",
        "data_analise": datetime.now().isoformat(),
        "versao": "1.0",
        "caracteres_analisados": 5000,
    },
}


# ─── CICLO COMPLETO ───────────────────────────────────────────────────────────

def ciclo_completo(edital_url: str, modo_simulado: bool = False):
    """
    Executa o ciclo completo de análise e preenchimento de um edital.

    Args:
        edital_url: URL do edital para análise real
        modo_simulado: se True, usa dados pré-definidos sem fazer download
    """
    print("\n" + "═" * 65)
    print("🎯 VICTOR CAPITAL — Ciclo Completo de Captação")
    print("   Titanio Studio | Da busca à entrega do recurso")
    print("═" * 65)
    print(f"\n📌 Edital: {edital_url}")
    print(f"⏰ Início: {datetime.now().strftime('%d/%m/%Y %H:%M')}")

    # ─── ETAPA 1: ANÁLISE ─────────────────────────────────────────────────────
    print("\n" + "─" * 50)
    print("📊 ETAPA 1: Análise do Edital")
    print("─" * 50)

    if modo_simulado:
        print("⚡ Modo simulado — usando dados de exemplo (FINEP Mulheres Inovadoras)")
        analise = ANALISE_SIMULADA_FINEP.copy()
    else:
        try:
            from analisar_edital_module import analisar_edital
        except ImportError:
            import importlib.util
            spec = importlib.util.spec_from_file_location(
                "analisar", SCRIPTS_DIR / "analisar-edital.py"
            )
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            analisar_edital = mod.analisar_edital
        analise = analisar_edital(edital_url)

    score = analise["fit_titanio_score"]
    recomendacao = analise["recomendacao"]
    emoji_score = "🟢" if score >= 70 else "🟡" if score >= 50 else "🔴"

    print(f"\n{emoji_score} Score de fit Titanio: {score:.0f}/100")
    print(f"📋 Recomendação: {recomendacao.upper()}")
    print(f"\n📝 Justificativa:\n{analise['justificativa']}")

    print(f"\n✅ Pontos fortes:")
    for p in analise.get("pontos_fortes", []):
        print(f"   • {p}")

    print(f"\n⚠️  Pontos de atenção:")
    for p in analise.get("pontos_atencao", []):
        print(f"   • {p}")

    # Salva análise
    import re
    titulo_slug = re.sub(r'[^\w\s-]', '', analise.get("titulo", "edital"))
    titulo_slug = re.sub(r'[-\s]+', '-', titulo_slug).strip('-').lower()[:40]
    data = datetime.now().strftime("%Y%m%d_%H%M")
    caminho_analise = PASTA_SAIDAS / f"analise_{titulo_slug}_{data}.json"
    with open(caminho_analise, "w", encoding="utf-8") as f:
        json.dump(analise, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Análise salva: {caminho_analise.name}")

    # ─── DECISÃO ──────────────────────────────────────────────────────────────
    print("\n" + "─" * 50)
    print("🤔 DECISÃO")
    print("─" * 50)

    if score < 50:
        print(f"\n❌ Score {score}/100 — Abaixo do mínimo (50)")
        print("   Recomendação: NÃO INSCREVER")
        print("   Justificativa: Probabilidade de aprovação muito baixa.")
        print("   Victor Capital encerra análise aqui e busca próximo edital.")
        return analise, None

    if score < 70:
        print(f"\n⚠️  Score {score}/100 — Possível, mas requer adaptações")
        print("   Continuando com preenchimento (adaptar para maximizar fit)")
    else:
        print(f"\n✅ Score {score}/100 — Forte candidato à aprovação!")
        print("   Iniciando preenchimento completo...")

    # ─── ETAPA 2: PREENCHIMENTO ───────────────────────────────────────────────
    print("\n" + "─" * 50)
    print("✍️  ETAPA 2: Preenchimento Inteligente")
    print("─" * 50)
    print(f"   Produto em foco: {analise.get('produto_recomendado', 'N/A')}")
    print(f"   Tom: {analise.get('tom_recomendado', 'N/A')}")
    print(f"   Ângulo: {analise.get('angulo_recomendado', 'N/A')}")

    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "preencher", SCRIPTS_DIR / "preencher-edital.py"
        )
        mod_preencher = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod_preencher)
        preencher_edital = mod_preencher.preencher_edital
        salvar_preenchimento = mod_preencher.salvar_preenchimento
    except Exception as e:
        print(f"⚠️  Não foi possível carregar módulo de preenchimento: {e}")
        print("   Gerando preenchimento básico de demonstração...")
        preencher_edital = _preencher_demo
        salvar_preenchimento = _salvar_demo

    perfil = carregar_perfil_titanio()
    preenchimento = preencher_edital(analise, perfil)

    caminho_preenchimento = salvar_preenchimento(preenchimento, analise.get("titulo", ""))

    # ─── ETAPA 3: PIPELINE ────────────────────────────────────────────────────
    print("\n" + "─" * 50)
    print("📋 ETAPA 3: Registro no Pipeline")
    print("─" * 50)

    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "pipeline", SCRIPTS_DIR / "pipeline-captacao.py"
        )
        mod_pipeline = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod_pipeline)

        edital_id = mod_pipeline.adicionar_edital(
            url=edital_url,
            titulo=analise.get("titulo", "Edital"),
            prazo=analise.get("prazo_inscricao", ""),
        )
        mod_pipeline.atualizar_estado(edital_id, "ANALISADO", f"Score: {score}/100")
        if score >= 50:
            mod_pipeline.atualizar_estado(edital_id, "APROVADO_PARA_INSCRICAO")
            mod_pipeline.atualizar_estado(edital_id, "EM_PREENCHIMENTO")

        print(f"   ID no pipeline: {edital_id}")
    except Exception as e:
        print(f"   Pipeline não disponível: {e}")

    # ─── NOTIFICAÇÃO À EQUIPE ─────────────────────────────────────────────────
    print("\n" + "─" * 50)
    print("📱 ETAPA 4: Notificação à Equipe")
    print("─" * 50)
    notificar_equipe(analise, preenchimento)

    # ─── SUMÁRIO FINAL ────────────────────────────────────────────────────────
    print("\n" + "═" * 65)
    print("🏁 CICLO COMPLETO — Resumo")
    print("═" * 65)
    print(f"✅ Edital analisado: {analise.get('titulo', 'N/A')}")
    print(f"📊 Score de fit: {score}/100")
    print(f"🎯 Recomendação: {recomendacao.upper()}")
    print(f"💾 Análise salva: {caminho_analise.name if isinstance(caminho_analise, Path) else caminho_analise}")
    print(f"📄 Preenchimento: {caminho_preenchimento}")
    print()
    print("⚠️  PRÓXIMOS PASSOS OBRIGATÓRIOS:")
    print("   1. Revisar preenchimento com a equipe")
    print("   2. Confirmar elegibilidade (especialmente liderança feminina)")
    print("   3. Preparar documentos obrigatórios")
    print("   4. Aprovação final antes de submeter")
    print()
    print(f"⏰ Prazo de inscrição: {analise.get('prazo_inscricao', 'VERIFICAR')}")
    print("═" * 65)

    return analise, preenchimento


def notificar_equipe(analise: dict, preenchimento: dict):
    """Notifica a equipe com resumo do que foi feito."""
    score = analise.get("fit_titanio_score", 0)
    emoji = "🟢" if score >= 70 else "🟡"

    mensagem = (
        f"*Victor Capital — Novo Edital Analisado*\n\n"
        f"📋 {analise.get('titulo', 'N/A')}\n"
        f"{emoji} Score: {score}/100\n"
        f"💰 Valor: R$ {analise.get('valor_max', 0):,.0f}\n"
        f"📅 Prazo: {analise.get('prazo_inscricao', 'N/A')}\n\n"
        f"📝 {analise.get('resumo_executivo', '')}\n\n"
        f"⚠️ Aguardando aprovação da equipe para submeter."
    )

    print(f"\n📤 Mensagem para equipe:")
    print("─" * 50)
    print(mensagem)
    print("─" * 50)

    # Tenta enviar via N8n webhook
    webhook = os.environ.get("N8N_NOTIFICATION_WEBHOOK", "")
    if webhook:
        try:
            import requests
            resp = requests.post(webhook, json={
                "titulo": f"Novo edital analisado: {analise.get('titulo', '')}",
                "mensagem": mensagem,
                "urgencia": "normal",
                "analise": analise,
            }, timeout=10)
            if resp.status_code == 200:
                print("✅ Notificação enviada via N8n/WhatsApp")
            else:
                print(f"⚠️  N8n respondeu: {resp.status_code}")
        except Exception as e:
            print(f"⚠️  Webhook indisponível: {e}")
    else:
        print("📁 Notificação salva localmente (N8N_NOTIFICATION_WEBHOOK não configurado)")


# ─── HELPERS DEMO ─────────────────────────────────────────────────────────────

def _preencher_demo(analise: dict, perfil: dict) -> dict:
    """Preenchimento de demonstração (sem IA)."""
    print("   [Demo] Gerando preenchimento básico de demonstração...")
    return {
        "titulo_edital": analise.get("titulo", ""),
        "campos_preenchidos": [
            {"campo": "Nome da empresa", "resposta": "Titanio Studio", "caracteres": 15, "notas": ""},
            {"campo": "Descrição", "resposta": "Empresa de produção audiovisual e IA. 20 anos, 40+ países.", "caracteres": 60, "notas": ""},
        ],
        "descricao_projeto": "Desenvolvimento e expansão do VoxDescriber — app de audiodescrição automática para 6,5M brasileiros com deficiência visual.",
        "justificativa": "A Titanio Studio une 20 anos de audiovisual com IA de ponta.",
        "objetivos": {"geral": "Escalar VoxDescriber no Brasil", "especificos": ["Aumentar base de usuários", "Parcerias institucionais", "Expansão de funcionalidades"]},
        "metodologia": "Desenvolvimento ágil com entregas mensais, validação com usuários com deficiência visual.",
        "cronograma": [{"mes": i, "atividade": f"Fase {i}", "descricao": f"Atividades do mês {i}"} for i in range(1, 7)],
        "orcamento": {"total": analise.get("valor_max", 0) * 0.85, "itens": [{"categoria": "RH", "valor": analise.get("valor_max", 0) * 0.6, "justificativa": "Equipe técnica"}]},
        "resultados_esperados": ["100k usuários ativos", "Parcerias com 10 instituições", "Expansão para LATAM"],
        "impacto_social": "Acessibilidade para 6,5M brasileiros com deficiência visual.",
        "equipe": [{"nome": "Tiago Arakilian", "cargo": "CEO/Fundador", "qualificacao": "Sorbonne, 20 anos de audiovisual"}],
        "documentos_checklist": [{"documento": d, "status": "preparar", "observacao": ""} for d in analise.get("documentos_obrigatorios", [])],
        "resumo_executivo": "Titanio Studio solicita recursos para expandir VoxDescriber, impactando 6,5M brasileiros com deficiência visual.",
        "alertas": ["⚠️ Revisão humana obrigatória antes de submeter", "⚠️ Confirmar CNPJ e dados cadastrais"],
        "_meta": {"status": "RASCUNHO DEMO — não submeter sem revisão", "data_preenchimento": datetime.now().isoformat()},
    }


def _salvar_demo(preenchimento: dict, titulo: str = "") -> str:
    """Salva preenchimento de demonstração."""
    import re
    titulo_slug = re.sub(r'[^\w\s-]', '', titulo or "demo")
    titulo_slug = re.sub(r'[-\s]+', '-', titulo_slug).strip('-').lower()[:40]
    data = datetime.now().strftime("%Y%m%d_%H%M")
    caminho = PASTA_SAIDAS / f"preenchimento_demo_{titulo_slug}_{data}.json"
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(preenchimento, f, ensure_ascii=False, indent=2)
    print(f"   💾 Demo salvo: {caminho.name}")
    return str(caminho)


# ─── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Victor Capital — Exemplo de ciclo completo de captação"
    )
    parser.add_argument(
        "--url",
        default="http://www.finep.gov.br/chamadas-publicas/chamadapublica/788",
        help="URL do edital para analisar"
    )
    parser.add_argument(
        "--modo",
        choices=["real", "simulado"],
        default="simulado",
        help="Modo de execução (real=faz download, simulado=usa dados de exemplo)"
    )
    args = parser.parse_args()

    modo_simulado = (args.modo == "simulado")

    if modo_simulado:
        print("\n⚡ Executando em modo SIMULADO (sem download real)")
        print("   Para análise real: python exemplo-uso.py --modo real --url URL_DO_EDITAL")

    analise, preenchimento = ciclo_completo(args.url, modo_simulado=modo_simulado)

    if preenchimento:
        print("\n🚀 Sistema Victor Capital funcionando corretamente!")
        print("   Próximo edital: adicione via pipeline-captacao.py --adicionar")


if __name__ == "__main__":
    main()
