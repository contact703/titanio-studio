#!/bin/bash
cd /Volumes/TITA_039/MAC_MINI_03/Desktop/edu/gospia/gospia-mobile-app

HERMESC="node_modules/react-native/sdks/hermesc/osx-bin/hermesc"
BUNDLE="android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle"

echo "=== Starting hermesc compilation ===" > /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/hermesc_compile.log
echo "Time: $(date)" >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/hermesc_compile.log
echo "Bundle size: $(stat -f%z "$BUNDLE" 2>/dev/null || stat -c%s "$BUNDLE" 2>/dev/null)" >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/hermesc_compile.log

"$HERMESC" -w -emit-binary -max-diagnostic-width=80 \
  -out "${BUNDLE}.hbc" \
  "$BUNDLE" -O -output-source-map >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/hermesc_compile.log 2>&1

EXIT_CODE=$?
echo "=== Finished ===" >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/hermesc_compile.log
echo "Exit code: $EXIT_CODE" >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/hermesc_compile.log
echo "HBC exists: $([ -f "${BUNDLE}.hbc" ] && echo YES || echo NO)" >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/hermesc_compile.log
ls -la "${BUNDLE}.hbc" 2>/dev/null >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/hermesc_compile.log

echo $EXIT_CODE > /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/hermesc_exit_code.txt
