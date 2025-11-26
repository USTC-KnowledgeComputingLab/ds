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
    Variable names can contain any characters except backtick, whitespace and parentheses. By convention, single uppercase letters like `` `X``, `` `P``, `` `Q`` are often used for simple logic, while descriptive names like `` `person`` or `` `result`` improve readability in complex rules.

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
    Items can contain any characters except backtick, whitespace and parentheses. Special symbols like `->`, `!`, `<-`, `&&`, `||` are commonly used as logical operators.

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
- **Logical expressions**: `(P -> Q)` - "P implies Q"
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
        // Create a generic term
        auto term = ds::text_to_term("(f `x)", 1000);
        // Access the underlying type
        auto list = term->list();
        auto item = list->term(0)->item();
        auto variable = list->term(1)->variable();
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

Operations like grounding and renaming require buffer space for intermediate results in TypeScript/Javascript and Python. You can control this using buffer size functions.

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

## See Also

- [Rules](rules.md) - How to create and work with inference rules
- [Search Engine](search.md) - Performing logical inference
