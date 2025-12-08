# BNF Support Package for DS

This package provides bidirectional conversion between two syntax formats for the DS deductive system:

- **Ds**: The lisp-like syntax currently used in DS
- **Dsp**: A traditional readable syntax with infix operators

## Installation

### JavaScript/TypeScript

```bash
cd bnf
npm install
npm run prepare  # Generate ANTLR parsers
```

### Python

```bash
cd bnf
pip install -e .  # Automatically generates ANTLR parsers during installation
```

## Structure

```
bnf/
├── package.json       # JavaScript/TypeScript package (atsds-bnf)
├── pyproject.toml     # Python package (apyds-bnf)
├── setup.py           # Python setup with ANTLR generation
├── grammars/          # ANTLR grammar files
│   ├── Ds.g4         # Grammar for lisp-like syntax
│   └── Dsp.g4        # Grammar for traditional syntax
├── src/               # JavaScript source files
│   ├── index.js
│   ├── unparse.js    # Ds → Dsp conversion
│   └── parse.js      # Dsp → Ds conversion
└── apyds_bnf/        # Python package
    ├── __init__.py
    ├── unparse.py    # Ds → Dsp conversion
    ├── parse.py      # Dsp → Ds conversion
    └── cli.py        # Command-line interface
```

## Syntax Examples

### Ds (Lisp-like) Syntax

```
(binary -> (`P -> `Q) `P)
----------
`Q
```

### Dsp (Traditional) Syntax

```
(`P -> `Q), `P -> `Q
```

## JavaScript Usage

### Building

```bash
npm run ds       # Generate Ds.g4 parser
npm run dsp      # Generate Dsp.g4 parser  
npm run prepare  # Generate both parsers (runs ds + dsp in parallel)
```

### API

```javascript
import { unparse, parse } from 'atsds-bnf';

// Convert Ds to Dsp
const dsp = unparse('(binary -> a b)');
console.log(dsp); // "(a -> b)"

// Convert Dsp to Ds
const ds = parse('a -> b');
console.log(ds); // "(binary -> a b)"
```

## Python Usage

### API

```python
from apyds_bnf import unparse, parse

# Convert Ds to Dsp
dsp = unparse('(binary -> a b)')
print(dsp)  # "(a -> b)"

# Convert Dsp to Ds
ds = parse('a -> b')
print(ds)  # "(binary -> a b)"
```

### Command-line Interface

After installation, two CLI commands are available:

```bash
# Unparse: Ds → Dsp
apyds-unparse input.ds > output.dsp
echo "(binary -> a b)" | apyds-unparse

# Parse: Dsp → Ds
apyds-parse input.dsp > output.ds
echo "a -> b" | apyds-parse
```

### Generating Parsers

The Python package automatically generates ANTLR parsers during installation using the custom `setup.py` build command. You can also generate them manually:

```bash
# Using antlr4 command
antlr4 -Dlanguage=Python3 -visitor -no-listener -o apyds_bnf/generated grammars/Ds.g4 grammars/Dsp.g4

# Or using antlr4-tools
python -m antlr4_tools -Dlanguage=Python3 -visitor -no-listener -o apyds_bnf/generated grammars/Ds.g4 grammars/Dsp.g4
```

## Grammar Details

### Ds Grammar (Lisp-like)

- **Rules**: Premises and conclusion separated by `----------`
- **Terms**:
  - Symbols: `a`, `X`, `foo`
  - Subscript: `(subscript base index1 index2)`
  - Function: `(function name arg1 arg2)`
  - Unary: `(unary op operand)`
  - Binary: `(binary op left right)`

### Dsp Grammar (Traditional)

- **Rules**: Premises separated by `,`, arrow `->` before conclusion
- **Terms**:
  - Symbols: `a`, `X`, `foo`
  - Parentheses: `(expr)`
  - Subscript: `base[index1, index2]`
  - Function: `name(arg1, arg2)`
  - Unary: `op operand` (e.g., `! x`, `- y`)
  - Binary infix operators with precedence

## Development

This package follows the mono repo layout and is designed to be self-contained within the `bnf` directory.

### Prerequisites

- **JavaScript**: Node.js 20+, ANTLR4 CLI
- **Python**: Python 3.10+, antlr4-tools or ANTLR4 CLI

### Installing ANTLR4

```bash
# For JavaScript development
npm install -g antlr4

# For Python development
pip install antlr4-tools

# Or download from https://www.antlr.org/download.html
```

## License

This package is part of the DS project and is licensed under AGPL-3.0-or-later.

## Author

Hao Zhang <hzhangxyz@outlook.com>
