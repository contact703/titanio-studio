#!/usr/bin/env python3
"""
Victor Capital — Sistema de Acompanhamento de Processos
Titanio Studio | Atualizado: 2026-03-18

Monitora inscrições ativas em editais e fundos:
- Verifica status online (quando possível)
- Detecta prazos se aproximando (7, 3, 1 dia)
- Gera alertas e notificações
- Atualiza processos-ativos.json

Uso:
    python acompanhar-processos.py
    python acompanhar-processos.py --alertas-apenas
    python acompanhar-processos.py --notificar
"""

import json
import sys
import argparse
import subprocess
from datetime import datetime, timedelta, date
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    import subprocess
    for pip_flags in [
        [sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4"],
        [sys.executable, "-m", "pip", "install", "--break-system-packages", "requests", "beautifulsoup4"],
        [sys.executable, "-m", "pip", "install", "--user", "requests", "beautifulsoup4"],
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
ARQUIVO_PROCESSOS = BASE_DIR / "processos-ativos.json"
ARQUIVO_LOG = BASE_DIR / "logs" / f"acompanhamento-{datetime.now().strftime('%Y-%m-%d')}.log"

ALERTAS_DIAS = [30, 14, 7, 3, 1]  # Alertar quando faltam X dias

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
}

STATUS_VALIDOS = [
    "inscrito",           # Inscrição enviada, aguardando análise
    "em_analise",         # Em análise pela banca/equipe
    "selecionado",        # Selecionado para próxima fase
    "aprovado",           # APROVADO! 🎉
    "reprovado",          # Não aprovado neste ciclo
    "recurso_enviado",    # Recurso enviado após reprovação
    "contrato_pendente",  # Aprovado, aguardando assinatura de contrato
    "em_execucao",        # Projeto aprovado e em andamento
    "concluido",          # Projeto finalizado
    "cancelado",          # Cancelado pela empresa ou pelo órgão
    "monitorar",          # Ainda não inscrito, mas monitorando
]

# ─────────────────────────────────────────────
# FUNÇÕES PRINCIPAIS
# ─────────────────────────────────────────────

def carregar_processos() -> list:
    """Carrega lista de processos do arquivo JSON."""
    if not ARQUIVO_PROCESSOS.exists():
        print(f"❌ Arquivo não encontrado: {ARQUIVO_PROCESSOS}")
        print("   Execute: python acompanhar-processos.py --criar-exemplo")
        return []
    
    with open(ARQUIVO_PROCESSOS, encoding="utf-8") as f:
        data = json.load(f)
    
    return data.get("processos", data) if isinstance(data, dict) else data


def salvar_processos(processos: list):
    """Salva lista atualizada de processos."""
    payload = {
        "ultima_atualizacao": datetime.now().isoformat(),
        "empresa": "Titanio Studio",
        "total": len(processos),
        "processos": processos,
    }
    
    with open(ARQUIVO_PROCESSOS, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Processos salvos em {ARQUIVO_PROCESSOS}")


def calcular_dias_restantes(prazo_str: str) -> int | None:
    """Calcula dias restantes até um prazo."""
    if not prazo_str or prazo_str in ("perene", "variavel", ""):
        return None
    
    try:
        prazo = datetime.strptime(prazo_str[:10], "%Y-%m-%d").date()
        hoje = date.today()
        return (prazo - hoje).days
    except (ValueError, TypeError):
        return None


def verificar_status_online(processo: dict, verbose: bool = False) -> dict:
    """
    Tenta verificar status online do processo.
    Retorna dicionário com status atualizado e notas.
    """
    url = processo.get("url_acompanhamento", "")
    
    if not url:
        return {"atualizado": False, "nota": "Sem URL de acompanhamento"}
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")
        
        # Buscar palavras-chave de status no conteúdo
        texto = soup.get_text().lower()
        
        indicadores = {
            "aprovado": ["aprovado", "contemplado", "beneficiário", "resultado final aprovado"],
            "selecionado": ["selecionado", "classificado", "habilitado", "fase seguinte"],
            "reprovado": ["não aprovado", "indeferido", "desclassificado", "não selecionado"],
            "em_analise": ["análise", "avaliação", "julgamento", "em análise"],
        }
        
        novo_status = None
        for status, keywords in indicadores.items():
            for kw in keywords:
                if kw in texto:
                    novo_status = status
                    break
            if novo_status:
                break
        
        if novo_status and novo_status != processo.get("status"):
            return {
                "atualizado": True,
                "novo_status": novo_status,
                "nota": f"Status detectado automaticamente via web: '{novo_status}'",
            }
        
        return {"atualizado": False, "nota": "Sem mudança detectada"}
    
    except requests.exceptions.Timeout:
        return {"atualizado": False, "nota": "Timeout ao verificar URL"}
    except Exception as e:
        if verbose:
            print(f"    ⚠️  Erro ao verificar {url}: {e}")
        return {"atualizado": False, "nota": f"Erro: {str(e)[:50]}"}


def gerar_alertas(processos: list) -> list:
    """Gera lista de alertas com base nos prazos e status."""
    alertas = []
    hoje = date.today()
    
    for p in processos:
        if p.get("status") in ("cancelado", "concluido", "reprovado"):
            continue
        
        # Alertas de prazo de resultado
        prazo_resultado = p.get("prazo_resultado", "")
        dias = calcular_dias_restantes(prazo_resultado)
        
        if dias is not None:
            if dias < 0:
                alertas.append({
                    "tipo": "prazo_vencido",
                    "nivel": "info",
                    "processo": p["edital"],
                    "mensagem": f"Prazo de resultado passou há {abs(dias)} dias — verificar resultado manualmente",
                    "url": p.get("url_acompanhamento", ""),
                })
            elif dias == 0:
                alertas.append({
                    "tipo": "resultado_hoje",
                    "nivel": "critico",
                    "processo": p["edital"],
                    "mensagem": f"🔔 HOJE é o prazo de resultado — verificar agora!",
                    "url": p.get("url_acompanhamento", ""),
                })
            elif dias in ALERTAS_DIAS:
                nivel = "urgente" if dias <= 3 else "alerta"
                alertas.append({
                    "tipo": "prazo_proximo",
                    "nivel": nivel,
                    "processo": p["edital"],
                    "mensagem": f"⏰ Faltam {dias} dias para o resultado ({prazo_resultado})",
                    "url": p.get("url_acompanhamento", ""),
                })
        
        # Alertas de prazo de inscrição (para processos em "monitorar")
        prazo_inscricao = p.get("prazo_inscricao", "")
        if p.get("status") == "monitorar" and prazo_inscricao:
            dias_inscricao = calcular_dias_restantes(prazo_inscricao)
            if dias_inscricao is not None and dias_inscricao <= 14:
                nivel = "urgente" if dias_inscricao <= 3 else "alerta"
                alertas.append({
                    "tipo": "inscricao_urgente",
                    "nivel": nivel,
                    "processo": p["edital"],
                    "mensagem": f"🚨 Inscrição fecha em {dias_inscricao} dias! ({prazo_inscricao})",
                    "url": p.get("url_inscricao", p.get("url_acompanhamento", "")),
                })
        
        # Alertar se aprovado e sem ação há mais de 7 dias
        if p.get("status") == "aprovado":
            alertas.append({
                "tipo": "aprovado_sem_acao",
                "nivel": "critico",
                "processo": p["edital"],
                "mensagem": f"🎉 APROVADO! Verificar próximos passos: contrato, documentação, etc.",
                "url": p.get("url_acompanhamento", ""),
            })
    
    # Ordenar alertas por nível
    ordem = {"critico": 0, "urgente": 1, "alerta": 2, "info": 3}
    alertas.sort(key=lambda x: ordem.get(x["nivel"], 9))
    
    return alertas


def calcular_estatisticas(processos: list) -> dict:
    """Calcula estatísticas gerais dos processos."""
    total_solicitado = sum(p.get("valor_solicitado", 0) for p in processos)
    total_aprovado = sum(
        p.get("valor_solicitado", 0) 
        for p in processos 
        if p.get("status") == "aprovado"
    )
    total_em_analise = sum(
        p.get("valor_solicitado", 0)
        for p in processos
        if p.get("status") in ("inscrito", "em_analise", "selecionado", "recurso_enviado")
    )
    
    por_status = {}
    for p in processos:
        s = p.get("status", "desconhecido")
        por_status[s] = por_status.get(s, 0) + 1
    
    # Probabilidade ponderada de aprovação
    valor_esperado = sum(
        p.get("valor_solicitado", 0) * p.get("probabilidade", 0.3)
        for p in processos
        if p.get("status") in ("inscrito", "em_analise", "selecionado")
    )
    
    return {
        "total_processos": len(processos),
        "total_solicitado_brl": total_solicitado,
        "total_aprovado_brl": total_aprovado,
        "total_em_analise_brl": total_em_analise,
        "valor_esperado_brl": round(valor_esperado, 2),
        "por_status": por_status,
        "taxa_aprovacao_estimada": round(
            total_aprovado / total_solicitado * 100, 1
        ) if total_solicitado > 0 else 0,
    }


def notificar_via_openclaw(mensagem: str):
    """Envia notificação via openclaw (se disponível)."""
    try:
        result = subprocess.run(
            ["openclaw", "notify", mensagem],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            print("📱 Notificação enviada via openclaw")
    except (FileNotFoundError, subprocess.TimeoutExpired):
        print(f"📋 [SEM OPENCLAW] Alerta: {mensagem}")


def imprimir_resumo(processos: list, alertas: list, stats: dict):
    """Imprime resumo no console."""
    print("\n" + "=" * 60)
    print("📊 VICTOR CAPITAL — Relatório de Acompanhamento")
    print(f"📅 {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print("=" * 60)
    
    print(f"\n💰 FINANCEIRO:")
    print(f"   Solicitado total:  R$ {stats['total_solicitado_brl']:,.0f}")
    print(f"   Aprovado:          R$ {stats['total_aprovado_brl']:,.0f}")
    print(f"   Em análise:        R$ {stats['total_em_analise_brl']:,.0f}")
    print(f"   Valor esperado:    R$ {stats['valor_esperado_brl']:,.0f}")
    
    print(f"\n📋 PROCESSOS ({stats['total_processos']} total):")
    for status, qtd in sorted(stats["por_status"].items()):
        emoji = {
            "aprovado": "🎉", "selecionado": "⭐", "em_analise": "🔍",
            "inscrito": "📝", "monitorar": "👁️", "reprovado": "❌",
            "cancelado": "🚫", "em_execucao": "🚀", "concluido": "✅",
        }.get(status, "📌")
        print(f"   {emoji} {status}: {qtd}")
    
    if alertas:
        print(f"\n🚨 ALERTAS ({len(alertas)}):")
        for alerta in alertas[:10]:
            emoji = {"critico": "🔴", "urgente": "🟠", "alerta": "🟡", "info": "🔵"}.get(alerta["nivel"], "⚪")
            print(f"   {emoji} [{alerta['processo']}] {alerta['mensagem']}")
    else:
        print("\n✅ Sem alertas urgentes")
    
    print("\n" + "=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description="Victor Capital — Acompanhamento de Processos de Captação"
    )
    parser.add_argument("--alertas-apenas", action="store_true", help="Mostrar apenas alertas")
    parser.add_argument("--notificar", action="store_true", help="Enviar notificações via openclaw")
    parser.add_argument("--verbose", "-v", action="store_true", help="Modo detalhado")
    parser.add_argument("--criar-exemplo", action="store_true", help="Criar arquivo de exemplo")
    args = parser.parse_args()
    
    # Criar diretório de logs
    ARQUIVO_LOG.parent.mkdir(parents=True, exist_ok=True)
    
    processos = carregar_processos()
    
    if not processos:
        print("ℹ️  Nenhum processo ativo encontrado.")
        return 0
    
    print(f"📂 Carregados {len(processos)} processos")
    
    # Verificar status online para cada processo ativo
    processos_atualizados = 0
    for p in processos:
        if p.get("status") in ("inscrito", "em_analise", "selecionado"):
            if args.verbose:
                print(f"  🔍 Verificando: {p['edital']}")
            resultado = verificar_status_online(p, args.verbose)
            
            if resultado["atualizado"]:
                p["status"] = resultado["novo_status"]
                p["notas"] = (p.get("notas", "") + f"\n[{date.today()}] {resultado['nota']}").strip()
                processos_atualizados += 1
                print(f"  ✅ Status atualizado: {p['edital']} → {resultado['novo_status']}")
    
    if processos_atualizados > 0:
        salvar_processos(processos)
    
    # Gerar alertas
    alertas = gerar_alertas(processos)
    
    # Calcular estatísticas
    stats = calcular_estatisticas(processos)
    
    # Mostrar resumo
    if not args.alertas_apenas:
        imprimir_resumo(processos, alertas, stats)
    else:
        for alerta in alertas:
            print(f"[{alerta['nivel'].upper()}] {alerta['processo']}: {alerta['mensagem']}")
    
    # Enviar notificações se solicitado
    if args.notificar and alertas:
        criticos = [a for a in alertas if a["nivel"] in ("critico", "urgente")]
        if criticos:
            mensagem = f"Victor Capital: {len(criticos)} alerta(s) urgente(s) — {criticos[0]['mensagem']}"
            notificar_via_openclaw(mensagem)
    
    # Salvar log
    with open(ARQUIVO_LOG, "w", encoding="utf-8") as f:
        f.write(f"Execução: {datetime.now().isoformat()}\n")
        f.write(f"Processos: {len(processos)}\n")
        f.write(f"Alertas: {len(alertas)}\n")
        f.write(f"Atualizados: {processos_atualizados}\n")
        json.dump({"alertas": alertas, "stats": stats}, f, ensure_ascii=False, indent=2)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
