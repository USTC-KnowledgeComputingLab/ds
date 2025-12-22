# E-Graph Support Package for apyds

An E-Graph (Equality Graph) implementation for the apyds deductive system, providing efficient equality saturation and term rewriting capabilities.

## Features

- **E-Graph Data Structure**: Efficiently represent equivalence classes of terms
- **Union-Find**: Fast disjoint-set operations for managing equivalence classes
- **Deferred Rebuilding**: egg-style congruence restoration for performance
- **apyds Integration**: Seamless integration with apyds.Term
- **Type-Safe**: Strongly-typed IDs and operations

## Overview

An E-Graph is a data structure that compactly represents a set of terms and their equivalence relations. It's particularly useful for:

- Equality saturation in program optimization
- Term rewriting systems
- Automated theorem proving
- Symbolic computation

This implementation follows the "egg" (e-graphs good) architecture with deferred rebuilding for efficient congruence closure.

## Installation

This package is part of the DS deductive system. Install it as:

```bash
pip install apyds-egg
```

## Usage

```python
import apyds
from apyds_egg import EGraph, ENode

# Create an E-Graph
eg = EGraph()

# Add terms using apyds.Term
x = eg.add(apyds.Term("x"))
a = eg.add(apyds.Term("a"))
b = eg.add(apyds.Term("b"))

# Add compound terms
ax = eg.add(apyds.Term("(+ a x)"))
bx = eg.add(apyds.Term("(+ b x)"))

# Assert equivalence
eg.merge(a, b)
eg.rebuild()

# Check if terms are in the same equivalence class
print(eg.find(ax) == eg.find(bx))  # True
```

## API Reference

### EGraph

The main E-Graph class.

**Methods:**
- `add(term: apyds.Term) -> EClassId`: Add a term and return its equivalence class ID
- `merge(a: EClassId, b: EClassId) -> EClassId`: Merge two equivalence classes
- `find(eclass: EClassId) -> EClassId`: Find the canonical representative of an equivalence class
- `rebuild() -> None`: Restore congruence after merges

### ENode

Represents a node in the E-Graph with an operator and children.

### UnionFind

Implements the union-find (disjoint-set) data structure.

## Implementation Notes

- Items and Variables use their string representation as the operator
- Lists use `"()"` as the operator (which cannot appear in items or variables)
- The implementation maintains hash-consing for efficient node lookup
- Rebuilding is deferred for performance, following the egg approach

## License

AGPL-3.0-or-later
