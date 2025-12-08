#!/bin/bash

# Setup script for BNF package
# This script generates ANTLR parsers for both JavaScript and Python

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GRAMMARS_DIR="$SCRIPT_DIR/grammars"

echo "Setting up BNF package..."
echo

# Check if antlr4 is installed
if ! command -v antlr4 &> /dev/null; then
    echo "Warning: antlr4 command not found."
    echo "Trying to use antlr4-tools via Python..."
    ANTLR_CMD="python3 -m antlr4_tools"
else
    ANTLR_CMD="antlr4"
fi

# Generate JavaScript parsers
echo "Generating JavaScript parsers..."
cd "$SCRIPT_DIR"
mkdir -p src/generated
$ANTLR_CMD -Dlanguage=JavaScript -visitor -no-listener -o src/generated "$GRAMMARS_DIR/Ds.g4" "$GRAMMARS_DIR/Dsp.g4"
echo "✓ JavaScript parsers generated"
echo

# Generate Python parsers
echo "Generating Python parsers..."
cd "$SCRIPT_DIR"
mkdir -p apyds_bnf/generated
$ANTLR_CMD -Dlanguage=Python3 -visitor -no-listener -o apyds_bnf/generated "$GRAMMARS_DIR/Ds.g4" "$GRAMMARS_DIR/Dsp.g4"
# Create __init__.py for the generated package
touch apyds_bnf/generated/__init__.py
echo "✓ Python parsers generated"
echo

echo "BNF package setup complete!"
echo
echo "Next steps:"
echo "  JavaScript: npm install && npm run build"
echo "  Python:     pip install -e ."
