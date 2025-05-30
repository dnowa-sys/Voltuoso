#!/bin/bash

# Output file
OUTPUT_FILE="audit-report.txt"

# Function to output to both terminal and file
output() {
    echo "$1" | tee -a "$OUTPUT_FILE"
}

# Clear previous report
> "$OUTPUT_FILE"

output "🔍 Voltuoso App Code Audit Script"
output "================================="
output "Report generated on: $(date)"
output ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "app" ]; then
    output "❌ Error: 'app' directory not found. Please run this script from your project root."
    exit 1
fi

output "📁 Scanning app/ directory..."
output ""

# 1. Check for missing StyleSheet imports
output "1. Checking for missing StyleSheet imports..."
output "================================================"

missing_stylesheet=()
while IFS= read -r -d '' file; do
    if grep -q "StyleSheet\.create" "$file"; then
        # Check for StyleSheet import in various patterns (single line, multi-line, etc.)
        if ! grep -Pzo '(?s)import\s*\{[^}]*StyleSheet[^}]*\}\s*from\s*["\']react-native["\']' "$file" > /dev/null 2>&1 && \
           ! grep -q "import.*StyleSheet.*from.*react-native" "$file" && \
           ! grep -q "StyleSheet.*from.*react-native" "$file"; then
            missing_stylesheet+=("$file")
            output "❌ Missing StyleSheet import: $file"
            # Show the actual import section for debugging
            output "   Current react-native imports:"
            grep -A 10 -B 2 "from [\"']react-native[\"']" "$file" | head -15 >> "$OUTPUT_FILE"
            output ""
        fi
    fi
done < <(find app/ -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -print0)

if [ ${#missing_stylesheet[@]} -eq 0 ]; then
    output "✅ All files using StyleSheet have proper imports"
fi

output ""

# 2. Check for missing default exports
output "2. Checking for missing default exports..."
output "============================================="

missing_exports=()
while IFS= read -r -d '' file; do
    # Skip files that don't look like components/screens
    if [[ ! "$file" =~ (_layout|not-found|\+|index) ]] && [[ "$file" =~ \.(js|jsx|ts|tsx)$ ]]; then
        if ! grep -q "export default" "$file"; then
            missing_exports+=("$file")
            output "❌ Missing default export: $file"
        fi
    fi
done < <(find app/ -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -print0)

if [ ${#missing_exports[@]} -eq 0 ]; then
    output "✅ All screen components have default exports"
fi

output ""

# 3. Check AuthContext for proper Firebase pattern
output "3. Checking AuthContext Firebase pattern..."
output "==========================================="

auth_files=($(find . -name "*auth*" -o -name "*Auth*" | grep -E "\.(js|jsx|ts|tsx)$"))

if [ ${#auth_files[@]} -eq 0 ]; then
    output "⚠️  No AuthContext files found"
else
    for file in "${auth_files[@]}"; do
        output "Checking: $file"
        
        # Check for modular Firebase imports
        if grep -q "getAuth" "$file"; then
            output "✅ Uses getAuth - Good!"
        else
            output "❌ Missing getAuth import/usage"
        fi
        
        # Check for onAuthStateChanged with auth parameter
        if grep -q "onAuthStateChanged.*auth.*," "$file"; then
            output "✅ Uses onAuthStateChanged with auth parameter - Good!"
        else
            output "❌ Missing proper onAuthStateChanged with auth parameter pattern"
        fi
        
        # Check for deprecated Firebase v8 patterns
        if grep -q "firebase\.auth" "$file"; then
            output "❌ Found deprecated firebase.auth pattern"
        fi
        
        output ""
    done
fi

# 4. Look for common React Native issues
output "4. Additional React Native checks..."
output "===================================="

# Check for components using styles without StyleSheet
output "Checking for inline styles that should use StyleSheet..."
problematic_styles=()
while IFS= read -r -d '' file; do
    if grep -q "style={{" "$file" && grep -q "StyleSheet\.create" "$file"; then
        line_num=$(grep -n "style={{" "$file" | head -1 | cut -d: -f1)
        problematic_styles+=("$file:$line_num")
        output "⚠️  Mixed inline and StyleSheet styles in: $file line $line_num"
    fi
done < <(find app/ -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -print0)

output ""

# Summary
output "📊 AUDIT SUMMARY"
output "================"
output "StyleSheet import issues: ${#missing_stylesheet[@]}"
output "Default export issues: ${#missing_exports[@]}"
output "AuthContext files found: ${#auth_files[@]}"
output ""

if [ ${#missing_stylesheet[@]} -gt 0 ] || [ ${#missing_exports[@]} -gt 0 ]; then
    output "❌ Issues found! Please review the files listed above."
    echo ""
    echo "📄 Full report saved to: $OUTPUT_FILE"
    exit 1
else
    output "✅ No critical issues found in basic checks!"
    output "💡 Still review AuthContext manually for Firebase v9+ modular patterns."
