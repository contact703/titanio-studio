#!/bin/bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="/Volumes/TITA_039/MAC_MINI_03/Library/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

cd /Volumes/TITA_039/MAC_MINI_03/Desktop/edu/gospia/gospia-mobile-app/android

echo "=== BUILD START $(date) ===" > /tmp/gospia-build.log
./gradlew assembleRelease --console=plain --no-daemon 2>&1 | tee -a /tmp/gospia-build.log
EXIT_CODE=$?
echo "=== BUILD END $(date) EXIT=$EXIT_CODE ===" >> /tmp/gospia-build.log

if [ $EXIT_CODE -eq 0 ]; then
    APK=$(find . -name "*.apk" -path "*/release/*" | head -1)
    echo "SUCCESS: APK at $APK" >> /tmp/gospia-build.log
else
    echo "FAILED with code $EXIT_CODE" >> /tmp/gospia-build.log
fi
