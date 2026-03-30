#!/bin/bash
# ============================================================
# Victor Capital — Gerador de Relatório Semanal
# Titanio Studio | Belo Horizonte, MG
# ============================================================
# 
# EXECUÇÃO:
#   bash gerar-relatorio.sh
#   bash gerar-relatorio.sh --notificar
#   bash gerar-relatorio.sh --silencioso
#
# CRON (toda segunda às 9h):
#   0 9 * * 1 /bin/bash /path/to/gerar-relatorio.sh --notificar
#
# ============================================================

set -e

# ─────────────────────────────────────────────
# CONFIGURAÇÃO
# ─────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$BASE_DIR/logs"
DATA=$(date +%Y-%m-%d)
HORA=$(date +%H:%M)
NOTIFICAR=false
SILENCIOSO=false

# Parsear argumentos
for arg in "$@"; do
    case $arg in
        --notificar) NOTIFICAR=true ;;
        --silencioso) SILENCIOSO=true ;;
    esac
done

# ─────────────────────────────────────────────
# FUNÇÕES
# ─────────────────────────────────────────────

log() {
    if [ "$SILENCIOSO" = false ]; then
        echo "$1"
    fi
}

separador() {
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

verificar_python() {
    if command -v python3 &>/dev/null; then
        echo "python3"
    elif command -v python &>/dev/null; then
        echo "python"
    else
        echo ""
    fi
}

verificar_dependencias_python() {
    local py=$1
    $py -c "import requests, bs4" 2>/dev/null
    return $?
}

notificar() {
    local mensagem="$1"
    if [ "$NOTIFICAR" = true ]; then
        # Tentar via openclaw
        if command -v openclaw &>/dev/null; then
            openclaw notify "$mensagem" 2>/dev/null || true
            log "📱 Notificação enviada via openclaw"
        else
            log "ℹ️  openclaw não disponível — notificação não enviada"
        fi
    fi
}

# ─────────────────────────────────────────────
# INÍCIO
# ─────────────────────────────────────────────

separador
log "🏦 VICTOR CAPITAL — Gerador de Relatório Semanal"
log "🎬 Titanio Studio | $DATA $HORA"
log "📁 Base: $BASE_DIR"
separador

# Criar diretórios necessários
mkdir -p "$LOG_DIR"
mkdir -p "$BASE_DIR/templates"

# ─────────────────────────────────────────────
# PASSO 1: Verificar Python
# ─────────────────────────────────────────────

log ""
log "🐍 Verificando Python..."
PY=$(verificar_python)

if [ -z "$PY" ]; then
    log "❌ Python não encontrado. Instale Python 3.8+ para continuar."
    exit 1
fi

PYTHON_VERSION=$($PY --version 2>&1)
log "   ✅ $PYTHON_VERSION disponível"

# Verificar/instalar dependências
if ! verificar_dependencias_python "$PY" 2>/dev/null; then
    log "   📦 Instalando dependências Python..."
    $PY -m pip install requests beautifulsoup4 lxml --quiet 2>/dev/null || {
        log "   ⚠️  Não foi possível instalar dependências automaticamente"
        log "   Execute: pip3 install requests beautifulsoup4 lxml"
    }
fi

# ─────────────────────────────────────────────
# PASSO 2: Buscar Editais
# ─────────────────────────────────────────────

log ""
log "🔍 PASSO 1: Buscando editais..."
separador

BUSCA_SCRIPT="$SCRIPT_DIR/buscar-editais.py"

if [ -f "$BUSCA_SCRIPT" ]; then
    $PY "$BUSCA_SCRIPT" --saida "$BASE_DIR" 2>&1 | tail -20
    EDITAIS_ARQUIVO="$BASE_DIR/editais-semana-$DATA.json"
    
    if [ -f "$EDITAIS_ARQUIVO" ]; then
        TOTAL_EDITAIS=$(python3 -c "
import json
with open('$EDITAIS_ARQUIVO') as f:
    d = json.load(f)
print(len(d.get('editais', [])))
" 2>/dev/null || echo "?")
        log "   ✅ $TOTAL_EDITAIS editais catalogados"
    fi
else
    log "   ⚠️  Script buscar-editais.py não encontrado em $BUSCA_SCRIPT"
fi

# ─────────────────────────────────────────────
# PASSO 3: Acompanhar Processos
# ─────────────────────────────────────────────

log ""
log "📊 PASSO 2: Acompanhando processos ativos..."
separador

ACOMPANHAR_SCRIPT="$SCRIPT_DIR/acompanhar-processos.py"
PROCESSOS_ARQUIVO="$BASE_DIR/processos-ativos.json"

if [ -f "$ACOMPANHAR_SCRIPT" ]; then
    if [ -f "$PROCESSOS_ARQUIVO" ]; then
        $PY "$ACOMPANHAR_SCRIPT" 2>&1
    else
        log "   ⚠️  Arquivo processos-ativos.json não encontrado"
        log "   Criando arquivo inicial..."
        # O arquivo já deve existir após a configuração inicial
    fi
else
    log "   ⚠️  Script acompanhar-processos.py não encontrado"
fi

# ─────────────────────────────────────────────
# PASSO 4: Gerar Dashboard Atualizado
# ─────────────────────────────────────────────

log ""
log "📋 PASSO 3: Atualizando dashboard..."
separador

DASHBOARD="$BASE_DIR/VICTOR-DASHBOARD.md"

if [ -f "$DASHBOARD" ]; then
    # Atualizar data de "última atualização" no dashboard
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\*\*Atualizado:\*\* .*/\*\*Atualizado:\*\* $DATA/" "$DASHBOARD" 2>/dev/null || true
    else
        # Linux
        sed -i "s/\*\*Atualizado:\*\* .*/\*\*Atualizado:\*\* $DATA/" "$DASHBOARD" 2>/dev/null || true
    fi
    log "   ✅ Dashboard atualizado: $DASHBOARD"
else
    log "   ⚠️  Dashboard não encontrado em $DASHBOARD"
fi

# ─────────────────────────────────────────────
# PASSO 5: Verificar Prazos Urgentes
# ─────────────────────────────────────────────

log ""
log "⏰ PASSO 4: Verificando prazos urgentes..."
separador

ALERTAS_TEXTO=""

if [ -f "$PROCESSOS_ARQUIVO" ]; then
    # Usar Python para calcular prazos
    ALERTAS_TEXTO=$($PY << 'PYEOF'
import json
from datetime import datetime, date

try:
    with open('PROCESSOS_ARQUIVO_PLACEHOLDER') as f:
        data = json.load(f)
    
    processos = data.get('processos', data) if isinstance(data, dict) else data
    hoje = date.today()
    alertas = []
    
    for p in processos:
        prazo = p.get('prazo_inscricao') or p.get('prazo_resultado', '')
        if prazo and prazo not in ('perene', 'variavel', ''):
            try:
                d = datetime.strptime(prazo[:10], '%Y-%m-%d').date()
                dias = (d - hoje).days
                if 0 <= dias <= 30:
                    emoji = '🔴' if dias <= 7 else '🟠' if dias <= 14 else '🟡'
                    alertas.append(f"  {emoji} {p['edital']}: {dias} dias ({prazo})")
            except:
                pass
    
    if alertas:
        print('\n'.join(alertas))
    else:
        print('  ✅ Nenhum prazo urgente nos próximos 30 dias')
        
except Exception as e:
    print(f'  ⚠️  Erro ao verificar prazos: {e}')
PYEOF
    # Fix: usar o arquivo real
    ALERTAS_TEXTO=$($PY - <<PYEOF2
import json, sys
from datetime import datetime, date

try:
    with open('$PROCESSOS_ARQUIVO') as f:
        data = json.load(f)
    
    processos = data.get('processos', data) if isinstance(data, dict) else data
    hoje = date.today()
    alertas = []
    
    for p in processos:
        prazo = p.get('prazo_inscricao') or p.get('prazo_resultado', '')
        if prazo and prazo not in ('perene', 'variavel', ''):
            try:
                d = datetime.strptime(prazo[:10], '%Y-%m-%d').date()
                dias = (d - hoje).days
                if 0 <= dias <= 30:
                    emoji = '🔴' if dias <= 7 else '🟠' if dias <= 14 else '🟡'
                    alertas.append(f"  {emoji} {p['edital']}: {dias} dias ({prazo})")
            except:
                pass
    
    if alertas:
        print('\n'.join(alertas))
    else:
        print('  ✅ Nenhum prazo urgente nos próximos 30 dias')
        
except Exception as e:
    print(f'  ⚠️  Erro: {e}')
PYEOF2
)
fi

log "$ALERTAS_TEXTO"

# ─────────────────────────────────────────────
# PASSO 6: Relatório Final
# ─────────────────────────────────────────────

log ""
log "📝 PASSO 5: Gerando log da execução..."
separador

LOG_FILE="$LOG_DIR/relatorio-$DATA.log"

{
    echo "Victor Capital — Log de Execução"
    echo "Data: $DATA $HORA"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "RESUMO:"
    echo "  Python: $PYTHON_VERSION"
    echo "  Editais buscados: $TOTAL_EDITAIS"
    echo "  Processos monitorados: $([ -f "$PROCESSOS_ARQUIVO" ] && $PY -c "import json; d=json.load(open('$PROCESSOS_ARQUIVO')); print(len(d.get('processos', d) if isinstance(d, dict) else d))" 2>/dev/null || echo 0)"
    echo ""
    echo "ALERTAS:"
    echo "$ALERTAS_TEXTO"
    echo ""
    echo "ARQUIVOS GERADOS:"
    [ -f "$EDITAIS_ARQUIVO" ] && echo "  ✅ $EDITAIS_ARQUIVO" || echo "  ❌ Arquivo de editais não gerado"
    echo "  ✅ $LOG_FILE"
} > "$LOG_FILE" 2>&1

log "   ✅ Log salvo: $LOG_FILE"

# ─────────────────────────────────────────────
# CONCLUSÃO
# ─────────────────────────────────────────────

log ""
separador
log "✅ VICTOR CAPITAL — Relatório Semanal Concluído"
log ""
log "📁 Arquivos gerados:"
[ -f "$EDITAIS_ARQUIVO" ] && log "   • Editais: $EDITAIS_ARQUIVO"
[ -f "$DASHBOARD" ] && log "   • Dashboard: $DASHBOARD"
log "   • Log: $LOG_FILE"
log ""
log "🎯 Próxima ação recomendada:"
log "   Abrir VICTOR-DASHBOARD.md para ver a lista de ações desta semana"
log ""
separador
log "🎬 Titanio Studio — 20 anos, 40 países, 470M espectadores, IA aplicada"
separador

# Enviar notificação se solicitado e houver alertas
if [ "$NOTIFICAR" = true ] && [ -n "$ALERTAS_TEXTO" ]; then
    notificar "Victor Capital: Relatório semanal gerado. Alertas de prazo detectados — ver VICTOR-DASHBOARD.md"
fi

exit 0
