# Terms

Terms are the fundamental building blocks of the deductive system. This page explains the different types of terms and how to work with them.

## Term Types

The deductive system supports three basic types of terms:

### Variables

Variables are placeholders that can be unified with other terms during inference. They are prefixed with a backtick (`` ` ``).

```
`X
`variable_name
`P
`Q
```

Variables are used in rules to represent any term that can match during unification. During the inference process, variables can be bound to specific terms through unification.

!!! tip "Variable Naming"
    Variable names can contain any characters except whitespace and parentheses. By convention, single uppercase letters like `` `X``, `` `P``, `` `Q`` are often used for simple logic, while descriptive names like `` `person`` or `` `result`` improve readability in complex rules.

### Items

Items represent constants or functors. They are atomic values without any special prefix.

```
hello
atom
father
!
->
```

Items can represent:

- **Constants**: Atomic values like `john`, `mary`, `42`
- **Functors**: Symbols that combine other terms, like `father`, `->`, `!`
- **Operators**: Special symbols used in logical expressions, like `->` for implication or `!` for negation

!!! note "Item Characters"
    Items can contain any characters except whitespace and parentheses. Special symbols like `->`, `!`, `<-`, `&&`, `||` are commonly used as logical operators.

### Lists

Lists are ordered sequences of terms enclosed in parentheses. They can contain any combination of variables, items, and nested lists.

```
(a b c)
(father john mary)
(-> P Q)
(! (! X))
```

Lists are the primary way to build complex structures in the deductive system. They can represent:

- **Relations**: `(father john mary)` - "John is the father of Mary"
- **Logical expressions**: `(-> P Q)` - "P implies Q"
- **Nested structures**: `(! (! X))` - "not not X" (double negation)
- **Data collections**: `(1 2 3 4 5)` - a list of numbers

!!! example "List Nesting"
    Lists can be nested to any depth:
    ```
    ((a b) (c d) (e f))
    (if (> `x 0) (positive `x) (non-positive `x))
    ```

## Creating Terms

=== "TypeScript"

    ```typescript
    import { variable_t, item_t, list_t, term_t } from "atsds";

    // Create a variable
    const var1 = new variable_t("`X");
    console.log(`Variable name: ${var1.name().toString()}`);  // X

    // Create an item
    const item = new item_t("hello");
    console.log(`Item name: ${item.name().toString()}`);  // hello

    // Create a list
    const lst = new list_t("(a b c)");
    console.log(`List length: ${lst.length()}`);  // 3
    console.log(`First element: ${lst.getitem(0).toString()}`);  // a

    // Create a generic term
    const term = new term_t("(f `x)");
    // Access the underlying type
    const inner = term.term();  // Returns a list_t
    ```

=== "Python"

    ```python
    import apyds

    # Create a variable
    var = apyds.Variable("`X")
    print(f"Variable name: {var.name}")  # X

    # Create an item
    item = apyds.Item("hello")
    print(f"Item name: {item.name}")  # hello

    # Create a list
    lst = apyds.List("(a b c)")
    print(f"List length: {len(lst)}")  # 3
    print(f"First element: {lst[0]}")  # a

    # Create a generic term
    term = apyds.Term("(f `x)")
    # Access the underlying type
    inner = term.term  # Returns a List
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/utility.hh>
    #include <iostream>

    int main() {
        // Create a variable
        auto var = ds::text_to_variable("`X", 1000);

        // Create an item
        auto item = ds::text_to_item("hello", 1000);

        // Create a list
        auto lst = ds::text_to_list("(a b c)", 1000);
        std::cout << "List length: " << lst->length() << std::endl;

        // Create a generic term
        auto term = ds::text_to_term("(f `x)", 1000);

        return 0;
    }
    ```

## Term Operations

### Grounding

Grounding substitutes variables in a term with values from a dictionary. The dictionary is a list of key-value pairs where each key is a variable and each value is its substitution.

=== "TypeScript"

    ```typescript
    import { term_t } from "atsds";

    // Create a term with a variable
    const term = new term_t("`a");

    // Create a dictionary for substitution
    const dictionary = new term_t("((`a b))");

    // Ground the term
    const result = term.ground(dictionary);
    if (result !== null) {
        console.log(result.toString());  // b
    }
    ```

=== "Python"

    ```python
    import apyds

    # Create a term with a variable
    term = apyds.Term("`a")

    # Create a dictionary for substitution
    # Format: ((variable value) ...)
    dictionary = apyds.Term("((`a b))")

    # Ground the term
    result = term.ground(dictionary)
    print(result)  # b
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/utility.hh>
    #include <iostream>

    int main() {
        // Create a term with a variable
        auto term = ds::text_to_term("`a", 1000);

        // Create a dictionary for substitution
        auto dictionary = ds::text_to_term("((`a b))", 1000);

        // Ground the term
        std::byte buffer[1000];
        auto result = reinterpret_cast<ds::term_t*>(buffer);
        result->ground(term.get(), dictionary.get(), nullptr, buffer + 1000);

        std::cout << ds::term_to_text(result, 1000).get() << std::endl;  // b

        return 0;
    }
    ```

### Renaming

Renaming adds prefixes and/or suffixes to all variables in a term. This is useful for avoiding variable name collisions during unification.

=== "TypeScript"

    ```typescript
    import { term_t } from "atsds";

    // Create a term with a variable
    const term = new term_t("`x");

    // Create prefix and suffix specification
    const spec = new term_t("((pre_) (_suf))");

    // Rename the term
    const result = term.rename(spec);
    if (result !== null) {
        console.log(result.toString());  // `pre_x_suf
    }
    ```

=== "Python"

    ```python
    import apyds

    # Create a term with a variable
    term = apyds.Term("`x")

    # Create prefix and suffix specification
    # Format: ((prefix) (suffix))
    spec = apyds.Term("((pre_) (_suf))")

    # Rename the term
    result = term.rename(spec)
    print(result)  # `pre_x_suf
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/utility.hh>
    #include <iostream>

    int main() {
        // Create a term with a variable
        auto term = ds::text_to_term("`x", 1000);

        // Create prefix and suffix specification
        auto spec = ds::text_to_term("((pre_) (_suf))", 1000);

        // Rename the term
        std::byte buffer[1000];
        auto result = reinterpret_cast<ds::term_t*>(buffer);
        result->rename(term.get(), spec.get(), buffer + 1000);

        std::cout << ds::term_to_text(result, 1000).get() << std::endl;  // `pre_x_suf

        return 0;
    }
    ```

## Buffer Size

Operations like grounding and renaming require buffer space for intermediate results. You can control this using buffer size functions.

=== "TypeScript"

    ```typescript
    import { buffer_size } from "atsds";

    // Get current buffer size
    const current = buffer_size();

    // Set new buffer size (returns previous value)
    const old = buffer_size(4096);
    ```

=== "Python"

    ```python
    import apyds

    # Get current buffer size
    current = apyds.buffer_size()

    # Set new buffer size (returns previous value)
    old = apyds.buffer_size(4096)

    # Use context manager for temporary change
    with apyds.scoped_buffer_size(8192):
        # Operations here use buffer size of 8192
        pass
    # Buffer size restored to previous value
    ```

## Practical Examples

### Building Logical Expressions

Here's how to build common logical expressions using terms:

=== "Python"

    ```python
    import apyds

    # Implication: P -> Q
    implication = apyds.Term("(-> P Q)")
    print(f"Implication: {implication}")

    # Negation: !P
    negation = apyds.Term("(! P)")
    print(f"Negation: {negation}")

    # Double negation: !!X
    double_neg = apyds.Term("(! (! X))")
    print(f"Double negation: {double_neg}")

    # Complex formula: (P -> Q) -> ((Q -> R) -> (P -> R))
    # This is the hypothetical syllogism
    syllogism = apyds.Term("(-> (-> P Q) (-> (-> Q R) (-> P R)))")
    print(f"Hypothetical syllogism: {syllogism}")
    ```

=== "TypeScript"

    ```typescript
    import { term_t } from "atsds";

    // Implication: P -> Q
    const implication = new term_t("(-> P Q)");
    console.log(`Implication: ${implication.toString()}`);

    // Negation: !P
    const negation = new term_t("(! P)");
    console.log(`Negation: ${negation.toString()}`);

    // Double negation: !!X
    const doubleNeg = new term_t("(! (! X))");
    console.log(`Double negation: ${doubleNeg.toString()}`);
    ```

### Working with Scoped Grounding

Scoped grounding allows you to control which variables get substituted based on a scope prefix:

=== "Python"

    ```python
    import apyds

    # Create a term with a variable
    term = apyds.Term("`a")

    # Create a dictionary with scoped entries
    # Format: ((scope1 scope2 variable value) ...)
    dictionary = apyds.Term("((x y `a `b) (y x `b `c))")

    # Ground with scope "x" - follows the chain: `a -> `b -> `c
    result = term.ground(dictionary, "x")
    print(f"Result with scope 'x': {result}")  # `c
    ```

=== "TypeScript"

    ```typescript
    import { term_t } from "atsds";

    const term = new term_t("`a");
    const dictionary = new term_t("((x y `a `b) (y x `b `c))");

    const result = term.ground(dictionary, "x");
    if (result !== null) {
        console.log(`Result with scope 'x': ${result.toString()}`);  // `c
    }
    ```

### Checking Term Types

You can inspect the type of a term and access its underlying value:

=== "Python"

    ```python
    import apyds

    # Create terms of different types
    var_term = apyds.Term("`variable")
    item_term = apyds.Term("constant")
    list_term = apyds.Term("(a b c)")

    # Check types using the term property
    print(f"Variable type: {type(var_term.term)}")   # Variable
    print(f"Item type: {type(item_term.term)}")      # Item
    print(f"List type: {type(list_term.term)}")      # List

    # Access type-specific properties
    if isinstance(var_term.term, apyds.Variable):
        print(f"Variable name: {var_term.term.name}")

    if isinstance(list_term.term, apyds.List):
        print(f"List length: {len(list_term.term)}")
        for i in range(len(list_term.term)):
            print(f"  Element {i}: {list_term.term[i]}")
    ```

=== "TypeScript"

    ```typescript
    import { term_t, variable_t, item_t, list_t } from "atsds";

    const varTerm = new term_t("`variable");
    const itemTerm = new term_t("constant");
    const listTerm = new term_t("(a b c)");

    // Access underlying types
    const inner = listTerm.term();
    if (inner instanceof list_t) {
        console.log(`List length: ${inner.length()}`);
        for (let i = 0; i < inner.length(); i++) {
            console.log(`  Element ${i}: ${inner.getitem(i).toString()}`);
        }
    }
    ```

## See Also

- [Rules](rules.md) - How to create and work with inference rules
- [Search Engine](search.md) - Performing logical inference
