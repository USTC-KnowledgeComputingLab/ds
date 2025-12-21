# apyds-egg

E-graph implementation for equality saturation in the deductive system.

## Overview

This package provides a Python implementation of E-graphs (Equivalence Graphs), which are data structures used for efficiently representing and manipulating equivalence classes of expressions. E-graphs are particularly useful in equality saturation and program optimization.

## Installation

```bash
pip install apyds-egg
```

## Usage

```python
from apyds_egg import EGraph, ENode

# Create an E-graph
eg = EGraph()

# Add nodes
x = eg.add(ENode("x", ()))
a = eg.add(ENode("a", ()))
b = eg.add(ENode("b", ()))

# Add expressions
ax = eg.add(ENode("+", (a, x)))
bx = eg.add(ENode("+", (b, x)))

# Assert equality
eg.merge(a, b)
eg.rebuild()
```

## Features

- Efficient union-find data structure for equivalence class management
- Deferred congruence closure with rebuilding
- Support for custom operations and node types
