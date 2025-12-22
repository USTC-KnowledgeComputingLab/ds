# E-Graph Support Package

The E-Graph support package provides efficient management and manipulation of equivalence classes of terms for the DS deductive system.

An E-Graph (Equality Graph) is a data structure that efficiently represents equivalence classes of terms and automatically maintains congruence closure. This implementation follows the egg-style approach with deferred rebuilding for optimal performance.

## Installation

### Python

```bash
pip install apyds-egg
```

Requires Python 3.11-3.14.

## Usage

### Basic Example

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

### Congruence Closure

The E-Graph automatically maintains congruence closure. When two E-Classes are merged, the `rebuild()` method ensures that all congruent terms remain in the same E-Class:

```python
eg = EGraph()

# Add terms with nested structure
fa = eg.add(apyds.Term("(f a)"))
fb = eg.add(apyds.Term("(f b)"))
gfa = eg.add(apyds.Term("(g (f a))"))
gfb = eg.add(apyds.Term("(g (f b))"))

# Merge a and b
a = eg.add(apyds.Term("a"))
b = eg.add(apyds.Term("b"))
eg.merge(a, b)

# Rebuild propagates equivalence
eg.rebuild()

# Now all derived terms are equivalent
assert eg.find(fa) == eg.find(fb)
assert eg.find(gfa) == eg.find(gfb)
```

### Union-Find Example

The package also exports the Union-Find data structure used internally:

```python
from apyds_egg import UnionFind, EClassId

uf = UnionFind()
a = EClassId(0)
b = EClassId(1)
c = EClassId(2)

# Find returns canonical representative
assert uf.find(a) == a

# Union merges sets
uf.union(a, b)
assert uf.find(a) == uf.find(b)

# Path compression for efficiency
uf.union(b, c)
assert uf.find(a) == uf.find(c)
```

## Core Concepts

### E-Graph Structure

An E-Graph consists of several key components:

- **E-Nodes**: Represent terms with an operator and children
- **E-Classes**: Equivalence classes of E-Nodes
- **Hash-consing (Hashcons)**: Ensures uniqueness of E-Nodes by mapping identical nodes to the same E-Class
- **Union-Find**: Manages E-Class equivalence relationships
- **Parents**: Tracks which terms depend on each E-Class
- **Worklist**: Manages deferred congruence rebuilding

### Deferred Rebuilding

The implementation uses egg-style deferred rebuilding:

1. **Merge**: Combine two E-Classes and add to worklist
2. **Rebuild**: Process worklist to restore congruence
3. **Repair**: Re-canonicalize parent nodes and merge congruent ones

This approach provides better performance than immediate rebuilding by batching congruence updates.

### Adding Terms

Terms are converted to E-Nodes and added to the E-Graph:

- **Items (constants/functors) and Variables**: Atomic terms like `a`, `b`, or `` `x`` are represented as E-Nodes with no children
- **Lists**: Compound terms like `(+ a b)` are represented as E-Nodes with operator `"()"` and children for each list element

The hash-consing mechanism ensures that identical E-Nodes share the same E-Class ID.

## API Reference

### EGraph

Main class for E-Graph operations:

- `__init__()`: Create a new empty E-Graph
- `add(term: apyds.Term) -> EClassId`: Add a term and return its E-Class ID
- `merge(a: EClassId, b: EClassId) -> EClassId`: Merge two E-Classes
- `rebuild() -> None`: Restore congruence closure by processing the worklist
- `find(eclass: EClassId) -> EClassId`: Find the canonical E-Class representative

### UnionFind[T]

Generic Union-Find data structure:

- `__init__()`: Create a new Union-Find structure
- `find(x: T) -> T`: Find canonical representative with path compression
- `union(a: T, b: T) -> T`: Union two sets and return the representative

### ENode

Immutable node in the E-Graph:

- `op: str`: The operator/functor of the term
- `children: tuple[EClassId, ...]`: Tuple of child E-Class IDs
- `canonicalize(find: Callable[[EClassId], EClassId]) -> ENode`: Create a new E-Node with canonicalized children

### EClassId

Type alias for `int` representing E-Class identifiers.

## Package Information

- **Python Package**: [apyds-egg](https://pypi.org/project/apyds-egg/)
- **Source Code**: [GitHub - egg directory](https://github.com/USTC-KnowledgeComputingLab/ds/tree/main/egg)
