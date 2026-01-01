# 基础示例

本节包含演示各种语言中使用 DS 演绎系统的示例。

## 命题逻辑推理

这个经典示例演示了使用命题逻辑公理进行的双重否定消除：

- **肯定前件 (Modus Ponens)**：如果 P 蕴含 Q，且 P 为真，则 Q 为真
- **公理 1**：P → (Q → P)
- **公理 2**：(P → (Q → R)) → ((P → Q) → (P → R))
- **公理 3**：(¬P → ¬Q) → (Q → P)

给定前提 ¬¬X (X 的双重否定)，我们可以推导出 X。

::: code-group
```typescript [TypeScript]
import { Rule, Search } from "atsds";

// Create a search engine
const search = new Search(1000, 10000);

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
const target = new Rule("X");

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
```python [Python]
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
        global found
        if candidate == target:
            print("Found:", candidate)
            found = True
            return True  # Stop search
        return False  # Continue searching
    search.execute(callback)
    if found:
        break
```
```cpp [C++]
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
:::

## 运行示例

示例文件位于仓库的 `examples/` 目录下：

- `examples/main.py` - Python 示例
- `examples/main.mjs` - TypeScript 示例
- `examples/main.cc` - C++ 示例

### TypeScript

```bash
npm install atsds
node examples/main.mjs
```

### Python

```bash
pip install apyds
python examples/main.py
```

### C++

```bash
cmake -B build
cmake --build build
./build/main
```
