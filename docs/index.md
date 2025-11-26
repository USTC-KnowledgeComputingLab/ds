# DS - A Deductive System

A deductive system for logical inference, implemented in C++. The library provides bindings for Python (via pybind11) and TypeScript/JavaScript (via Emscripten/WebAssembly).

## Features

- **Multi-Language Support**: Use the same deductive system in C++, Python, or TypeScript/JavaScript
- **Logical Terms**: Work with variables, items (constants/functors), and lists
- **Rule-Based Inference**: Define rules and facts, perform logical deduction
- **Unification and Matching**: Unify terms and match rules
- **Search Engine**: Built-in search mechanism for iterative inference
- **WebAssembly**: Run inference in the browser or Node.js environments
- **Type-Safe**: Strong typing support in TypeScript and Python

## Quick Links

- **[Installation](getting-started/installation.md)** - Install DS for your preferred language
- **[Quick Start](getting-started/quickstart.md)** - Get up and running in minutes
- **[Core Concepts](concepts/terms.md)** - Learn about terms, rules, and inference
- **[API Reference](api/python.md)** - Complete API documentation
- **[Examples](examples/basic.md)** - Working code examples

## What is a Deductive System?

A deductive system is a formal framework for deriving conclusions from a set of premises using inference rules. DS implements a forward-chaining inference engine that:

1. **Stores knowledge** as rules and facts
2. **Applies rules** to derive new facts through pattern matching
3. **Continues inference** until a target is found or no new facts can be derived

This is useful for:

- **Theorem proving**: Automatically proving logical statements
- **Knowledge reasoning**: Deriving implicit facts from explicit knowledge
- **Expert systems**: Building rule-based decision systems
- **Educational tools**: Learning about formal logic and inference

## Supported Languages

=== "Python"

    ```python
    import apyds

    search = apyds.Search(1000, 10000)
    search.add("(`P -> `Q) `P `Q")  # Modus ponens
    search.add("(! (! X))")  # Premise: !!X

    target = apyds.Rule("X")
    
    # Search until target is found
    while True:
        found = False
        def callback(candidate):
            nonlocal found
            if candidate == target:
                print(f"Found: {candidate}")
                found = True
                return True
            return False
        search.execute(callback)
        if found:
            break
    ```

=== "TypeScript"

    ```typescript
    import { rule_t, search_t } from "atsds";

    const search = new search_t(1000, 10000);
    search.add("(`P -> `Q) `P `Q");  // Modus ponens
    search.add("(! (! X))");  // Premise: !!X

    const target = new rule_t("X");
    
    // Search until target is found
    while (true) {
        let found = false;
        search.execute((candidate) => {
            if (candidate.key() === target.key()) {
                console.log(`Found: ${candidate.toString()}`);
                found = true;
                return true;
            }
            return false;
        });
        if (found) break;
    }
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/search.hh>
    #include <ds/utility.hh>
    #include <cstring>

    int main() {
        ds::search_t search(1000, 10000);
        search.add("(`P -> `Q) `P `Q");  // Modus ponens
        search.add("(! (! X))");  // Premise: !!X

        auto target = ds::text_to_rule("X", 1000);
        
        while (true) {
            bool found = false;
            search.execute([&](ds::rule_t* candidate) {
                // Compare binary representations for equality
                if (candidate->data_size() == target->data_size() &&
                    memcmp(candidate->head(), target->head(), 
                           candidate->data_size()) == 0) {
                    printf("Found!\n");
                    found = true;
                    return true;
                }
                return false;
            });
            if (found) break;
        }
        return 0;
    }
    ```

## Getting Started

1. **Install** the package for your language: [Installation Guide](getting-started/installation.md)
2. **Learn** the basics: [Quick Start](getting-started/quickstart.md)
3. **Understand** the concepts: [Terms](concepts/terms.md), [Rules](concepts/rules.md), [Search](concepts/search.md)
4. **Explore** examples: [Basic Examples](examples/basic.md), [Sudoku Solver](examples/sudoku.md)

## License

This project is licensed under the GNU General Public License v3.0 or later.
