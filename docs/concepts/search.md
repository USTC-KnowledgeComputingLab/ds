# Search Engine

The search engine is the core inference mechanism in DS. It manages a knowledge base of rules and facts, and performs logical inference by matching rules with facts.

## Overview

The search engine:

1. Maintains a collection of rules and facts
2. Iteratively applies rules to generate new facts
3. Notifies you of each new inference via a callback
4. Automatically prevents duplicate inferences

!!! info "How It Works"
    The search engine uses a forward-chaining inference approach:
    
    1. When you call `execute()`, the engine tries to match the first premise of each rule with existing facts
    2. When a match is found, variables in the rule are substituted and a new rule (with one fewer premise) is created
    3. If the new rule has no premises, it becomes a new fact
    4. The callback is invoked for each newly derived rule
    5. Duplicate rules are automatically filtered out

## Creating a Search Engine

=== "Python"

    ```python
    import apyds

    # Create with default sizes
    search = apyds.Search()

    # Create with custom sizes
    search = apyds.Search(limit_size=1000, buffer_size=10000)
    ```

=== "TypeScript"

    ```typescript
    import { search_t } from "atsds";

    // Create with default sizes
    const search = new search_t();

    // Create with custom sizes
    const search2 = new search_t(1000, 10000);
    ```

=== "C++"

    ```cpp
    #include <ds/search.hh>

    // Create search engine
    ds::search_t search(1000, 10000);
    ```

### Parameters

- **limit_size**: Maximum size (in bytes) for each stored rule/fact (default: 1000). Rules or facts larger than this are rejected.
- **buffer_size**: Size of the internal buffer for intermediate operations (default: 10000). Increase this if you work with complex rules.

## Adding Rules and Facts

Use the `add()` method to add rules and facts to the knowledge base.

=== "Python"

    ```python
    import apyds

    search = apyds.Search()

    # Add a fact
    search.add("(parent john mary)")

    # Add a rule with premises
    search.add("(father `X `Y)\n----------\n(parent `X `Y)\n")
    ```

=== "TypeScript"

    ```typescript
    import { search_t } from "atsds";

    const search = new search_t();

    // Add a fact
    search.add("(parent john mary)");

    // Add a rule with premises
    search.add("(father `X `Y)\n----------\n(parent `X `Y)\n");
    ```

=== "C++"

    ```cpp
    ds::search_t search(1000, 10000);

    // Add a fact
    search.add("(parent john mary)");

    // Add a rule
    search.add("(father `X `Y)\n----------\n(parent `X `Y)\n");
    ```

## Executing Search

The `execute()` method performs one round of inference. It matches all rules against all facts and generates new conclusions.

=== "Python"

    ```python
    import apyds

    search = apyds.Search()
    search.add("(father `X `Y)\n----------\n(parent `X `Y)\n")
    search.add("(father john mary)")

    def callback(rule):
        print(f"Found: {rule}")
        return False  # Continue searching

    # Execute one round
    count = search.execute(callback)
    print(f"Generated {count} new facts")
    ```

=== "TypeScript"

    ```typescript
    import { search_t } from "atsds";

    const search = new search_t();
    search.add("(father `X `Y)\n----------\n(parent `X `Y)\n");
    search.add("(father john mary)");

    const count = search.execute((rule) => {
        console.log(`Found: ${rule.toString()}`);
        return false;  // Continue searching
    });

    console.log(`Generated ${count} new facts`);
    ```

=== "C++"

    ```cpp
    ds::search_t search(1000, 10000);
    search.add("(father `X `Y)\n----------\n(parent `X `Y)\n");
    search.add("(father john mary)");

    auto count = search.execute([](ds::rule_t* rule) {
        printf("Found: %s\n", ds::rule_to_text(rule, 1000).get());
        return false;  // Continue searching
    });

    printf("Generated %lu new facts\n", count);
    ```

### Callback Function

The callback receives each newly inferred rule and should return:

- `False` (Python) / `false` (TypeScript/C++): Continue searching
- `True` (Python) / `true` (TypeScript/C++): Stop searching

## Searching for a Target

To search until a specific target is found:

=== "Python"

    ```python
    import apyds

    search = apyds.Search(1000, 10000)

    # Set up propositional logic
    search.add("(`P -> `Q) `P `Q")  # Modus ponens
    search.add("(`p -> (`q -> `p))")  # Axiom 1
    search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))")  # Axiom 2
    search.add("(((! `p) -> (! `q)) -> (`q -> `p))")  # Axiom 3
    search.add("(! (! X))")  # Premise

    target = apyds.Rule("X")

    while True:
        found = False
        def check(candidate):
            nonlocal found
            if candidate == target:
                print(f"Found: {candidate}")
                found = True
                return True
            return False
        search.execute(check)
        if found:
            break
    ```

=== "TypeScript"

    ```typescript
    import { rule_t, search_t } from "atsds";

    const search = new search_t(1000, 10000);

    // Set up propositional logic
    search.add("(`P -> `Q) `P `Q");
    search.add("(`p -> (`q -> `p))");
    search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))");
    search.add("(((! `p) -> (! `q)) -> (`q -> `p))");
    search.add("(! (! X))");

    const target = new rule_t("X");

    while (true) {
        let found = false;
        search.execute((candidate) => {
            if (candidate.key() === target.key()) {
                console.log("Found:", candidate.toString());
                found = true;
                return true;
            }
            return false;
        });
        if (found) break;
    }
    ```

## Configuration Methods

### Set Limit Size

Controls the maximum size for each stored rule/fact:

=== "Python"

    ```python
    search.set_limit_size(2000)
    ```

=== "TypeScript"

    ```typescript
    search.set_limit_size(2000);
    ```

=== "C++"

    ```cpp
    search.set_limit_size(2000);
    ```

### Set Buffer Size

Controls the internal buffer size for operations:

=== "Python"

    ```python
    search.set_buffer_size(20000)
    ```

=== "TypeScript"

    ```typescript
    search.set_buffer_size(20000);
    ```

=== "C++"

    ```cpp
    search.set_buffer_size(20000);
    ```

### Reset

Clears all rules and facts:

=== "Python"

    ```python
    search.reset()
    ```

=== "TypeScript"

    ```typescript
    search.reset();
    ```

=== "C++"

    ```cpp
    search.reset();
    ```

## Performance Considerations

1. **Buffer Size**: Larger buffers allow more complex intermediate results but use more memory
2. **Limit Size**: Restricts maximum rule/fact complexity - too small may reject valid rules
3. **Iterative Execution**: Call `execute()` in a loop to continue inference until convergence
4. **Early Termination**: Return `true` from callback to stop as soon as target is found
5. **Deduplication**: The engine automatically deduplicates facts, avoiding redundant computation

!!! tip "Choosing Buffer Sizes"
    - For simple propositional logic: `limit_size=1000`, `buffer_size=10000`
    - For complex first-order logic: `limit_size=2000`, `buffer_size=50000`
    - If you get truncated results, increase the buffer sizes

## Practical Examples

### Complete Double Negation Elimination

This example demonstrates proving that from `!!X` we can derive `X`:

=== "Python"

    ```python
    import apyds

    search = apyds.Search(1000, 10000)

    # Modus ponens: P -> Q, P |- Q
    search.add("(`P -> `Q) `P `Q")
    
    # Propositional logic axioms
    search.add("(`p -> (`q -> `p))")                                    # Axiom 1
    search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))")    # Axiom 2
    search.add("(((! `p) -> (! `q)) -> (`q -> `p))")                    # Axiom 3

    # Premise: !!X (double negation of X)
    search.add("(! (! X))")

    # Target: X
    target = apyds.Rule("X")

    # Run until we find X
    iterations = 0
    while True:
        found = False
        def callback(candidate):
            nonlocal found
            if candidate == target:
                print(f"✓ Found target after {iterations + 1} iteration(s)!")
                print(f"  Result: {candidate}")
                found = True
                return True  # Stop
            return False  # Continue
        
        count = search.execute(callback)
        iterations += 1
        
        if found:
            break
        if count == 0:
            print("No more inferences possible")
            break
    ```

=== "TypeScript"

    ```typescript
    import { rule_t, search_t } from "atsds";

    const search = new search_t(1000, 10000);

    // Modus ponens: P -> Q, P |- Q
    search.add("(`P -> `Q) `P `Q");
    
    // Propositional logic axioms
    search.add("(`p -> (`q -> `p))");
    search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))");
    search.add("(((! `p) -> (! `q)) -> (`q -> `p))");

    // Premise: !!X
    search.add("(! (! X))");

    const target = new rule_t("X");

    let iterations = 0;
    while (true) {
        let found = false;
        const count = search.execute((candidate) => {
            if (candidate.key() === target.key()) {
                console.log(`✓ Found target after ${iterations + 1} iteration(s)!`);
                console.log(`  Result: ${candidate.toString()}`);
                found = true;
                return true;
            }
            return false;
        });
        iterations++;

        if (found) break;
        if (count === 0) {
            console.log("No more inferences possible");
            break;
        }
    }
    ```

### Family Relationship Inference

This example shows how to derive family relationships:

=== "Python"

    ```python
    import apyds

    search = apyds.Search(1000, 10000)

    # Rules: father/mother implies parent
    search.add("(father `X `Y) (parent `X `Y)")
    search.add("(mother `X `Y) (parent `X `Y)")

    # Rule: parent of parent is grandparent
    search.add("(parent `X `Y) (parent `Y `Z) (grandparent `X `Z)")

    # Facts
    search.add("(father john mary)")
    search.add("(mother mary alice)")

    # Collect all derived facts
    derived = []
    
    # Run multiple iterations
    for i in range(5):
        def callback(fact):
            derived.append(str(fact))
            return False  # Continue
        
        count = search.execute(callback)
        if count == 0:
            break
    
    print("Derived facts:")
    for fact in derived:
        print(f"  {fact}")
    ```

### Monitoring Inference Progress

Track what the search engine is discovering:

=== "Python"

    ```python
    import apyds

    search = apyds.Search(1000, 10000)

    # Simple inference rules
    search.add("p q")  # p implies q
    search.add("q r")  # q implies r
    search.add("p")    # fact: p

    iteration = 0
    total_facts = 0

    while True:
        iteration += 1
        print(f"Iteration {iteration}:")
        
        new_facts = []
        def callback(fact):
            new_facts.append(str(fact).strip())
            return False
        
        count = search.execute(callback)
        total_facts += count
        
        for fact in new_facts:
            print(f"  + {fact}")
        
        if count == 0:
            print(f"  (no new facts)")
            break
    
    print(f"\nTotal facts derived: {total_facts}")
    ```

## See Also

- [Terms](terms.md) - Building blocks for the search
- [Rules](rules.md) - How rules are structured and matched
