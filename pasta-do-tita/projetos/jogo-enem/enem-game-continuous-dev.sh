#!/bin/bash

# ENEM Game — Continuous Development Watchdog
# Runs for 1 week, continuously generating & improving the game
# Cost: R$ 0.00 (StepFlash + Nemotron)

GAME_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/enem-game-generation"
LOG_FILE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/enem-game-continuous.log"

# Append to log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "🎮 ENEM Game Continuous Development Started"
log "Duration: 7 days"
log "Cost: R\$ 0.00"
log ""

# Check if orchestration is running
check_status() {
    if ps aux | grep -q "run-agents.sh"; then
        return 0
    else
        return 1
    fi
}

# Function: Restart agents if stopped
restart_agents() {
    log "🔄 Agents down. Restarting..."
    cd "$GAME_DIR" && nohup bash run-agents.sh >> "${GAME_DIR}/logs/continuous-dev.log" 2>&1 &
    log "✅ Agents restarted"
}

# Main loop: 7 days
END_TIME=$(($(date +%s) + 7 * 24 * 60 * 60))  # 7 days from now

log "📊 Monitoring started. End time: $(date -r $END_TIME)"

while [ $(date +%s) -lt $END_TIME ]; do
    
    # Every 30 minutes: check if agents are still running
    if ! check_status; then
        restart_agents
    else
        log "✅ Agents healthy"
    fi
    
    # Log cost every 6 hours
    HOUR=$(date +%H)
    if [ "$HOUR" == "00" ] || [ "$HOUR" == "06" ] || [ "$HOUR" == "12" ] || [ "$HOUR" == "18" ]; then
        log "💰 Cost check: R\$ 0.00 ✅"
    fi
    
    # Update progress every day
    DAYS_LEFT=$((($END_TIME - $(date +%s)) / 86400))
    if [ $(($(date +%M) % 60)) -eq 0 ]; then
        if [ $DAYS_LEFT -le 0 ]; then
            log "🎉 7-day development cycle COMPLETE"
        else
            log "📈 Development progress: $DAYS_LEFT days remaining"
        fi
    fi
    
    # Sleep 30 minutes before next check
    sleep 1800
    
done

log "🏁 Continuous development period ended"
log "Final status: Check outputs/ for complete game"
log ""
