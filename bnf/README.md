# BNF Support Package for DS

This package provides bidirectional conversion between two syntax formats for the DS deductive system:

- **Ds**: The lisp-like syntax currently used in DS
- **Dsp**: A traditional readable syntax with infix operators

## Structure

```
bnf/
├── grammars/          # ANTLR grammar files
│   ├── Ds.g4         # Grammar for lisp-like syntax
│   └── Dsp.g4        # Grammar for traditional syntax
├── javascript/        # JavaScript/TypeScript implementation
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── unparse.ts  # Ds → Dsp conversion
│       └── parse.ts    # Dsp → Ds conversion
└── python/           # Python implementation
    ├── pyproject.toml
    └── ds_bnf/
        ├── __init__.py
        ├── unparse.py  # Ds → Dsp conversion
        ├── parse.py    # Dsp → Ds conversion
        └── cli.py      # Command-line interface
```

## Syntax Examples

### Ds (Lisp-like) Syntax

```
(binary -> (`P -> `Q) `P)
(binary -> `Q)
----------
(binary -> result)
```

### Dsp (Traditional) Syntax

```
(P -> Q), P -> Q
```

## JavaScript/TypeScript Usage

### Installation

```bash
cd bnf/javascript
npm install
npm run build
```

### API

```javascript
import { unparse, parse } from 'ds-bnf';

// Convert Ds to Dsp
const dsp = unparse('(binary -> a b)');
console.log(dsp); // "(a -> b)"

// Convert Dsp to Ds
const ds = parse('a -> b');
console.log(ds); // "(binary -> a b)"
```

### Building

The build process includes:

1. **Generate parsers**: Run ANTLR4 to generate lexer/parser from grammars
2. **Compile TypeScript**: Transpile TypeScript to JavaScript

```bash
npm run generate  # Generate ANTLR parsers
npm run build     # Full build (generate + compile)
```

## Python Usage

### Installation

```bash
cd bnf/python
pip install -e .
```

Or with development dependencies:

```bash
pip install -e ".[dev]"
```

### API

```python
from ds_bnf import unparse, parse

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
ds-unparse input.ds > output.dsp
echo "(binary -> a b)" | ds-unparse

# Parse: Dsp → Ds
ds-parse input.dsp > output.ds
echo "a -> b" | ds-parse
```

### Generating Parsers

To generate the ANTLR parsers for Python:

```bash
cd bnf/python
antlr4 -Dlanguage=Python3 -visitor -o ds_bnf/generated ../grammars/Ds.g4 ../grammars/Dsp.g4
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
  - Binary infix operators with precedence:
    - `::`, `.`
    - `.*`
    - `*`, `/`, `%`
    - `+`, `-`
    - `<<`, `>>`
    - `<`, `>`, `<=`, `>=`
    - `==`, `!=`
    - `&`, `^`, `|`
    - `&&`, `||`
    - `=`

## Testing

### JavaScript

```bash
cd bnf/javascript
npm test
```

### Python

```bash
cd bnf/python
pytest
```

## Development

This package follows the mono repo layout and is designed to be self-contained within the `bnf` directory. Changes should not affect files outside of this directory.

### Prerequisites

- **JavaScript**: Node.js 20+, ANTLR4 CLI
- **Python**: Python 3.10+, ANTLR4 CLI

### Installing ANTLR4

```bash
# Using pip (for the runtime and CLI)
pip install antlr4-tools

# Or download from https://www.antlr.org/download.html
```

## License

This package is part of the DS project and is licensed under AGPL-3.0-or-later.

## Author

Hao Zhang <hzhangxyz@outlook.com>
