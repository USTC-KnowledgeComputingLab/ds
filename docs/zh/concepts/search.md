# 搜索引擎

搜索引擎是 DS 中的核心推理机制。它管理 Rule 和事实的知识库，并通过将 Rule 与事实进行匹配来执行逻辑推理。

## 概览

搜索引擎：

1. 维护 Rule 和事实的集合
2. 迭代地应用 Rule 以生成新的事实
3. 通过回调通知您每个新推理
4. 自动防止重复推理

::: tip 工作原理
搜索引擎使用前向链 (forward-chaining) 推理方法：

1. 当您调用 `execute()` 时，引擎尝试将每个 Rule 的第一个前提与现有事实进行匹配
2. 找到匹配项时，Rule 中的 Variable 被替换，并创建一个新 Rule（前提少一个）
3. 如果新 Rule 没有前提，它将成为一个新的事实
4. 对每个新派生的 Rule 调用回调
5. 自动过滤掉重复的 Rule

:::
## 创建搜索引擎

::: code-group
```typescript [TypeScript]
import { Search } from "atsds";

// Create with default sizes
const search = new Search();

// Create with custom sizes
const search2 = new Search(1000, 10000);
```
```python [Python]
import apyds

# Create with default sizes
search = apyds.Search()

# Create with custom sizes
search = apyds.Search(limit_size=1000, buffer_size=10000)
```
```cpp [C++]
#include <ds/search.hh>

// Create search engine
ds::search_t search(1000, 10000);
```
:::

### 参数

- **limit_size**：每个存储的 Rule/事实的最大大小（字节）（默认值：1000）。大于此大小的 Rule 或事实将被拒绝。
- **buffer_size**：中间操作的内部缓冲区大小（默认值：10000）。如果您处理复杂的 Rule，请增加此值。

## 添加 Rule 和事实

使用 `add()` 方法将 Rule 和事实添加到知识库中。

::: code-group
```typescript [TypeScript]
import { Search } from "atsds";

const search = new Search();

// Add a fact
search.add("(parent john mary)");

// Add a rule with premises
search.add("(father `X `Y)\n----------\n(parent `X `Y)\n");
```
```python [Python]
import apyds

search = apyds.Search()

# Add a fact
search.add("(parent john mary)")

# Add a rule with premises
search.add("(father `X `Y)\n----------\n(parent `X `Y)\n")
```
```cpp [C++]
ds::search_t search(1000, 10000);

// Add a fact
search.add("(parent john mary)");

// Add a rule
search.add("(father `X `Y)\n----------\n(parent `X `Y)\n");
```
:::

## 执行搜索

`execute()` 方法执行一轮推理。它将所有 Rule 与所有事实进行匹配，并生成新的结论。

::: code-group
```typescript [TypeScript]
import { Search } from "atsds";

const search = new Search();
search.add("(father `X `Y)\n----------\n(parent `X `Y)\n");
search.add("(father john mary)");

const count = search.execute((rule) => {
    console.log(`Found: ${rule.toString()}`);
    return false;  // Continue searching
});

console.log(`Generated ${count} new facts`);
```
```python [Python]
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
```cpp [C++]
ds::search_t search(1000, 10000);
search.add("(father `X `Y)\n----------\n(parent `X `Y)\n");
search.add("(father john mary)");

auto count = search.execute([](ds::rule_t* rule) {
    printf("Found: %s\n", ds::rule_to_text(rule, 1000).get());
    return false;  // Continue searching
});

printf("Generated %lu new facts\n", count);
```
:::

### 回调函数

回调接收每个新推断出的 Rule，并且应该返回：

- `False` (Python) / `false` (TypeScript/C++): 继续搜索
- `True` (Python) / `true` (TypeScript/C++): 停止搜索

## 搜索目标

要搜索直到找到特定目标：

::: code-group
```typescript [TypeScript]
import { Rule, Search } from "atsds";

const search = new Search(1000, 10000);

// Set up propositional logic
search.add("(`P -> `Q) `P `Q");
search.add("(`p -> (`q -> `p))");
search.add("((`p -> (`q -> `r)) -> ((`p -> `q) -> (`p -> `r)))");
search.add("(((! `p) -> (! `q)) -> (`q -> `p))");
search.add("(! (! X))");

const target = new Rule("X");

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
```python [Python]
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
        global found
        if candidate == target:
            print(f"Found: {candidate}")
            found = True
            return True
        return False
    search.execute(check)
    if found:
        break
```
:::

## 配置方法

### 设置 Limit Size

控制每个存储的 Rule/事实的最大大小：

::: code-group
```typescript [TypeScript]
search.set_limit_size(2000);
```
```python [Python]
search.set_limit_size(2000)
```
```cpp [C++]
search.set_limit_size(2000);
```
:::

### 设置 Buffer Size

控制操作的内部缓冲区大小：

::: code-group
```typescript [TypeScript]
search.set_buffer_size(20000);
```
```python [Python]
search.set_buffer_size(20000)
```
```cpp [C++]
search.set_buffer_size(20000);
```
:::

### 重置

清除所有 Rule 和事实：

::: code-group
```typescript [TypeScript]
search.reset();
```
```python [Python]
search.reset()
```
```cpp [C++]
search.reset();
```
:::

## 性能考虑

1. **Buffer Size**：更大的缓冲区允许更复杂的中间结果，但占用更多内存
2. **Limit Size**：限制最大 Rule/事实的复杂度 - 太小可能会拒绝有效的 Rule
3. **迭代执行**：循环调用 `execute()` 以继续推理直到收敛
4. **提前终止**：从回调返回 `true` 以在找到目标后立即停止
5. **去重**：引擎自动对事实进行去重，避免冗余计算
