# E-Graph Support Package for DS

An E-Graph (Equality Graph) implementation for the DS deductive system, providing efficient management and manipulation of equivalence classes of terms.

This package implements the egg-style E-Graph data structure with deferred congruence closure, enabling efficient equality reasoning and term rewriting.

## Features

- **E-Graph Data Structure**: Manage equivalence classes of terms efficiently
- **Union-Find**: Path-compressed union-find for disjoint set management
- **Congruence Closure**: Automatic maintenance of congruence relationships
- **Deferred Rebuilding**: egg-style deferred rebuilding for performance
- **Python Integration**: Seamless integration with apyds terms
- **Type-Safe**: Full type hints for Python 3.11+

## Installation

### Python (pip)

```bash
pip install apyds-egg
```

Requires Python 3.11-3.14.

## Quick Start

### Python Example

```python
import apyds
from apyds_egg import EGraph

# Create an E-Graph
eg = EGraph()

# Add terms to the E-Graph
a = eg.add(apyds.Term("a"))
b = eg.add(apyds.Term("b"))
x = eg.add(apyds.Term("x"))

# Add compound terms
ax = eg.add(apyds.Term("(+ a x)"))
bx = eg.add(apyds.Term("(+ b x)"))

# Initially, (+ a x) and (+ b x) are in different E-classes
assert eg.find(ax) != eg.find(bx)

# Merge a and b
eg.merge(a, b)

# Rebuild to restore congruence
eg.rebuild()

# Now (+ a x) and (+ b x) are in the same E-class
assert eg.find(ax) == eg.find(bx)
```

## Core Concepts

### E-Graph

An E-Graph is a data structure that efficiently represents and maintains equivalence classes of terms. It consists of:

- **E-Nodes**: Nodes representing terms with an operator and children
- **E-classes**: Equivalence classes of E-Nodes
- **Union-Find**: Data structure for managing E-class equivalence
- **Congruence**: Two terms are congruent if they have the same operator and their children are in equivalent E-classes

### Union-Find

The Union-Find data structure manages disjoint sets with path compression:

```python
from apyds_egg import UnionFind, EClassId

uf = UnionFind()
a = EClassId(0)
b = EClassId(1)

# Find canonical representative
assert uf.find(a) == a

# Union two sets
uf.union(a, b)
assert uf.find(a) == uf.find(b)
```

### E-Nodes

E-Nodes represent terms in the E-Graph:

```python
from apyds_egg import ENode, EClassId

# Create an E-Node for the term (+ a b)
a_id = EClassId(0)
b_id = EClassId(1)
node = ENode("+", (a_id, b_id))
```

### Congruence Closure

The E-Graph maintains congruence closure automatically. When two E-classes are merged, the E-Graph rebuilds to ensure that congruent terms remain in the same E-class:

```python
eg = EGraph()

# Add terms
fa = eg.add(apyds.Term("(f a)"))
fb = eg.add(apyds.Term("(f b)"))

# Merge a and b
a = eg.add(apyds.Term("a"))
b = eg.add(apyds.Term("b"))
eg.merge(a, b)

# Rebuild maintains congruence
eg.rebuild()

# Now (f a) and (f b) are equivalent
assert eg.find(fa) == eg.find(fb)
```

## API Overview

### EGraph

- `__init__()`: Create a new E-Graph
- `add(term: apyds.Term) -> EClassId`: Add a term to the E-Graph
- `merge(a: EClassId, b: EClassId) -> EClassId`: Merge two E-classes
- `rebuild() -> None`: Restore congruence closure
- `find(eclass: EClassId) -> EClassId`: Find canonical E-class representative

### UnionFind

- `__init__()`: Create a new Union-Find structure
- `find(x: T) -> T`: Find canonical representative with path compression
- `union(a: T, b: T) -> T`: Union two sets

### ENode

- `op: str`: The operator of the term
- `children: tuple[EClassId, ...]`: The children E-class IDs
- `canonicalize(find: Callable) -> ENode`: Canonicalize children

### EClassId

- Type alias for `int` representing E-class identifiers

## Building from Source

### Prerequisites

- Python 3.11-3.14
- apyds package

### Python Package

```bash
cd egg

# Install dependencies
uv sync --extra dev

# Build package
uv build

# Run tests
pytest

# Run with coverage
pytest --cov
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=apyds_egg

# Run specific test
pytest tests/test_egraph.py::test_egraph_congruence
```

## License

This project is licensed under the GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later).

## Repository

- **GitHub**: [USTC-KnowledgeComputingLab/ds](https://github.com/USTC-KnowledgeComputingLab/ds)
- **Python Package**: [apyds-egg](https://pypi.org/project/apyds-egg/)

## Author

Hao Zhang <hzhangxyz@outlook.com>

## Related

This package is a support library for the [DS (Deductive System)](https://github.com/USTC-KnowledgeComputingLab/ds) project. For the main DS library with C++ core and bindings, see the [main repository](https://github.com/USTC-KnowledgeComputingLab/ds).
