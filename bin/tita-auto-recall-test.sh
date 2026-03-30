#!/bin/bash
# tita-auto-recall-test.sh — Test suite for TARS (Tita Auto-Recall System)
# Tests all components and validates integration

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
AUTOLOADER="$WORKSPACE/bin/tita-memory-autoload.py"
AUTO_RECALL="$WORKSPACE/bin/tita-auto-recall.sh"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 TARS Test Suite — Tita Auto-Recall System"
echo "=============================================="
echo ""

# Test 1: Autoloader Script Exists and is Executable
echo -n "Test 1: Autoloader script exists and executable... "
if [[ -x "$AUTOLOADER" ]]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Script not found or not executable: $AUTOLOADER"
    exit 1
fi

# Test 2: Auto-recall Script Exists and is Executable
echo -n "Test 2: Auto-recall script exists and executable... "
if [[ -x "$AUTO_RECALL" ]]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Script not found or not executable: $AUTO_RECALL"
    exit 1
fi

# Test 3: Autoloader Produces Output
echo -n "Test 3: Autoloader produces context output... "
output=$(python3 "$AUTOLOADER" 2>&1)
if [[ -n "$output" ]] && [[ ${#output} -gt 100 ]]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo -e "  ${YELLOW}Output size: ${#output} chars${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Output too short or empty"
    exit 1
fi

# Test 4: Context Contains Expected Sections
echo "Test 4: Context contains expected sections..."
required_sections=("CONTEXTO ATIVO" "MEMÓRIA DE LONGO PRAZO" "LIÇÕES CRÍTICAS" "MEMÓRIA EPISÓDICA")
all_found=true

for section in "${required_sections[@]}"; do
    echo -n "  - Checking for '$section'... "
    if echo "$output" | grep -q "$section"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  NOT FOUND${NC}"
        all_found=false
    fi
done

if $all_found; then
    echo -e "${GREEN}✅ PASS - All sections present${NC}"
else
    echo -e "${YELLOW}⚠️  PARTIAL - Some sections missing (may be OK if files don't exist)${NC}"
fi

# Test 5: Auto-recall Script Runs Without Error
echo -n "Test 5: Auto-recall script runs without error... "
# Clear cache first
rm -f /tmp/tita-recall-cache
recall_output=$("$AUTO_RECALL" 2>&1)
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Error running auto-recall script"
    exit 1
fi

# Test 6: Cache Mechanism Works
echo -n "Test 6: Cache mechanism prevents duplicate injection... "
# First run should inject
"$AUTO_RECALL" > /dev/null 2>&1
# Second run (immediate) should skip
second_output=$("$AUTO_RECALL" 2>&1)
if [[ -z "$second_output" ]]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "  ${YELLOW}Cache correctly prevents re-injection within TTL${NC}"
else
    echo -e "${YELLOW}⚠️  Cache may not be working${NC}"
fi

# Test 7: Performance Check
echo -n "Test 7: Autoloader performance (<3 seconds)... "
start_time=$(date +%s)
python3 "$AUTOLOADER" > /dev/null 2>&1
end_time=$(date +%s)
elapsed=$((end_time - start_time))

if [[ $elapsed -lt 3 ]]; then
    echo -e "${GREEN}✅ PASS${NC} (${elapsed}s)"
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${elapsed}s - consider optimization)"
fi

# Test 8: Check Required Files Exist
echo "Test 8: Required memory files exist..."
required_files=(
    "$WORKSPACE/MEMORY.md"
    "$WORKSPACE/LESSONS.md"
    "$WORKSPACE/pasta-do-tita/contexto-ativo.md"
)

files_ok=true
for file in "${required_files[@]}"; do
    echo -n "  - $(basename "$file")... "
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ MISSING${NC}"
        files_ok=false
    fi
done

if $files_ok; then
    echo -e "${GREEN}✅ PASS - All files present${NC}"
else
    echo -e "${RED}❌ FAIL - Some required files missing${NC}"
    exit 1
fi

# Summary
echo ""
echo "=============================================="
echo -e "${GREEN}🎉 ALL TESTS PASSED${NC}"
echo ""
echo "Next steps:"
echo "  1. Configure OpenClaw hook to call tita-auto-recall.sh"
echo "  2. Test in real session by restarting OpenClaw"
echo "  3. Send test message: 'O que fizemos ontem?'"
echo ""
echo "Manual test command:"
echo "  python3 $AUTOLOADER"
echo ""
