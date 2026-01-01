# Rule

Rule 是 DS 中表示逻辑推理的核心机制。本页解释了 Rule 的工作原理以及如何使用它们。

## Rule 结构

一条 Rule 由以下部分组成：

- **前提**：零个或多个条件（横线上方）
- **结论**：当所有前提都满足时的结果（横线下方）

### 文本表示

Rule 的前提和结论由破折号分隔（至少四个破折号）：

```
premise1
premise2
----------
conclusion
```

**事实 (Fact)** 是没有前提的 Rule：

```
(parent john mary)
```

或者显式表示为：

```
----------
(parent john mary)
```

::: tip Rule 格式详情
- 前提之间用换行符分隔
- 分隔线必须包含至少 4 个破折号 (`----`) 在前提和结论之间
- 前提和结论周围的空白会被修剪
- 没有前提的 Rule 是事实

:::
### 紧凑 Rule 格式

对于有多个前提的 Rule，可以使用单行空格分隔的 Term：

```
(`P -> `Q) `P `Q
```

这等价于：

```
(`P -> `Q)
`P
----------
`Q
```

最后一个 Term 是结论，之前的所有 Term 都是前提。

### 示例

**肯定前件 (Modus Ponens)** (如果 P 蕴含 Q 且 P 为真，则 Q 为真)：

```
(`P -> `Q)
`P
----------
`Q
```

**家庭关系** (如果 X 是 Y 的父亲，则 X 是 Y 的父母)：

```
(father `X `Y)
----------
(parent `X `Y)
```

## 创建 Rule

::: code-group
```typescript [TypeScript]
import { Rule } from "atsds";

// Create a fact
const fact = new Rule("(parent john mary)");

// Create a rule with premises
const rule = new Rule("(father `X `Y)\n----------\n(parent `X `Y)\n");

// Access rule components
console.log(`Number of premises: ${rule.length()}`);  // 1
console.log(`First premise: ${rule.getitem(0).toString()}`);  // (father `X `Y)
console.log(`Conclusion: ${rule.conclusion().toString()}`);  // (parent `X `Y)
```
```python [Python]
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
```cpp [C++]
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
:::

## Rule 操作

### Grounding

Grounding 将 Rule 中的 Variable 替换为字典中的值。

::: code-group
```typescript [TypeScript]
import { Rule } from "atsds";

// Create a rule with variables
const rule = new Rule("`a");

// Create a dictionary
const dictionary = new Rule("((`a b))");

// Ground the rule
const result = rule.ground(dictionary);
if (result !== null) {
    console.log(result.toString());  // ----\nb\n
}
```
```python [Python]
import apyds

# Create a rule with variables
rule = apyds.Rule("`a")

# Create a dictionary
dictionary = apyds.Rule("((`a b))")

# Ground the rule
result = rule.ground(dictionary)
print(result)  # ----\nb\n
```
```cpp [C++]
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
:::

### Matching

Matching 将 Rule 的第一个前提与一个事实合一，产生一个少了一个前提的新 Rule。

::: code-group
```typescript [TypeScript]
import { Rule } from "atsds";

// Modus ponens rule
const mp = new Rule("(`p -> `q)\n`p\n`q\n");

// Double negation elimination axiom
const axiom = new Rule("((! (! `x)) -> `x)");

// Match
const result = mp.match(axiom);
if (result !== null) {
    console.log(result.toString());
    // (! (! `x))
    // ----------
    // `x
}
```
```python [Python]
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
```cpp [C++]
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
:::

### Renaming

Renaming 为 Rule 中的所有 Variable 添加前缀和/或后缀。

::: code-group
```typescript [TypeScript]
import { Rule } from "atsds";

// Create a rule
const rule = new Rule("`x");

// Rename with prefix and suffix
const spec = new Rule("((pre_) (_suf))");
const result = rule.rename(spec);
if (result !== null) {
    console.log(result.toString());  // ----\n`pre_x_suf\n
}
```
```python [Python]
import apyds

# Create a rule
rule = apyds.Rule("`x")

# Rename with prefix and suffix
spec = apyds.Rule("((pre_) (_suf))")
result = rule.rename(spec)
print(result)  # ----\n`pre_x_suf\n
```
```cpp [C++]
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
:::

## Rule 比较

Rule 可以比较是否相等。如果两条 Rule 具有相同的二进制表示，则它们是相等的。

::: code-group
```typescript [TypeScript]
import { Rule } from "atsds";

const rule1 = new Rule("(a b c)");
const rule2 = new Rule("(a b c)");
const rule3 = new Rule("(a b d)");

console.log(rule1.key() === rule2.key());  // true
console.log(rule1.key() === rule3.key());  // false
```
```python [Python]
import apyds

rule1 = apyds.Rule("(a b c)")
rule2 = apyds.Rule("(a b c)")
rule3 = apyds.Rule("(a b d)")

print(rule1 == rule2)  # True
print(rule1 == rule3)  # False
```
```cpp [C++]
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
:::

```