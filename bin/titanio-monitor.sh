#!/bin/bash
# titanio-monitor.sh — Monitor de recursos com alerta
# Uso: titanio-monitor.sh [check|report|alert]

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
LOG="$WORKSPACE/memory/system-health.log"

get_ram() {
    vm_stat 2>/dev/null | awk '
    /Pages free/ {free=$3}
    /Pages active/ {active=$3}
    /Pages inactive/ {inactive=$3}
    /Pages speculative/ {spec=$3}
    /Pages wired/ {wired=$3}
    END {
        gsub(/\./,"",free); gsub(/\./,"",active); gsub(/\./,"",inactive); gsub(/\./,"",wired)
        total=free+active+inactive+wired
        used=active+wired
        if(total>0) printf "%d", (used*100/total)
        else printf "0"
    }'
}

get_cpu() {
    top -l 1 -n 0 2>/dev/null | awk '/CPU usage/ {gsub(/%/,"",$3); printf "%d", $3}' || echo "0"
}

get_disk() {
    df -h / 2>/dev/null | awk 'NR==2 {gsub(/%/,"",$5); print $5}'
}

check() {
    RAM=$(get_ram)
    CPU=$(get_cpu)
    DISK=$(get_disk)
    
    # Serviços
    DASH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4444/api/health --max-time 2 2>/dev/null)
    N8N=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5678 --max-time 2 2>/dev/null)
    OLLAMA=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:11434 --max-time 2 2>/dev/null)
    GW=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:18789 --max-time 2 2>/dev/null)
    
    echo "$(date '+%Y-%m-%d %H:%M') | RAM:${RAM}% CPU:${CPU}% Disk:${DISK}% | Dash:${DASH} N8n:${N8N} Ollama:${OLLAMA} GW:${GW}" >> "$LOG"
    
    echo "📊 TITANIO MONITOR"
    echo "  RAM:  ${RAM}% $([ "$RAM" -gt 95 ] && echo '🔴 CRÍTICO' || [ "$RAM" -gt 85 ] && echo '🟡 Alto' || echo '🟢 OK')"
    echo "  CPU:  ${CPU}% $([ "$CPU" -gt 90 ] && echo '🔴' || echo '🟢')"
    echo "  Disk: ${DISK}% $([ "$DISK" -gt 90 ] && echo '🔴' || echo '🟢')"
    echo "  Dashboard: $([ "$DASH" = "200" ] && echo '🟢 OK' || echo '🔴 DOWN')"
    echo "  N8n:       $([ "$N8N" = "200" ] || [ "$N8N" = "301" ] && echo '🟢 OK' || echo '🔴 DOWN')"
    echo "  Ollama:    $([ "$OLLAMA" = "200" ] && echo '🟢 OK' || echo '🟡 OFF')"
    echo "  Gateway:   $([ "$GW" = "200" ] || [ "$GW" = "404" ] && echo '🟢 OK' || echo '🔴 DOWN')"
    
    # Alertar se crítico
    if [ "$RAM" -gt 97 ] || [ "$DASH" != "200" ] || [ "$GW" != "200" ] && [ "$GW" != "404" ]; then
        return 1
    fi
    return 0
}

report() {
    echo "📊 ÚLTIMAS 24H:"
    tail -48 "$LOG" 2>/dev/null | head -24
}

case "${1:-check}" in
    check) check ;;
    report) report ;;
    *) echo "Uso: $0 [check|report]" ;;
esac
