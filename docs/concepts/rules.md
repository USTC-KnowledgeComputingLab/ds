# Rules

Rules are the core mechanism for representing logical inference in DS. This page explains how rules work and how to use them.

## Rule Structure

A rule consists of:

- **Premises**: Zero or more conditions (above the line)
- **Conclusion**: The result when all premises are satisfied (below the line)

### Text Representation

Rules are written with premises and conclusion separated by dashes:

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

## Creating Rules

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

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    // Create a rule with variables
    const rule = new rule_t("`a");

    // Create a dictionary
    const dictionary = new rule_t("((`a b))");

    // Ground the rule
    const result = rule.ground(dictionary);
    console.log(result?.toString());  // ----\nb\n
    ```

### Matching

Matching unifies the first premise of a rule with a fact, producing a new rule with one fewer premise.

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

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    // Modus ponens rule
    const mp = new rule_t("(`p -> `q)\n`p\n`q\n");

    // Double negation elimination axiom
    const axiom = new rule_t("((! (! `x)) -> `x)");

    // Match
    const result = mp.match(axiom);
    console.log(result?.toString());
    // (! (! `x))
    // ----------
    // `x
    ```

### Renaming

Renaming adds prefixes and/or suffixes to all variables in a rule.

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

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    // Create a rule
    const rule = new rule_t("`x");

    // Rename with prefix and suffix
    const spec = new rule_t("((pre_) (_suf))");
    const result = rule.rename(spec);
    console.log(result?.toString());  // ----\n`pre_x_suf\n
    ```

## Rule Comparison

Rules can be compared for equality. Two rules are equal if they have the same binary representation.

=== "Python"

    ```python
    import apyds

    rule1 = apyds.Rule("(a b c)")
    rule2 = apyds.Rule("(a b c)")
    rule3 = apyds.Rule("(a b d)")

    print(rule1 == rule2)  # True
    print(rule1 == rule3)  # False
    ```

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    const rule1 = new rule_t("(a b c)");
    const rule2 = new rule_t("(a b c)");
    const rule3 = new rule_t("(a b d)");

    console.log(rule1.key() === rule2.key());  // true
    console.log(rule1.key() === rule3.key());  // false
    ```

## Logical Systems

DS can encode various logical systems using rules:

### Propositional Logic

```python
import apyds

search = apyds.Search(1000, 10000)

# Modus ponens: P -> Q, P |- Q
search.add("(`P -> `Q) `P `Q")

# Axiom schemas for propositional logic:
# 1. p -> (q -> p)
search.add("(`p -> (`q -> `p))")

# 2. (p -> (q -> r)) -> ((p -> q) -> (p -> r))
search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))")

# 3. (!p -> !q) -> (q -> p)
search.add("(((! `p) -> (! `q)) -> (`q -> `p))")
```

### Custom Domains

You can define rules for any domain:

```python
import apyds

search = apyds.Search(1000, 10000)

# Family relationships
search.add("(father `X `Y)\n----------\n(parent `X `Y)\n")
search.add("(mother `X `Y)\n----------\n(parent `X `Y)\n")
search.add("(parent `X `Y) (parent `Y `Z)\n----------\n(grandparent `X `Z)\n")

# Facts
search.add("(father john mary)")
search.add("(mother mary alice)")
```

## See Also

- [Terms](terms.md) - Building blocks for rules
- [Search Engine](search.md) - Performing inference with rules
