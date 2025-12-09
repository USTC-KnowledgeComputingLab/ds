# BNF Support Package for DS

A bidirectional conversion library for the DS deductive system, providing seamless translation between two syntax formats:

- **Ds**: The S-expression (lisp-like) syntax used internally by DS
- **Dsp**: A traditional, human-readable syntax with infix operators

This package enables you to write logical rules in a more natural, mathematical notation and convert them to the DS internal format, or vice versa.

## Features

- **Bidirectional Conversion**: Convert between Ds and Dsp syntax formats
- **Multi-Language Support**: Available for both Python and JavaScript/TypeScript
- **Parse**: Convert from readable Dsp syntax to DS internal format
- **Unparse**: Convert from DS internal format to readable Dsp syntax
- **Comprehensive Operator Support**: Functions, subscripts, unary and binary operators
- **ANTLR-Based**: Built on ANTLR 4.13.2 for robust parsing

## Installation

### Python (pip)

```bash
pip install apyds-bnf
```

Requires Python 3.10-3.14.

### JavaScript/TypeScript (npm)

```bash
npm install atsds-bnf
```

## Quick Start

### Python Example

```python
from apyds_bnf import parse, unparse

# Parse: Convert from readable Dsp to DS format
dsp_input = "a, b -> c"
ds_output = parse(dsp_input)
print(ds_output)
# Output:
# a
# b
# ----
# c

# Unparse: Convert from DS format to readable Dsp
ds_input = "a\nb\n----\nc"
dsp_output = unparse(ds_input)
print(dsp_output)
# Output: a, b -> c
```

### JavaScript Example

```javascript
import { parse, unparse } from "atsds-bnf";

// Parse: Convert from readable Dsp to DS format
const dsp_input = "a, b -> c";
const ds_output = parse(dsp_input);
console.log(ds_output);
// Output:
// a
// b
// ----
// c

// Unparse: Convert from DS format to readable Dsp
const ds_input = "a\nb\n----\nc";
const dsp_output = unparse(ds_input);
console.log(dsp_output);
// Output: a, b -> c
```

## Syntax Formats

### Ds Format (Internal)

The Ds format uses S-expressions (lisp-like syntax) for representing logical rules:

```
premise1
premise2
----------
conclusion
```

For structured terms:
- Functions: `(function f a b)`
- Subscripts: `(subscript a i j)`
- Binary operators: `(binary + a b)`
- Unary operators: `(unary ~ a)`

### Dsp Format (Human-Readable)

The Dsp format uses traditional mathematical notation:

```
premise1, premise2 -> conclusion
```

For structured terms:
- Functions: `f(a, b)`
- Subscripts: `a[i, j]`
- Binary operators: `(a + b)` (parenthesized)
- Unary operators: `(~ a)` (parenthesized)

### Syntax Comparison Table

| Description | Dsp Format (parse input / unparse output) | Ds Format |
|-------------|-------------------|-------------------|
| Simple rule | `a, b -> c` | `a\nb\n----\nc` |
| Axiom (parse input) | `a` | `----\na` |
| Axiom (unparse output) | ` -> a` | `----\na` |
| Function call | `f(a, b) -> c` | `(function f a b)\n----------------\nc` |
| Subscript | `a[i, j] -> b` | `(subscript a i j)\n-----------------\nb` |
| Binary operator | `(a + b) -> c` | `(binary + a b)\n--------------\nc` |
| Unary operator (parse input) | `~ a -> b` | `(unary ~ a)\n-----------\nb` |
| Unary operator (unparse output) | `(~ a) -> b` | `(unary ~ a)\n-----------\nb` |
| Complex expression | `((a + b) * c), d[i] -> f(g, h)` | `(binary * (binary + a b) c)\n(subscript d i)\n---------------------------\n(function f g h)` |

## API Reference

### Python

#### `parse(dsp_text: str) -> str`

Converts Dsp syntax to Ds syntax.

**Parameters:**
- `dsp_text`: String in Dsp format (human-readable syntax)

**Returns:**
- String in Ds format (S-expression syntax)

**Example:**
```python
from apyds_bnf import parse

result = parse("a, b -> c")
# Returns: "a\nb\n----\nc"
```

#### `unparse(ds_text: str) -> str`

Converts Ds syntax to Dsp syntax.

**Parameters:**
- `ds_text`: String in Ds format (S-expression syntax)

**Returns:**
- String in Dsp format (human-readable syntax)

**Example:**
```python
from apyds_bnf import unparse

result = unparse("a\nb\n----\nc")
# Returns: "a, b -> c"
```

### JavaScript

#### `parse(dspText: string): string`

Converts Dsp syntax to Ds syntax.

**Parameters:**
- `dspText`: String in Dsp format (human-readable syntax)

**Returns:**
- String in Ds format (S-expression syntax)

**Example:**
```javascript
import { parse } from "atsds-bnf";

const result = parse("a, b -> c");
// Returns: "a\nb\n----\nc"
```

#### `unparse(dsText: string): string`

Converts Ds syntax to Dsp syntax.

**Parameters:**
- `dsText`: String in Ds format (S-expression syntax)

**Returns:**
- String in Dsp format (human-readable syntax)

**Example:**
```javascript
import { unparse } from "atsds-bnf";

const result = unparse("a\nb\n----\nc");
// Returns: "a, b -> c"
```

## Examples

### Parsing Complex Expressions

```python
from apyds_bnf import parse

# Parse a complex expression with nested operators
dsp = "(a + b) * c, d[i] -> f(g, h)"
ds = parse(dsp)
print(ds)
# Output:
# (binary * (binary + a b) c)
# (subscript d i)
# ---------------------------
# (function f g h)
```

### Unparsing Multiple Rules

```python
from apyds_bnf import unparse

# Unparse multiple rules
ds = "a\n----\nb\n\nc\n----\nd"
dsp = unparse(ds)
print(dsp)
# Output: a -> b
#         c -> d
```

### Round-trip Conversion

```python
from apyds_bnf import parse, unparse

# Original Dsp format
original = "a, b -> c"

# Convert to Ds and back to Dsp
ds_format = parse(original)
result = unparse(ds_format)

assert result == original  # True
```

## Building from Source

### Prerequisites

- Python 3.10-3.14 (for Python package)
- Node.js (for JavaScript package)
- Java (for ANTLR parser generation)
- ANTLR 4.13.2

### Python Package

```bash
cd bnf

# Install dependencies
uv sync --extra dev

# Generate ANTLR parsers (done automatically during build)
# Build package
uv build

# Run tests
pytest

# Run with coverage
pytest --cov
```

### JavaScript Package

```bash
cd bnf

# Install dependencies
npm install

# Generate ANTLR parsers and build
npm run build

# Run tests
npm test
```

## Testing

The package includes comprehensive tests for both Python and JavaScript implementations.

### Python Tests

Located in `tests/test_parse_unparse.py`:

```bash
cd bnf
pytest
```

Tests cover:
- Simple rules with premises and conclusions
- Axioms (rules with no premises)
- Function calls
- Subscript notation
- Binary and unary operators
- Multiple rules
- Complex nested expressions
- Round-trip conversions

### JavaScript Tests

Located in `tests/test_parse_unparse.mjs`:

```bash
cd bnf
npm test
```

Same test coverage as Python implementation.

## Grammar Files

The conversion is based on ANTLR grammars:

- **Ds.g4**: Grammar for the Ds format (S-expression syntax)
- **Dsp.g4**: Grammar for the Dsp format (human-readable syntax)

These grammars are used to generate parsers for both Python and JavaScript.

## Development

### Generating ANTLR Parsers

For Python:
```bash
java -jar antlr-4.13.2-complete.jar -Dlanguage=Python3 Ds.g4 -visitor -no-listener -o apyds_bnf
java -jar antlr-4.13.2-complete.jar -Dlanguage=Python3 Dsp.g4 -visitor -no-listener -o apyds_bnf
```

For JavaScript:
```bash
antlr4 -Dlanguage=JavaScript Ds.g4 -visitor -no-listener -o atsds_bnf
antlr4 -Dlanguage=JavaScript Dsp.g4 -visitor -no-listener -o atsds_bnf
```

### Code Formatting

- Python: Uses `ruff` for linting and formatting (configured in `pyproject.toml`)
- JavaScript: Standard npm formatting tools

## License

This project is licensed under the GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later).

## Repository

- **GitHub**: [USTC-KnowledgeComputingLab/ds](https://github.com/USTC-KnowledgeComputingLab/ds) (in `/bnf` directory)
- **Python Package**: [apyds-bnf](https://pypi.org/project/apyds-bnf/)
- **npm Package**: [atsds-bnf](https://www.npmjs.com/package/atsds-bnf)

## Author

Hao Zhang <hzhangxyz@outlook.com>

## Related

This package is a support library for the [DS (Deductive System)](https://github.com/USTC-KnowledgeComputingLab/ds) project. For the main DS library with C++ core and bindings, see the [main repository](https://github.com/USTC-KnowledgeComputingLab/ds).
