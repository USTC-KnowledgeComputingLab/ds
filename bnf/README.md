# BNF Support Package for DS

This package provides bidirectional conversion between two syntax formats for the DS deductive system:

- **Ds**: The lisp-like syntax currently used in DS
- **Dsp**: A traditional readable syntax with infix operators

## Installation

### JavaScript

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
├── package.json       # JavaScript package (atsds-bnf)
├── pyproject.toml     # Python package (apyds-bnf)
├── setup.py           # Python setup with ANTLR generation
├── grammars/          # ANTLR grammar files
│   ├── Ds.g4         # Grammar for lisp-like syntax
│   └── Dsp.g4        # Grammar for traditional syntax
├── atsds_bnf/        # JavaScript source files
│   ├── index.js
│   ├── unparse.js    # Ds → Dsp conversion
│   └── parse.js      # Dsp → Ds conversion
└── apyds_bnf/        # Python package
    ├── __init__.py
    ├── unparse.py    # Ds → Dsp conversion
    └── parse.py      # Dsp → Ds conversion
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

This grammar defines the current lisp-like syntax used in DS:

- **Rules**: Premises and conclusion separated by `----------` (RULE token)
- **Terms**: All operations are prefix notation with explicit type markers
  - Symbols: `a`, `X`, `foo`
  - Subscript: `(subscript base index1 index2)`
  - Function: `(function name arg1 arg2)`
  - Unary: `(unary op operand)`
  - Binary: `(binary op left right)`

### Dsp Grammar (Traditional)

This grammar defines a more traditional syntax with infix operators:

- **Rules**: Premises separated by commas, `->` before conclusion
- **Terms**: Standard infix notation with operator precedence
  - Symbols: `a`, `X`, `foo`
  - Parentheses: `(expr)`
  - Subscript: `base[index1, index2]`
  - Function: `name(arg1, arg2)`
  - Unary: `op operand` (e.g., `! x`, `- y`)
  - Binary: `left op right` with full precedence hierarchy

### Grammar Design Trade-offs

**Rule Ambiguity**: The Dsp rule grammar allows `(term (',' term)*)? '->' term` which permits zero terms before the arrow. This design matches the specification from the issue and allows flexibility in rule definition.

**SYMBOL Token**: The SYMBOL token is defined as `~[ \t\r\n,()]+` which is intentionally permissive to allow a wide variety of symbols. The lexer resolves potential ambiguities through maximal munch rule, token definition order, and keyword precedence. This design maintains compatibility with the DS system's existing symbol naming conventions.

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
