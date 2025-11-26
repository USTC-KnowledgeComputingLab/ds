# Basic Examples

This section contains examples demonstrating the DS deductive system in various languages.

## Propositional Logic Inference

The classic example demonstrates double negation elimination using propositional logic axioms:

- **Modus Ponens**: If P implies Q, and P is true, then Q is true
- **Axiom 1**: P → (Q → P)
- **Axiom 2**: (P → (Q → R)) → ((P → Q) → (P → R))
- **Axiom 3**: (¬P → ¬Q) → (Q → P)

Given the premise ¬¬X (double negation of X), we can derive X.

### How It Works

1. The search engine starts with the axiom schemas and modus ponens rule
2. Each `execute()` call applies matching to derive new facts
3. The engine iteratively discovers intermediate results
4. Eventually, `X` is derived from `!!X`

The proof involves several steps of applying axioms and modus ponens, demonstrating how a simple set of rules can derive complex theorems.

=== "Python"

    ```python
    import apyds

    # Create a search engine
    search = apyds.Search(1000, 10000)

    # Modus ponens: P -> Q, P |- Q
    search.add("(`P -> `Q) `P `Q")
    # Axiom schema 1: p -> (q -> p)
    search.add("(`p -> (`q -> `p))")
    # Axiom schema 2: (p -> (q -> r)) -> ((p -> q) -> (p -> r))
    search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))")
    # Axiom schema 3: (!p -> !q) -> (q -> p)
    search.add("(((! `p) -> (! `q)) -> (`q -> `p))")

    # Premise: !!X
    search.add("(! (! X))")

    # Target: X (double negation elimination)
    target = apyds.Rule("X")

    # Execute search until target is found
    while True:
        found = False
        def callback(candidate):
            nonlocal found
            if candidate == target:
                print("Found:", candidate)
                found = True
                return True  # Stop search
            return False  # Continue searching
        search.execute(callback)
        if found:
            break
    ```

=== "TypeScript"

    ```typescript
    import { rule_t, search_t } from "atsds";

    // Create a search engine
    const search = new search_t(1000, 10000);

    // Modus ponens: P -> Q, P |- Q
    search.add("(`P -> `Q) `P `Q");
    // Axiom schema 1: p -> (q -> p)
    search.add("(`p -> (`q -> `p))");
    // Axiom schema 2: (p -> (q -> r)) -> ((p -> q) -> (p -> r))
    search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))");
    // Axiom schema 3: (!p -> !q) -> (q -> p)
    search.add("(((! `p) -> (! `q)) -> (`q -> `p))");

    // Premise: !!X
    search.add("(! (! X))");

    // Target: X (double negation elimination)
    const target = new rule_t("X");

    // Execute search until target is found
    while (true) {
        let found = false;
        search.execute((candidate) => {
            if (candidate.key() === target.key()) {
                console.log("Found:", candidate.toString());
                found = true;
                return true; // Stop search
            }
            return false; // Continue searching
        });
        if (found) break;
    }
    ```

=== "C++"

    ```cpp
    #include <cstdio>
    #include <cstring>
    #include <ds/ds.hh>
    #include <ds/search.hh>
    #include <ds/utility.hh>

    int main() {
        ds::search_t search(1000, 10000);
        
        // Modus ponens: P -> Q, P |- Q
        search.add("(`P -> `Q) `P `Q");
        // Axiom schema 1: p -> (q -> p)
        search.add("(`p -> (`q -> `p))");
        // Axiom schema 2: (p -> (q -> r)) -> ((p -> q) -> (p -> r))
        search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))");
        // Axiom schema 3: (!p -> !q) -> (q -> p)
        search.add("(((! `p) -> (! `q)) -> (`q -> `p))");
        
        // Premise: !!X
        search.add("(! (! X))");
        
        // Target: X (double negation elimination)
        auto target = ds::text_to_rule("X", 1000);
        
        // Execute search until target is found
        while (true) {
            bool found = false;
            search.execute([&](ds::rule_t* candidate) {
                if (candidate->data_size() == target->data_size() &&
                    memcmp(candidate->head(), target->head(), candidate->data_size()) == 0) {
                    printf("Found: %s", ds::rule_to_text(candidate, 1000).get());
                    found = true;
                    return true; // Stop search
                }
                return false; // Continue searching
            });
            if (found) break;
        }
        
        return 0;
    }
    ```

## Running the Examples

Example files are provided in the repository under `examples/`:

- `examples/main.py` - Python example
- `examples/main.mjs` - TypeScript/JavaScript example
- `examples/main.cc` - C++ example

### Python

```bash
pip install apyds
python examples/main.py
```

### TypeScript/JavaScript

```bash
npm install atsds
node examples/main.mjs
```

### C++

```bash
cmake -B build
cmake --build build
./build/main
```

## Additional Examples

### Simple Chained Inference

This example shows simple chained reasoning:

=== "Python"

    ```python
    import apyds

    search = apyds.Search(1000, 10000)

    # Define chain: a -> b, b -> c, c -> d
    search.add("a b")  # a implies b
    search.add("b c")  # b implies c  
    search.add("c d")  # c implies d
    search.add("a")    # fact: a is true

    # Run until we derive d
    target = apyds.Rule("d")
    
    for iteration in range(10):
        found = False
        def callback(candidate):
            nonlocal found
            print(f"  Derived: {candidate}")
            if candidate == target:
                found = True
                return True
            return False
        
        print(f"Iteration {iteration + 1}:")
        count = search.execute(callback)
        
        if count == 0:
            print("  (no new facts)")
        if found:
            print("Target found!")
            break
    ```

=== "TypeScript"

    ```typescript
    import { rule_t, search_t } from "atsds";

    const search = new search_t(1000, 10000);

    // Define chain: a -> b, b -> c, c -> d
    search.add("a b");
    search.add("b c");
    search.add("c d");
    search.add("a");

    const target = new rule_t("d");

    for (let iteration = 0; iteration < 10; iteration++) {
        let found = false;
        console.log(`Iteration ${iteration + 1}:`);
        
        const count = search.execute((candidate) => {
            console.log(`  Derived: ${candidate.toString()}`);
            if (candidate.key() === target.key()) {
                found = true;
                return true;
            }
            return false;
        });

        if (count === 0) {
            console.log("  (no new facts)");
        }
        if (found) {
            console.log("Target found!");
            break;
        }
    }
    ```

### Working with Variables

This example demonstrates how variables unify during inference:

=== "Python"

    ```python
    import apyds

    search = apyds.Search(1000, 10000)

    # Rule: (double `x) implies (`x `x`)
    # When we have (double a), we derive (a a)
    search.add("(double `x) (`x `x)")

    # Facts
    search.add("(double hello)")
    search.add("(double 42)")

    # See what gets derived
    search.execute(lambda r: print(f"Derived: {r}") or False)
    # Output: (hello hello), (42 42)
    ```

=== "TypeScript"

    ```typescript
    import { search_t } from "atsds";

    const search = new search_t(1000, 10000);

    // Rule: (double `x) implies (`x `x`)
    search.add("(double `x) (`x `x)");

    // Facts
    search.add("(double hello)");
    search.add("(double 42)");

    // See what gets derived
    search.execute((r) => {
        console.log(`Derived: ${r.toString()}`);
        return false;
    });
    ```

### Collecting All Results

Sometimes you want to collect all derived facts:

=== "Python"

    ```python
    import apyds

    search = apyds.Search(1000, 10000)

    # Setup
    search.add("(parent `X `Y) (ancestor `X `Y)")
    search.add("(ancestor `X `Y) (parent `Y `Z) (ancestor `X `Z)")
    search.add("(parent a b)")
    search.add("(parent b c)")
    search.add("(parent c d)")

    # Collect all derived facts
    all_facts = []
    
    for _ in range(10):
        def collect(fact):
            all_facts.append(str(fact).strip())
            return False
        
        if search.execute(collect) == 0:
            break

    print("All derived facts:")
    for fact in sorted(set(all_facts)):
        print(f"  {fact}")
    ```
