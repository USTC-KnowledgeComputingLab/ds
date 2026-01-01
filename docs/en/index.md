---
layout: home

hero:
  name: "DS"
  text: "A Deductive System"
  tagline: A deductive system for logical inference, implemented in C++ with bindings for Python and TypeScript/JavaScript
  actions:
    - theme: brand
      text: Quick Start
      link: /en/getting-started/quickstart
    - theme: alt
      text: View on GitHub
      link: https://github.com/USTC-KnowledgeComputingLab/ds

features:
  - title: Multi-Language Support
    details: Seamlessly use the same deductive system in C++, Python, or TypeScript/JavaScript.
  - title: WebAssembly Performance
    details: Run high-performance deductive system in the browser or Node.js via Emscripten.
  - title: Rich Logical Terms
    details: Comprehensive support for variables, items, and nested lists.
  - title: Rule-Based Inference
    details: Flexible framework for defining rules and facts to perform complex logical deduction.
  - title: Unification Engine
    details: Powerful built-in mechanisms for term unification and rule matching.
  - title: Automated Search
    details: Built-in search engine for iterative inference.
---

## Supported Languages

::: code-group
```typescript [TypeScript]
import { Term } from "atsds";

const term = new Term("(hello world)");
console.log(term.toString());
// Output: (hello world)
```
```python [Python]
import apyds

term = apyds.Term("(hello world)")
print(term)  # (hello world)
```
```cpp [C++]
#include <ds/ds.hh>
#include <ds/utility.hh>
#include <iostream>

int main() {
    auto term = ds::text_to_term("(hello world)", 1000);
    std::cout << ds::term_to_text(term.get(), 1000).get() << std::endl;
    return 0;
}
```
:::

## Quick Links

- **[Installation](getting-started/installation.md)** - Install DS for your preferred language
- **[Quick Start](getting-started/quickstart.md)** - Get up and running in minutes
- **[Core Concepts](concepts/terms.md)** - Learn about terms, rules, and inference
- **[API Reference](api/typescript.md)** - Complete API documentation
- **[Examples](examples/basic.md)** - Working code examples

## License

This project is licensed under the GNU General Public License v3.0 or later.
