# Installation

DS can be installed for Python, TypeScript/JavaScript, or used directly as a C++ library.

## Python

The Python package `apyds` wraps the C++ core via pybind11.

```bash
pip install apyds
```

**Requirements:**

- Python 3.10-3.14
- Pre-built wheels are available for common platforms

### Development Installation

To install from source with development dependencies:

```bash
git clone https://github.com/USTC-KnowledgeComputingLab/ds.git
cd ds
pip install -e ".[dev]"
```

## TypeScript/JavaScript

The TypeScript/JavaScript package `atsds` wraps the C++ core via WebAssembly.

```bash
npm install atsds
```

The package includes:

- WebAssembly binaries (`.wasm`)
- TypeScript type definitions (`.d.mts`)
- ES module support

### Requirements

- Node.js 16+ or a modern browser with WebAssembly support

## C++

The C++ library is the core implementation. Both Python and TypeScript bindings are built on top of it.

### Prerequisites

- C++20 compatible compiler (GCC 10+, Clang 10+, MSVC 2019+)
- CMake 3.30+

### Building from Source

```bash
git clone https://github.com/USTC-KnowledgeComputingLab/ds.git
cd ds
cmake -B build
cmake --build build
```

### Using in Your Project

Include the headers from `include/ds/` in your C++ project:

```cpp
#include <ds/ds.hh>
#include <ds/search.hh>
```

Link against the `ds` static library produced by the build.

## Building All Components

To build all language bindings from source:

### TypeScript/JavaScript (requires Emscripten)

```bash
# Install Emscripten SDK first
# https://emscripten.org/docs/getting_started/downloads.html

npm install
npm run build
```

### Python

```bash
pip install -e ".[dev]"
```

### C++

```bash
cmake -B build
cmake --build build
```

## Verifying Installation

=== "Python"

    ```python
    import apyds
    print(apyds.__version__)
    
    # Create a simple term
    term = apyds.Term("(hello world)")
    print(term)
    ```

=== "TypeScript"

    ```typescript
    import { term_t } from "atsds";
    
    const term = new term_t("(hello world)");
    console.log(term.toString());
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/utility.hh>
    #include <iostream>
    
    int main() {
        auto term = ds::text_to_term("(hello world)", 1000);
        std::cout << ds::term_to_text(term.get(), 1000).get() << std::endl;
        return 0;
    }
    ```
