# DS BNF - Python Package

Python implementation of bidirectional conversion between DS syntax formats.

## Installation

```bash
pip install -e .
```

For development:

```bash
pip install -e ".[dev]"
```

## Usage

### As a Library

```python
from ds_bnf import unparse, parse

# Convert Ds (lisp-like) to Dsp (traditional)
dsp = unparse('(binary -> a b)')
print(dsp)  # Output: (a -> b)

# Convert Dsp (traditional) to Ds (lisp-like)
ds = parse('a -> b')
print(ds)  # Output: (binary -> a b)
```

### Command-line Interface

```bash
# Unparse: Ds → Dsp
ds-unparse input.ds > output.dsp
echo "(binary -> a b)" | ds-unparse

# Parse: Dsp → Ds
ds-parse input.dsp > output.ds
echo "a -> b" | ds-parse
```

## Generating Parsers

Before using the package, you need to generate the ANTLR parsers:

```bash
# From the bnf/python directory
antlr4 -Dlanguage=Python3 -visitor -o ds_bnf/generated ../grammars/Ds.g4 ../grammars/Dsp.g4
```

Or use the setup script from the bnf directory:

```bash
cd ..
./setup.sh
```

## Testing

```bash
pytest
```

With coverage:

```bash
pytest --cov=ds_bnf
```

## License

AGPL-3.0-or-later
