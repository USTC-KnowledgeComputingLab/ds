# Rules

Rules are the core mechanism for representing logical inference in DS. This page explains how rules work and how to use them.

## Rule Structure

A rule consists of:

- **Premises**: Zero or more conditions (above the line)
- **Conclusion**: The result when all premises are satisfied (below the line)

### Text Representation

Rules are written with premises and conclusion separated by dashes (at least four dashes):

```
premise1
premise2
----------
conclusion
```

A **fact** is a rule with no premises:

```
(parent john mary)
```

Or explicitly:

```
----------
(parent john mary)
```

!!! info "Rule Format Details"
    - Premises are separated by newlines
    - The separator line must contain at least 4 dashes (`----`)
    - The conclusion comes after the separator
    - Whitespace around premises and conclusion is trimmed
    - A rule without an explicit separator is treated as a fact (no premises)

### Compact Rule Format

For rules with multiple premises, you can use space-separated terms on a single line:

```
(`P -> `Q) `P `Q
```

This is equivalent to:

```
(`P -> `Q)
`P
----------
`Q
```

The last term is the conclusion, and all preceding terms are premises.

### Examples

**Modus Ponens** (if P implies Q and P is true, then Q is true):

```
(`P -> `Q)
`P
----------
`Q
```

**Family Relationship** (if X is the father of Y, then X is a parent of Y):

```
(father `X `Y)
----------
(parent `X `Y)
```

**Transitivity of Implication** (if P implies Q and Q implies R, then P implies R):

```
(`P -> `Q)
(`Q -> `R)
----------
(`P -> `R)
```

**Propositional Logic Axiom Schemas**:

| Axiom | Formula | Description |
|-------|---------|-------------|
| Axiom 1 | `(`p -> (`q -> `p))` | If P then (Q implies P) |
| Axiom 2 | `((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))` | Distribution of implication |
| Axiom 3 | `(((! `p) -> (! `q)) -> (`q -> `p))` | Contraposition |

## Creating Rules

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    // Create a fact
    const fact = new rule_t("(parent john mary)");

    // Create a rule with premises
    const rule = new rule_t("(father `X `Y)\n----------\n(parent `X `Y)\n");

    // Access rule components
    console.log(`Number of premises: ${rule.length()}`);  // 1
    console.log(`First premise: ${rule.getitem(0).toString()}`);  // (father `X `Y)
    console.log(`Conclusion: ${rule.conclusion().toString()}`);  // (parent `X `Y)
    ```

=== "Python"

    ```python
    import apyds

    # Create a fact
    fact = apyds.Rule("(parent john mary)")

    # Create a rule with premises
    # Using explicit separator
    rule = apyds.Rule("(father `X `Y)\n----------\n(parent `X `Y)\n")

    # Access rule components
    print(f"Number of premises: {len(rule)}")  # 1
    print(f"First premise: {rule[0]}")  # (father `X `Y)
    print(f"Conclusion: {rule.conclusion}")  # (parent `X `Y)
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/utility.hh>
    #include <iostream>

    int main() {
        // Create a fact
        auto fact = ds::text_to_rule("(parent john mary)", 1000);

        // Create a rule with premises
        auto rule = ds::text_to_rule("(father `X `Y)\n----------\n(parent `X `Y)\n", 1000);

        // Access rule components
        std::cout << "Number of premises: " << rule->premises_count() << std::endl;
        std::cout << "Conclusion: " << ds::term_to_text(rule->conclusion(), 1000).get() << std::endl;

        return 0;
    }
    ```

## Rule Operations

### Grounding

Grounding substitutes variables in a rule with values from a dictionary.

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    // Create a rule with variables
    const rule = new rule_t("`a");

    // Create a dictionary
    const dictionary = new rule_t("((`a b))");

    // Ground the rule
    const result = rule.ground(dictionary);
    if (result !== null) {
        console.log(result.toString());  // ----\nb\n
    }
    ```

=== "Python"

    ```python
    import apyds

    # Create a rule with variables
    rule = apyds.Rule("`a")

    # Create a dictionary
    dictionary = apyds.Rule("((`a b))")

    # Ground the rule
    result = rule.ground(dictionary)
    print(result)  # ----\nb\n
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/utility.hh>
    #include <iostream>

    int main() {
        // Create a rule with variables
        auto rule = ds::text_to_rule("`a", 1000);

        // Create a dictionary
        auto dictionary = ds::text_to_rule("((`a b))", 1000);

        // Ground the rule
        std::byte buffer[1000];
        auto result = reinterpret_cast<ds::rule_t*>(buffer);
        result->ground(rule.get(), dictionary.get(), nullptr, buffer + 1000);

        std::cout << ds::rule_to_text(result, 1000).get() << std::endl;  // ----\nb\n

        return 0;
    }
    ```

### Matching

Matching unifies the first premise of a rule with a fact, producing a new rule with one fewer premise.

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    // Modus ponens rule
    const mp = new rule_t("(`p -> `q)\n`p\n`q\n");

    // Double negation elimination axiom
    const axiom = new rule_t("((! (! `x)) -> `x)");

    // Match
    const result = mp.match(axiom);
    if (result !== null) {
        console.log(result.toString());
        // (! (! `x))
        // ----------
        // `x
    }
    ```

=== "Python"

    ```python
    import apyds

    # Modus ponens rule: if (P -> Q) and P then Q
    mp = apyds.Rule("(`p -> `q)\n`p\n`q\n")

    # A fact: double negation elimination axiom
    axiom = apyds.Rule("((! (! `x)) -> `x)")

    # Match: apply axiom to modus ponens
    result = mp @ axiom  # Uses @ operator
    print(result)
    # Output:
    # (! (! `x))
    # ----------
    # `x
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/utility.hh>
    #include <iostream>

    int main() {
        // Modus ponens rule
        auto mp = ds::text_to_rule("(`p -> `q)\n`p\n`q\n", 1000);

        // Double negation elimination axiom
        auto axiom = ds::text_to_rule("((! (! `x)) -> `x)", 1000);

        // Match
        std::byte buffer[1000];
        auto result = reinterpret_cast<ds::rule_t*>(buffer);
        result->match(mp.get(), axiom.get(), buffer + 1000);

        std::cout << ds::rule_to_text(result, 1000).get() << std::endl;

        return 0;
    }
    ```

### Renaming

Renaming adds prefixes and/or suffixes to all variables in a rule.

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    // Create a rule
    const rule = new rule_t("`x");

    // Rename with prefix and suffix
    const spec = new rule_t("((pre_) (_suf))");
    const result = rule.rename(spec);
    if (result !== null) {
        console.log(result.toString());  // ----\n`pre_x_suf\n
    }
    ```

=== "Python"

    ```python
    import apyds

    # Create a rule
    rule = apyds.Rule("`x")

    # Rename with prefix and suffix
    spec = apyds.Rule("((pre_) (_suf))")
    result = rule.rename(spec)
    print(result)  # ----\n`pre_x_suf\n
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/utility.hh>
    #include <iostream>

    int main() {
        // Create a rule
        auto rule = ds::text_to_rule("`x", 1000);

        // Rename with prefix and suffix
        auto spec = ds::text_to_rule("((pre_) (_suf))", 1000);

        // Rename the rule
        std::byte buffer[1000];
        auto result = reinterpret_cast<ds::rule_t*>(buffer);
        result->rename(rule.get(), spec.get(), buffer + 1000);

        std::cout << ds::rule_to_text(result, 1000).get() << std::endl;  // ----\n`pre_x_suf\n

        return 0;
    }
    ```

## Rule Comparison

Rules can be compared for equality. Two rules are equal if they have the same binary representation.

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    const rule1 = new rule_t("(a b c)");
    const rule2 = new rule_t("(a b c)");
    const rule3 = new rule_t("(a b d)");

    console.log(rule1.key() === rule2.key());  // true
    console.log(rule1.key() === rule3.key());  // false
    ```

=== "Python"

    ```python
    import apyds

    rule1 = apyds.Rule("(a b c)")
    rule2 = apyds.Rule("(a b c)")
    rule3 = apyds.Rule("(a b d)")

    print(rule1 == rule2)  # True
    print(rule1 == rule3)  # False
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/utility.hh>
    #include <cstring>
    #include <iostream>

    int main() {
        auto rule1 = ds::text_to_rule("(a b c)", 1000);
        auto rule2 = ds::text_to_rule("(a b c)", 1000);
        auto rule3 = ds::text_to_rule("(a b d)", 1000);

        bool eq12 = rule1->data_size() == rule2->data_size() &&
                    memcmp(rule1->head(), rule2->head(), rule1->data_size()) == 0;
        bool eq13 = rule1->data_size() == rule3->data_size() &&
                    memcmp(rule1->head(), rule3->head(), rule1->data_size()) == 0;

        std::cout << std::boolalpha;
        std::cout << eq12 << std::endl;  // true
        std::cout << eq13 << std::endl;  // false

        return 0;
    }
    ```

## Practical Examples

### Building a Knowledge Base

Here's how to build a simple family relationship knowledge base:

=== "Python"

    ```python
    import apyds

    # Define rules for family relationships
    rules = [
        # If X is father of Y, then X is parent of Y
        apyds.Rule("(father `X `Y)\n----------\n(parent `X `Y)\n"),
        # If X is mother of Y, then X is parent of Y
        apyds.Rule("(mother `X `Y)\n----------\n(parent `X `Y)\n"),
        # If X is parent of Y and Y is parent of Z, then X is grandparent of Z
        apyds.Rule("(parent `X `Y)\n(parent `Y `Z)\n----------\n(grandparent `X `Z)\n"),
    ]

    # Define facts
    facts = [
        apyds.Rule("(father john mary)"),
        apyds.Rule("(mother mary alice)"),
    ]

    for rule in rules:
        print(f"Rule with {len(rule)} premise(s):")
        print(rule)
    ```

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    // Define rules for family relationships
    const rules = [
        new rule_t("(father `X `Y)\n----------\n(parent `X `Y)\n"),
        new rule_t("(mother `X `Y)\n----------\n(parent `X `Y)\n"),
        new rule_t("(parent `X `Y)\n(parent `Y `Z)\n----------\n(grandparent `X `Z)\n"),
    ];

    // Define facts
    const facts = [
        new rule_t("(father john mary)"),
        new rule_t("(mother mary alice)"),
    ];

    for (const rule of rules) {
        console.log(`Rule with ${rule.length()} premise(s):`);
        console.log(rule.toString());
    }
    ```

### Implementing Inference Steps Manually

You can manually apply matching to simulate inference:

=== "Python"

    ```python
    import apyds

    # Modus ponens: (P -> Q), P |- Q
    modus_ponens = apyds.Rule("(`P -> `Q)\n`P\n----------\n`Q\n")
    print(f"Modus Ponens:\n{modus_ponens}")

    # An implication fact: A -> B
    implication = apyds.Rule("(A -> B)")
    print(f"Implication:\n{implication}")

    # Match to get: A |- B
    step1 = modus_ponens @ implication
    print(f"After matching implication:\n{step1}")

    # Now we need fact A to complete the inference
    fact_a = apyds.Rule("A")
    print(f"Fact A:\n{fact_a}")

    # Match again to derive B
    step2 = step1 @ fact_a
    print(f"Final result (B):\n{step2}")
    ```

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    // Modus ponens: (P -> Q), P |- Q
    const modusPonens = new rule_t("(`P -> `Q)\n`P\n----------\n`Q\n");
    console.log("Modus Ponens:", modusPonens.toString());

    // An implication fact: A -> B
    const implication = new rule_t("(A -> B)");
    console.log("Implication:", implication.toString());

    // Match to get: A |- B
    const step1 = modusPonens.match(implication);
    if (step1) {
        console.log("After matching implication:", step1.toString());

        // Match with fact A to derive B
        const factA = new rule_t("A");
        const step2 = step1.match(factA);
        if (step2) {
            console.log("Final result (B):", step2.toString());
        }
    }
    ```

### Working with Rule Premises

You can iterate over a rule's premises:

=== "Python"

    ```python
    import apyds

    # A rule with multiple premises
    rule = apyds.Rule("(p -> q)\n(q -> r)\n----------\n(p -> r)\n")

    print(f"Number of premises: {len(rule)}")
    print(f"Conclusion: {rule.conclusion}")

    # Iterate over premises
    for i in range(len(rule)):
        print(f"Premise {i}: {rule[i]}")
    ```

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    const rule = new rule_t("(p -> q)\n(q -> r)\n----------\n(p -> r)\n");

    console.log(`Number of premises: ${rule.length()}`);
    console.log(`Conclusion: ${rule.conclusion().toString()}`);

    for (let i = 0; i < rule.length(); i++) {
        console.log(`Premise ${i}: ${rule.getitem(i).toString()}`);
    }
    ```

## See Also

- [Terms](terms.md) - Building blocks for rules
- [Search Engine](search.md) - Performing inference with rules
