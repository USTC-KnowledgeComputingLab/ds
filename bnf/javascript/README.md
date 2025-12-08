# DS BNF - JavaScript/TypeScript Package

JavaScript/TypeScript implementation of bidirectional conversion between DS syntax formats.

## Installation

```bash
npm install
```

## Building

### Generate ANTLR Parsers

```bash
npm run generate
```

This will generate the lexer and parser from the ANTLR grammars.

### Build TypeScript

```bash
npm run build
```

This will:
1. Generate ANTLR parsers
2. Compile TypeScript to JavaScript

## Usage

```javascript
import { unparse, parse } from 'ds-bnf';

// Convert Ds (lisp-like) to Dsp (traditional)
const dsp = unparse('(binary -> a b)');
console.log(dsp);  // Output: (a -> b)

// Convert Dsp (traditional) to Ds (lisp-like)
const ds = parse('a -> b');
console.log(ds);  // Output: (binary -> a b)
```

## Testing

```bash
npm test
```

## Prerequisites

- Node.js 20+
- ANTLR4 CLI tool

### Installing ANTLR4

```bash
# Using npm
npm install -g antlr4

# Or using pip
pip install antlr4-tools

# Or download from https://www.antlr.org/download.html
```

## License

AGPL-3.0-or-later
