# Quick Start

This guide will help you get started with DS in your preferred language.

## Creating Terms

Terms are the basic building blocks of the deductive system. A term can be:

- **Variable**: Prefixed with backtick, e.g., `` `X``, `` `P``
- **Item**: Constants or functors, e.g., `a`, `father`, `!`
- **List**: Ordered sequences in parentheses, e.g., `(a b c)`

=== "Python"

    ```python
    import apyds

    # Create different types of terms
    var = apyds.Variable("`X")
    item = apyds.Item("hello")
    lst = apyds.List("(a b c)")
    term = apyds.Term("(f `x a)")

    print(f"Variable: {var}")      # `X
    print(f"Item: {item}")         # hello
    print(f"List: {lst}")          # (a b c)
    print(f"Term: {term}")         # (f `x a)
    ```

=== "TypeScript"

    ```typescript
    import { variable_t, item_t, list_t, term_t } from "atsds";

    // Create different types of terms
    const var1 = new variable_t("`X");
    const item = new item_t("hello");
    const lst = new list_t("(a b c)");
    const term = new term_t("(f `x a)");

    console.log(`Variable: ${var1.toString()}`);  // `X
    console.log(`Item: ${item.toString()}`);      // hello
    console.log(`List: ${lst.toString()}`);       // (a b c)
    console.log(`Term: ${term.toString()}`);      // (f `x a)
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/utility.hh>
    #include <iostream>

    int main() {
        auto var = ds::text_to_variable("`X", 1000);
        auto item = ds::text_to_item("hello", 1000);
        auto lst = ds::text_to_list("(a b c)", 1000);
        auto term = ds::text_to_term("(f `x a)", 1000);

        std::cout << "Variable: " << ds::variable_to_text(var.get(), 1000).get() << std::endl;
        std::cout << "Item: " << ds::item_to_text(item.get(), 1000).get() << std::endl;
        std::cout << "List: " << ds::list_to_text(lst.get(), 1000).get() << std::endl;
        std::cout << "Term: " << ds::term_to_text(term.get(), 1000).get() << std::endl;
        return 0;
    }
    ```

## Creating Rules

Rules represent logical inference steps. A rule has premises (conditions) and a conclusion.

=== "Python"

    ```python
    import apyds

    # A fact (rule with no premises)
    fact = apyds.Rule("(parent john mary)")
    print(f"Fact: {fact}")

    # A rule with premises
    # Format: premise1\npremise2\nconclusion\n
    rule = apyds.Rule("(father `X `Y)\n----------\n(parent `X `Y)\n")
    print(f"Rule premises: {len(rule)}")
    print(f"Rule conclusion: {rule.conclusion}")
    ```

=== "TypeScript"

    ```typescript
    import { rule_t } from "atsds";

    // A fact (rule with no premises)
    const fact = new rule_t("(parent john mary)");
    console.log(`Fact: ${fact.toString()}`);

    // A rule with premises
    const rule = new rule_t("(father `X `Y)\n----------\n(parent `X `Y)\n");
    console.log(`Rule premises: ${rule.length()}`);
    console.log(`Rule conclusion: ${rule.conclusion().toString()}`);
    ```

=== "C++"

    ```cpp
    #include <ds/ds.hh>
    #include <ds/utility.hh>
    #include <iostream>

    int main() {
        auto fact = ds::text_to_rule("(parent john mary)", 1000);
        auto rule = ds::text_to_rule("(father `X `Y)\n----------\n(parent `X `Y)\n", 1000);

        std::cout << "Fact: " << ds::rule_to_text(fact.get(), 1000).get() << std::endl;
        std::cout << "Rule premises: " << rule->premises_count() << std::endl;
        return 0;
    }
    ```

## Using the Search Engine

The search engine performs logical inference by matching rules with facts.

=== "Python"

    ```python
    import apyds

    # Create search engine
    search = apyds.Search(1000, 10000)

    # Add modus ponens: P -> Q, P |- Q
    search.add("(`P -> `Q) `P `Q")

    # Add axiom schemas
    search.add("(`p -> (`q -> `p))")  # Axiom 1
    search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))")  # Axiom 2
    search.add("(((! `p) -> (! `q)) -> (`q -> `p))")  # Axiom 3

    # Add premise: !!X (double negation)
    search.add("(! (! X))")

    # Define target: X
    target = apyds.Rule("X")

    # Execute search
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

    // Create search engine
    const search = new search_t(1000, 10000);

    // Add modus ponens: P -> Q, P |- Q
    search.add("(`P -> `Q) `P `Q");

    // Add axiom schemas
    search.add("(`p -> (`q -> `p))");  // Axiom 1
    search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))");  // Axiom 2
    search.add("(((! `p) -> (! `q)) -> (`q -> `p))");  // Axiom 3

    // Add premise: !!X (double negation)
    search.add("(! (! X))");

    // Define target: X
    const target = new rule_t("X");

    // Execute search
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

=== "C++"

    ```cpp
    #include <cstdio>
    #include <cstring>
    #include <ds/ds.hh>
    #include <ds/search.hh>
    #include <ds/utility.hh>

    int main() {
        ds::search_t search(1000, 10000);

        // Add modus ponens: P -> Q, P |- Q
        search.add("(`P -> `Q) `P `Q");

        // Add axiom schemas
        search.add("(`p -> (`q -> `p))");
        search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))");
        search.add("(((! `p) -> (! `q)) -> (`q -> `p))");

        // Add premise: !!X (double negation)
        search.add("(! (! X))");

        // Define target: X
        auto target = ds::text_to_rule("X", 1000);

        // Execute search
        while (true) {
            bool found = false;
            search.execute([&](ds::rule_t* candidate) {
                if (candidate->data_size() == target->data_size() &&
                    memcmp(candidate->head(), target->head(), candidate->data_size()) == 0) {
                    printf("Found: %s", ds::rule_to_text(candidate, 1000).get());
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

## Next Steps

- Learn more about [Terms](../concepts/terms.md)
- Understand [Rules](../concepts/rules.md)
- Explore the [Search Engine](../concepts/search.md)
- Check the [API Reference](../api/python.md)
