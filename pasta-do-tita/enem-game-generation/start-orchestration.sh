#!/bin/bash

# OpenMOSS ENEM Game Generation Orchestrator
# Starts all 4 agents in parallel: Designer → Content → CodeGen → QA
# Uses StepFlash + Nemotron (free models)
# Target: MVP ready in ~12 hours

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_DIR="$SCRIPT_DIR/logs"
OUTPUT_DIR="$SCRIPT_DIR/outputs"
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)

# Create directories
mkdir -p "$LOG_DIR"
mkdir -p "$OUTPUT_DIR/code"
mkdir -p "$OUTPUT_DIR/code/managers"
mkdir -p "$OUTPUT_DIR/code/ui"

echo "🚀 OpenMOSS ENEM Game Generation — Starting Orchestration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Timestamp: $TIMESTAMP"
echo "Log directory: $LOG_DIR"
echo "Output directory: $OUTPUT_DIR"
echo ""

# Update orchestration.json with start time
jq ".estimated_timeline.start = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" \
    "$SCRIPT_DIR/orchestration.json" > "$SCRIPT_DIR/orchestration.json.tmp" && \
    mv "$SCRIPT_DIR/orchestration.json.tmp" "$SCRIPT_DIR/orchestration.json"

echo "📋 PHASE 1: Parallel Agents (Designer + Content)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start Designer Agent (Nemotron)
echo "🎨 Starting Game Designer Agent (Nemotron)..."
(
    AGENT_START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Call LiteLLM router with Game Designer prompt
    curl -s -X POST http://localhost:4444/api/orchestrate \
        -H "Content-Type: application/json" \
        -d "{
            \"agent\": \"game_designer\",
            \"model\": \"nemotron\",
            \"prompt_file\": \"$SCRIPT_DIR/prompts/game-designer.md\",
            \"output_file\": \"$OUTPUT_DIR/game-structure.json\",
            \"timeout_minutes\": 15
        }" > "$LOG_DIR/${TIMESTAMP}_designer.log" 2>&1 &
    
    DESIGNER_PID=$!
    echo "  └─ PID: $DESIGNER_PID"
) &

DESIGNER_PID=$!

# Start Content Agent (StepFlash)
echo "📚 Starting Content Creator Agent (StepFlash)..."
(
    AGENT_START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    curl -s -X POST http://localhost:4444/api/orchestrate \
        -H "Content-Type: application/json" \
        -d "{
            \"agent\": \"content_creator\",
            \"model\": \"stepflash\",
            \"prompt_file\": \"$SCRIPT_DIR/prompts/content-creator.md\",
            \"output_file\": \"$OUTPUT_DIR/questions.json\",
            \"timeout_minutes\": 20
        }" > "$LOG_DIR/${TIMESTAMP}_content.log" 2>&1 &
    
    CONTENT_PID=$!
    echo "  └─ PID: $CONTENT_PID"
) &

CONTENT_PID=$!

# Wait for Phase 1 to complete
echo ""
echo "⏳ Waiting for Phase 1 agents to complete..."
wait $DESIGNER_PID $CONTENT_PID

if [ $? -eq 0 ]; then
    echo "✅ Phase 1 Complete (Designer + Content)"
else
    echo "❌ Phase 1 Failed"
    exit 1
fi

echo ""
echo "💻 PHASE 2: Code Generation (Sequential)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🔧 Starting Code Generator Agent (Nemotron)..."
curl -s -X POST http://localhost:4444/api/orchestrate \
    -H "Content-Type: application/json" \
    -d "{
        \"agent\": \"code_generator\",
        \"model\": \"nemotron\",
        \"prompt_file\": \"$SCRIPT_DIR/prompts/code-generator.md\",
        \"input_files\": [\"$OUTPUT_DIR/game-structure.json\", \"$OUTPUT_DIR/questions.json\"],
        \"output_dir\": \"$OUTPUT_DIR/code/\",
        \"timeout_minutes\": 30
    }" > "$LOG_DIR/${TIMESTAMP}_codegen.log" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Phase 2 Complete (Code Generation)"
else
    echo "❌ Phase 2 Failed"
    exit 1
fi

echo ""
echo "✅ PHASE 3: QA Testing (Sequential)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🧪 Starting QA Tester Agent (StepFlash)..."
curl -s -X POST http://localhost:4444/api/orchestrate \
    -H "Content-Type: application/json" \
    -d "{
        \"agent\": \"qa_tester\",
        \"model\": \"stepflash\",
        \"prompt_file\": \"$SCRIPT_DIR/prompts/qa-tester.md\",
        \"input_files\": [\"$OUTPUT_DIR/code/*\", \"$OUTPUT_DIR/questions.json\"],
        \"output_file\": \"$OUTPUT_DIR/bugs.json\",
        \"timeout_minutes\": 15
    }" > "$LOG_DIR/${TIMESTAMP}_qa.log" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Phase 3 Complete (QA Testing)"
else
    echo "⚠️  Phase 3 had issues - check logs"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Orchestration Complete!"
echo ""
echo "📁 Outputs:"
echo "  • Game Structure: $OUTPUT_DIR/game-structure.json"
echo "  • Questions DB: $OUTPUT_DIR/questions.json"
echo "  • GDScript Code: $OUTPUT_DIR/code/"
echo "  • Test Report: $OUTPUT_DIR/bugs.json"
echo ""
echo "📊 Logs:"
ls -lh "$LOG_DIR/${TIMESTAMP}"* 2>/dev/null || echo "  (check $LOG_DIR for details)"
echo ""
echo "💰 Costs:"
echo "  • Total: R$ 0.00 ✅"
echo ""
echo "Next: Review outputs and iterate if needed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
