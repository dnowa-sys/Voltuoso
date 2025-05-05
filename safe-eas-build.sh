#!/bin/bash

# === CONFIG ===
PROJECT_NAME="Voltuoso"
EXPECTED_DIR="$HOME/DeveloperDocs/$PROJECT_NAME"

# === CHECK CURRENT DIRECTORY ===
echo "📍 Current directory: $(pwd)"
if [ "$(pwd)" != "$EXPECTED_DIR" ]; then
  echo "❌ You're not in the correct project directory!"
  echo "➡️  Expected: $EXPECTED_DIR"
  exit 1
fi

# === CHECK FOR 'Library/' FILES IN BUILD ===
echo "🔍 Checking for macOS system junk in the project tarball..."

tar --exclude='test-build.tar.gz' -cf test-build.tar.gz . 2>/dev/null
MATCHES=$(tar -tf test-build.tar.gz | grep -Ei '^Library/|/Library/')

if [ -n "$MATCHES" ]; then
  echo "❌ EAS Build will likely fail. Found these rogue entries:"
  echo "$MATCHES"
  echo ""
  echo "💡 Fix this by updating your .easignore file and clearing any cached files."
  rm -f test-build.tar.gz
  exit 2
else
  echo "✅ No casing issues detected. Proceeding to build..."
fi

# === RUN EAS BUILD ===
rm -f test-build.tar.gz
eas build --platform ios --profile development
