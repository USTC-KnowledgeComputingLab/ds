# DS - A Deductive System

A deductive system for logical inference, implemented in C++ with bindings for Python and TypeScript/JavaScript. The core library is written in C++, with Python bindings via pybind11 and TypeScript/JavaScript bindings via Emscripten (WebAssembly).

## Architecture

- **C++ Core**: The core implementation in `src/` and `include/ds/` provides the fundamental data structures and algorithms
- **Python Bindings**: Built with pybind11, wrapping the C++ core (see `pyds/`)
- **TypeScript/JavaScript Bindings**: Built with Emscripten, compiling C++ to WebAssembly (see `tsds/`)

## Features

- **Multi-Language Support**: Use the same deductive system in C++, Python, or TypeScript/JavaScript
- **Logical Terms**: Work with variables, items (constants/functors), and lists
- **Rule-Based Inference**: Define rules and facts, perform logical deduction
- **Unification and Matching**: Unify terms and match rules
- **Search Engine**: Built-in search mechanism for iterative inference
- **WebAssembly**: Run inference in the browser or Node.js environments
- **Type-Safe**: Strong typing support in TypeScript and Python

## Installation

### TypeScript/JavaScript (npm)

The TypeScript/JavaScript package wraps the C++ core via WebAssembly.

```bash
npm install atsds
```

The package includes WebAssembly binaries and TypeScript type definitions.

### Python (pip)

The Python package wraps the C++ core via pybind11.

```bash
pip install apyds
```

Then import as `pyds`:

```python
import pyds
```

Requires Python 3.10-3.13.

### C++ (Core Library)

The C++ library is the core implementation. Both Python and TypeScript bindings are built on top of it.

```bash
git clone https://github.com/USTC-KnowledgeComputingLab/ds.git
cd ds
cmake -B build
cmake --build build
```

Include the headers from `include/ds/` in your C++ project.

## Quick Start

### TypeScript/JavaScript Example

```typescript
import { rule_t, search_t, buffer_size } from "atsds";

// Set buffer size for internal operations
buffer_size(1000);

// Create a search engine
const search = new search_t(1000, 10000);

// Add logical rules (modus ponens)
search.add("(`P -> `Q) `P `Q");

// Add axioms
search.add("(`p -> (`q -> `p))");

// Add a premise
search.add("(! (! X))");

// Define target
const target = new rule_t("X");

// Execute search
search.execute((candidate) => {
    if (candidate.key() === target.key()) {
        console.log("Found:", candidate.toString());
        return true; // Stop search
    }
    return false; // Continue searching
});
```

### Python Example

```python
import pyds

# Set buffer size for internal operations
pyds.buffer_size(1000)

# Create a search engine
search = pyds.Search(1000, 10000)

# Add logical rules (modus ponens)
search.add("(`P -> `Q) `P `Q")

# Add axioms
search.add("(`p -> (`q -> `p))")

# Add a premise
search.add("(! (! X))")

# Define target
target = pyds.Rule("X")

# Execute search
def callback(candidate):
    if candidate == target:
        print("Found:", candidate)
        return True  # Stop search
    return False  # Continue searching

search.execute(callback)
```

### C++ Example

```cpp
#include <ds/ds.hh>
#include <iostream>

int main() {
    const size_t temp_data_size = 1000;
    const size_t buffer_size = 10000;
    
    ds::search_t search(temp_data_size, buffer_size);
    
    // Add logical rules
    search.add("(`P -> `Q) `P `Q");
    search.add("(`p -> (`q -> `p))");
    search.add("(! (! X))");
    
    // Execute search
    search.execute([](ds::rule_t* candidate) {
        std::cout << "Found rule" << std::endl;
        return false; // Continue searching
    });
    
    return 0;
}
```

## Core Concepts

### Terms

Terms are the basic building blocks of the deductive system:

- **Variables**: Prefixed with backtick, e.g., `` `X``, `` `P``, `` `Q``
- **Items**: Constants or functors, e.g., `a`, `father`, `!`
- **Lists**: Ordered sequences enclosed in parentheses, e.g., `(a b c)`, `(father john mary)`

### Rules

Rules consist of zero or more premises (above the line) and a conclusion (below the line):

```
premise1
premise2
----------
conclusion
```

A fact is a rule without premises:

```
----------
(parent john mary)
```

### Grounding

Grounding substitutes variables with values using a dictionary:

```typescript
const a = new term_t("`a");
const dict = new term_t("((`a b))"); // Substitute `a with b
const result = a.ground(dict);
console.log(result.toString()); // "b"
```

### Matching

Matching unifies two terms or rules to find variable substitutions.

## API Overview

### TypeScript/JavaScript

- `buffer_size(size?: number)`: Get/set buffer size for internal operations
- `string_t`: String wrapper class
- `variable_t`: Logical variable class
- `item_t`: Item (constant/functor) class
- `list_t`: List class
- `term_t`: General term class (variable, item, or list)
- `rule_t`: Logical rule class
- `search_t`: Search engine for inference

### Python

- `buffer_size(size: int)`: Set buffer size
- `scoped_buffer_size(size: int)`: Context manager for temporary buffer size
- `String`: String wrapper class
- `Variable`: Logical variable class
- `Item`: Item (constant/functor) class
- `List`: List class
- `Term`: General term class
- `Rule`: Logical rule class
- `Search`: Search engine for inference

### C++ (Core)

All classes are in the `ds` namespace:

- `string_t`: String handling
- `variable_t`: Logical variables
- `item_t`: Items (constants/functors)
- `list_t`: Lists
- `term_t`: General terms
- `rule_t`: Logical rules
- `search_t`: Search engine (in `<ds/search.hh>`)

See header files in `include/ds/` for detailed API documentation.

## Building from Source

### Prerequisites

- C++20 compatible compiler
- CMake 3.15+
- For TypeScript: Emscripten SDK
- For Python: Python 3.10-3.13, scikit-build-core, pybind11

### Build All Components

```bash
# Clone repository
git clone https://github.com/USTC-KnowledgeComputingLab/ds.git
cd ds

# Build C++ library
cmake -B build
cmake --build build

# Build TypeScript/JavaScript (requires Emscripten)
npm install
npm run build

# Build Python package
pip install -e ".[dev]"
```

### Running Tests

```bash
# TypeScript/JavaScript tests
npm test

# Python tests
pytest

# C++ tests (if available)
cd build && ctest
```

## Examples

Example programs are provided in the `examples/` directory:

- `examples/main.mjs`: TypeScript/JavaScript example
- `examples/main.py`: Python example
- `examples/main.cc`: C++ example

Each example demonstrates logical inference using propositional logic axioms.

## Development

### Code Formatting

The project uses code formatting tools for consistency:

- C++: clang-format (`.clang-format` config provided)
- Python: ruff (configured in `pyproject.toml`)
- TypeScript: Biome (configured in `biome.json`)

### Pre-commit Hooks

Pre-commit hooks are configured in `.pre-commit-config.yaml`.

## License

This project is licensed under the GNU General Public License v3.0 or later. See [LICENSE.md](LICENSE.md) for details.

## Repository

- **GitHub**: [USTC-KnowledgeComputingLab/ds](https://github.com/USTC-KnowledgeComputingLab/ds)
- **npm package**: [atsds](https://www.npmjs.com/package/atsds)
- **PyPI package**: [apyds](https://pypi.org/project/apyds/)

## Author

Hao Zhang <hzhangxyz@outlook.com>

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

