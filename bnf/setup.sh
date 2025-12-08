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
    echo "Error: antlr4 command not found."
    echo "Please install ANTLR4:"
    echo "  - Using pip: pip install antlr4-tools"
    echo "  - Or download from: https://www.antlr.org/download.html"
    exit 1
fi

# Generate JavaScript parsers
echo "Generating JavaScript parsers..."
cd "$SCRIPT_DIR/javascript"
mkdir -p src/generated
antlr4 -Dlanguage=JavaScript -visitor -o src/generated "$GRAMMARS_DIR/Ds.g4" "$GRAMMARS_DIR/Dsp.g4"
echo "✓ JavaScript parsers generated"
echo

# Generate Python parsers
echo "Generating Python parsers..."
cd "$SCRIPT_DIR/python"
mkdir -p ds_bnf/generated
antlr4 -Dlanguage=Python3 -visitor -o ds_bnf/generated "$GRAMMARS_DIR/Ds.g4" "$GRAMMARS_DIR/Dsp.g4"
# Create __init__.py for the generated package
touch ds_bnf/generated/__init__.py
echo "✓ Python parsers generated"
echo

echo "BNF package setup complete!"
echo
echo "Next steps:"
echo "  JavaScript: cd javascript && npm install && npm run build"
echo "  Python:     cd python && pip install -e ."
