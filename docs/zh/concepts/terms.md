# Term

Term 是演绎系统的基本构建块。本页解释了不同类型的 Term 以及如何使用它们。

## Term 类型

演绎系统支持三种基本类型的 Term：

### Variable

Variable 是占位符，可以在推理过程中与其他 Term 进行合一。它们以反引号 (`` ` ``) 为前缀。

```
`X
`variable_name
`P
`Q
```

Variable 用于在 Rule 中表示任何可以在合一期间匹配的 Term。在推理过程中，Variable 可以通过合一绑定到特定的 Term。

::: tip Variable 命名
Variable 名称可以包含除反引号、空格和括号之外的任何字符。按照惯例，单个大写字母如 `` `X``, `` `P``, `` `Q`` 常用于简单的逻辑，而描述性名称如 `` `person`` 或 `` `result`` 则用于提高复杂 Rule 的可读性。

:::
### Item

Item 表示常量或函子。它们是没有特殊前缀的原子值。

```
hello
atom
father
!
->
```

Item 可以表示：

- **常量**：原子值，如 `john`, `mary`, `42`
- **函子**：组合其他 Term 的符号，如 `father`, `->`, `!`
- **操作符**：用于逻辑表达式的特殊符号，如表示蕴含的 `->` 或表示否定的 `!`

::: tip Item 字符
Item 可以包含除反引号、空格和括号之外的任何字符。特殊符号如 `->`, `!`, `<-`, `&&`, `||` 常被用作逻辑操作符。

:::
### List

List 是圆括号中 Term 的有序序列。它们可以包含 Variable、Item 和嵌套 List 的任何组合。

```
(a b c)
(father john mary)
(-> P Q)
(! (! X))
```

List 是在演绎系统中构建复杂结构的主要方式。它们可以表示：

- **关系**：`(father john mary)` - "John 是 Mary 的父亲"
- **逻辑表达式**：`(P -> Q)` - "P 蕴含 Q"
- **嵌套结构**：`(! (! X))` - "非非 X" (双重否定)
- **数据集合**：`(1 2 3 4 5)` - 数字列表

::: tip List 嵌套
List 可以嵌套到任意深度：
```
((a b) (c d) (e f))
(if (> `x 0) (positive `x) (non-positive `x))
```

:::
## 创建 Term

::: code-group
```typescript [TypeScript]
import { Variable, Item, List, Term } from "atsds";

// Create a variable
const var1 = new Variable("`X");
console.log(`Variable name: ${var1.name().toString()}`);  // X

// Create an item
const item = new Item("hello");
console.log(`Item name: ${item.name().toString()}`);  // hello

// Create a list
const lst = new List("(a b c)");
console.log(`List length: ${lst.length()}`);  // 3
console.log(`First element: ${lst.getitem(0).toString()}`);  // a

// Create a generic term
const term = new Term("(f `x)");
// Access the underlying type
const inner = term.term();  // Returns a List
```
```python [Python]
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
```cpp [C++]
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
:::

## Term 操作

### Grounding

Grounding 将 Term 中的 Variable 替换为字典中的值。字典是一个键值对列表，其中每个键是一个 Variable，每个值是它的替换项。

::: code-group
```typescript [TypeScript]
import { Term } from "atsds";

// Create a term with a variable
const term = new Term("`a");

// Create a dictionary for substitution
const dictionary = new Term("((`a b))");

// Ground the term
const result = term.ground(dictionary);
if (result !== null) {
    console.log(result.toString());  // b
}
```
```python [Python]
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
```cpp [C++]
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
:::

### Matching

Matching 将两个 Term 进行合一，并返回一个 Variable 绑定字典。该字典包含使两个 Term 相等所需的替换。

::: code-group
```typescript [TypeScript]
import { Term } from "atsds";

// Match a variable with a value
const a = new Term("`a");
const b = new Term("value");

const result = a.match(b);
if (result !== null) {
    console.log(result.toString());  // ((1 2 `a value))
}

// Match complex terms
const term1 = new Term("(f b a)");
const term2 = new Term("(f `x a)");

const dict = term1.match(term2);
if (dict !== null) {
    console.log(dict.toString());  // ((2 1 `x b))
}
```
```python [Python]
import apyds

# Match a variable with a value
a = apyds.Term("`a")
b = apyds.Term("value")

result = a @ b  # Uses @ operator
print(result)  # ((1 2 `a value))

# Match complex terms
term1 = apyds.Term("(f b a)")
term2 = apyds.Term("(f `x a)")

dict_result = term1 @ term2
print(dict_result)  # ((2 1 `x b))
```
```cpp [C++]
#include <ds/ds.hh>
#include <ds/utility.hh>
#include <iostream>

int main() {
    // Match a variable with a value
    auto a = ds::text_to_term("`a", 1000);
    auto b = ds::text_to_term("value", 1000);

    // Match the terms
    std::byte buffer[1000];
    auto result = reinterpret_cast<ds::term_t*>(buffer);
    result->match(a.get(), b.get(), "1", "2", buffer + 1000);

    std::cout << ds::term_to_text(result, 1000).get() << std::endl;  // ((1 2 `a value))

    return 0;
}
```
:::

### Renaming

Renaming 为 Term 中的所有 Variable 添加前缀和/或后缀。这对于避免合一过程中的 Variable 名称冲突非常有用。

::: code-group
```typescript [TypeScript]
import { Term } from "atsds";

// Create a term with a variable
const term = new Term("`x");

// Create prefix and suffix specification
const spec = new Term("((pre_) (_suf))");

// Rename the term
const result = term.rename(spec);
if (result !== null) {
    console.log(result.toString());  // `pre_x_suf
}
```
```python [Python]
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
```cpp [C++]
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
:::

## 缓冲区大小

Grounding 和 Renaming 等操作在 TypeScript/Javascript 和 Python 中需要缓冲区空间来存储中间结果。您可以使用缓冲区大小函数来控制它。

::: code-group
```typescript [TypeScript]
import { buffer_size } from "atsds";

// Get current buffer size
const current = buffer_size();

// Set new buffer size (returns previous value)
const old = buffer_size(4096);
```
```python [Python]
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
:::
