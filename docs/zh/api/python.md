# Python API 参考

本页记录了 `apyds` 包的 Python API。

```python
from apyds import (
    buffer_size,
    scoped_buffer_size,
    String,
    Variable,
    Item,
    List,
    Term,
    Rule,
    Search,
)
```

## buffer_size

获取当前缓冲区大小，或设置新的缓冲区大小并返回之前的值。

```python
def buffer_size(size: int = 0) -> int
```

**参数：**

- `size` (可选)：要设置的新缓冲区大小。如果为 0（默认值），则返回当前大小而不进行修改。

**返回值：** 之前的缓冲区大小值。

**示例：**

```python
current_size = buffer_size()       # Get current size
old_size = buffer_size(2048)       # Set new size, returns old size
```

---


## scoped_buffer_size

用于临时更改缓冲区大小的上下文管理器。

```python
@contextmanager
def scoped_buffer_size(size: int = 0)
```

**参数：**

- `size`：要设置的临时缓冲区大小。

**示例：**

```python
with scoped_buffer_size(4096):
    # Operations here use buffer size of 4096
    pass
# Buffer size is restored to previous value
```

---


## String

演绎系统字符串的包装类。

### 构造函数

```python
def __init__(self, value: String | str | bytes, size: int | None = None)
```

**参数：**

- `value`：初始值（字符串、bytes 或另一个 String）
- `size` (可选)：内部存储的缓冲区容量

### 方法

#### __str__()

将值转换为字符串表示形式。

```python
def __str__(self) -> str
```

#### data()

获取值的二进制表示形式。

```python
def data(self) -> bytes
```

#### size()

获取数据的大小（以字节为单位）。

```python
def size(self) -> int
```

**示例：**

```python
str1 = String("hello")
str2 = String(str1.data())  # From binary
print(str1)  # "hello"
```

---


## Variable

演绎系统中逻辑 Variable 的包装类。

### 构造函数

```python
def __init__(self, value: Variable | str | bytes, size: int | None = None)
```

**参数：**

- `value`：初始值（以反引号开头的字符串、bytes 或另一个 Variable）
- `size` (可选)：内部存储的缓冲区容量

### 属性

#### name

获取此 Variable 的名称（不带反引号前缀）。

```python
@property
def name(self) -> String
```

**示例：**

```python
var1 = Variable("`X")
print(var1.name)  # "X"
print(var1)       # "`X"
```

---


## Item

演绎系统中 Item（常量/函子）的包装类。

### 构造函数

```python
def __init__(self, value: Item | str | bytes, size: int | None = None)
```

### 属性

#### name

获取此 Item 的名称。

```python
@property
def name(self) -> String
```

**示例：**

```python
item = Item("atom")
print(item.name)  # "atom"
```

---


## List

演绎系统中 List 的包装类。

### 构造函数

```python
def __init__(self, value: List | str | bytes, size: int | None = None)
```

### 方法

#### __len__()

获取 List 中的元素数量。

```python
def __len__(self) -> int
```

#### __getitem__()

通过索引获取 List 中的元素。

```python
def __getitem__(self, index: int) -> Term
```

**示例：**

```python
lst = List("(a b c)")
print(len(lst))   # 3
print(lst[0])     # "a"
```

---


## Term

演绎系统中逻辑 Term 的包装类。一个 Term 可以是 Variable、Item 或 List。

### 构造函数

```python
def __init__(self, value: Term | str | bytes, size: int | None = None)
```

### 属性

#### term

提取底层 Term 并将其作为具体类型返回。

```python
@property
def term(self) -> Variable | Item | List
```

### 方法

#### ground()

使用字典将此 Term 具体化 (Ground)，用值替换 Variable。

```python
def ground(self, other: Term, scope: str | None = None) -> Term | None
```

**参数：**

- `other`：表示字典的 Term（对列表）
- `scope` (可选)：用于 Variable 作用域的字符串

**返回值：** 具体化后的 Term，如果失败则返回 None。

**示例：**

```python
a = Term("`a")
dict = Term("((`a b))")
result = a.ground(dict)
if result is not None:
    print(result)  # "b"
```

#### __matmul__() / match

将两个 Term 进行合一，并返回合一结果作为字典。

```python
def __matmul__(self, other: Term) -> Term | None
```

**参数：**

- `other`：要与此 Term 匹配的 Term

**返回值：** 表示合一字典（元组列表）的 Term，如果匹配失败则返回 None。

**示例：**

```python
a = Term("`a")
b = Term("b")
result = a @ b
if result is not None:
    print(result)  # "((1 2 `a b))"
```

#### rename()

通过添加前缀和后缀重命名此 Term 中的所有 Variable。

```python
def rename(self, prefix_and_suffix: Term) -> Term | None
```

**参数：**

- `prefix_and_suffix`: 格式为 `((prefix) (suffix))` 的 Term

**返回值：** 重命名后的 Term，如果重命名失败则返回 None。

**示例：**

```python
term = Term("`x")
spec = Term("((pre_) (_suf))")
result = term.rename(spec)
if result is not None:
    print(result)  # "`pre_x_suf"
```

---


## Rule

演绎系统中逻辑 Rule 的包装类。

### 构造函数

```python
def __init__(self, value: Rule | str | bytes, size: int | None = None)
```

### 属性

#### conclusion

获取 Rule 的结论。

```python
@property
def conclusion(self) -> Term
```

### 方法

#### __len__()

获取 Rule 中的前提数量。

```python
def __len__(self) -> int
```

#### __getitem__()

通过索引获取前提 Term。

```python
def __getitem__(self, index: int) -> Term
```

#### ground()

使用字典将此 Rule 具体化 (Ground)。

```python
def ground(self, other: Rule, scope: str | None = None) -> Rule | None
```

#### __matmul__() / match

使用合一将此 Rule 与另一个 Rule 匹配。

```python
def __matmul__(self, other: Rule) -> Rule | None
```

**参数：**

- `other`：要匹配的 Rule（必须是没有前提的事实）

**返回值：** 匹配后的 Rule，如果匹配失败则返回 None。

**示例：**

```python
mp = Rule("(`p -> `q)\n`p\n`q\n")
pq = Rule("((! (! `x)) -> `x)")
result = mp @ pq
if result is not None:
    print(result)
    # "(! (! `x))\n----------\n`x\n"
```

#### rename()

重命名此 Rule 中的所有 Variable。

```python
def rename(self, prefix_and_suffix: Rule) -> Rule | None
```

---


## Search

演绎系统的搜索引擎。

### 构造函数

```python
def __init__(self, limit_size: int = 1000, buffer_size: int = 10000)
```

**参数：**

- `limit_size` (可选)：用于存储 Rule/事实的缓冲区大小（默认值：1000）
- `buffer_size` (可选)：用于内部操作的缓冲区大小（默认值：10000）

### 方法

#### set_limit_size()

设置存储最终对象的缓冲区大小。

```python
def set_limit_size(self, limit_size: int) -> None
```

#### set_buffer_size()

设置内部操作的缓冲区大小。

```python
def set_buffer_size(self, buffer_size: int) -> None
```

#### reset()

重置搜索引擎，清除所有 Rule 和事实。

```python
def reset(self) -> None
```

#### add()

向知识库添加 Rule 或事实。

```python
def add(self, text: str) -> bool
```

**返回值：** 如果添加成功则返回 True，否则返回 False。

#### execute()

执行搜索引擎，并为每个推导出的 Rule 调用回调。

```python
def execute(self, callback: Callable[[Rule], bool]) -> int
```

**参数：**

- `callback`：对每个候选 Rule 调用的函数。返回 False 继续，返回 True 停止。

**返回值：** 处理的 Rule 数量。

**示例：**

```python
search = Search(1000, 10000)
search.add("(`P -> `Q) `P `Q")
search.add("(! (! X))")

def callback(candidate):
    print(candidate)
    return False  # Continue searching

search.execute(callback)
```

---


## 完整示例

这是一个演示大多数 API 的完整示例：

```python
import apyds

# Configure buffer size for operations
apyds.buffer_size(2048)

# Create terms
var = apyds.Variable("`X")
item = apyds.Item("hello")
lst = apyds.List("(a b c)")
term = apyds.Term("(f `x `y)")

print(f"Variable: {var}, name: {var.name}")
print(f"Item: {item}, name: {item.name}")
print(f"List: {lst}, length: {len(lst)}")
print(f"Term: {term}, type: {type(term.term)}")

# Work with rules
fact = apyds.Rule("(parent john mary)")
rule = apyds.Rule("(father `X `Y)\n----------\n(parent `X `Y)\n")

print(f"\nFact: {fact}")
print(f"Rule premises: {len(rule)}, conclusion: {rule.conclusion}")

# Grounding
term_a = apyds.Term("`a")
dictionary = apyds.Term("((`a hello))")
grounded = term_a // dictionary
print(f"\nGrounding `a with ((` hello)): {grounded}")

# Matching
mp = apyds.Rule("(`p -> `q)\n`p\n`q\n")
axiom = apyds.Rule("((A) -> B)")
matched = mp @ axiom
print(f"\nMatching modus ponens with (A -> B):\n{matched}")

# Search engine
search = apyds.Search(1000, 10000)
search.add("p q")  # p implies q
search.add("q r")  # q implies r
search.add("p")    # fact: p

print("\nRunning inference:")
for i in range(3):
    count = search.execute(lambda r: print(f"  Derived: {r}") or False)
    if count == 0:
        break

# Using context manager for buffer size
with apyds.scoped_buffer_size(4096):
    big_term = apyds.Term("(a b c d e f g h i j)")
    print(f"\nBig term: {big_term}")
```