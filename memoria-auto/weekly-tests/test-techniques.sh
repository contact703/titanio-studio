#!/bin/bash
# TESTE SEMANAL: Testa técnicas registradas

echo "🧪 Teste semanal de técnicas..."

TEST_LOG="/tmp/memory-weekly-tests-$(date +%Y%m%d).log"

# Teste 1: instagrapi
echo "Test 1: instagrapi" >> "$TEST_LOG"
python3 -c "from instagrapi import Client; print('✅')" >> "$TEST_LOG" 2>&1

# Teste 2: yt-dlp
echo "Test 2: yt-dlp" >> "$TEST_LOG"
yt-dlp --version >> "$TEST_LOG" 2>&1

# Teste 3: Dashboard
echo "Test 3: Dashboard" >> "$TEST_LOG"
curl -s http://localhost:4444/api/health | grep -q 'ok' && echo "✅" >> "$TEST_LOG" || echo "❌" >> "$TEST_LOG"

echo "✅ Testes salvos em: $TEST_LOG"
cat "$TEST_LOG"

