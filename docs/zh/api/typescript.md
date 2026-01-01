# TypeScript API 参考

本页记录了 `atsds` 包的 TypeScript API。文档由 TypeScript 源代码生成。

```typescript
import { 
    buffer_size,
    String_,
    Variable, 
    Item, 
    List, 
    Term, 
    Rule, 
    Search 
} from "atsds";
```

## buffer_size

获取当前缓冲区大小，或设置新的缓冲区大小并返回之前的值。

```typescript
function buffer_size(size?: number): number;
```

**参数：**

- `size` (可选)：要设置的新缓冲区大小。如果为 0 或省略，则返回当前大小而不进行修改。

**返回值：** 之前的缓冲区大小值。

**示例：**

```typescript
const currentSize = buffer_size();     // Get current size
const oldSize = buffer_size(2048);     // Set new size, returns old size
```

---

## String_

演绎系统字符串的包装类。

### 构造函数

```typescript
constructor(value: string | Buffer | String_, size?: number)
```

**参数：**

- `value`：初始值（字符串、Buffer 或另一个 String_）
- `size` (可选)：内部存储的缓冲区容量

### 方法

#### toString()

将值转换为字符串表示形式。

```typescript
topString(): string
```

#### data()

获取值的二进制表示形式。

```typescript
data(): Buffer
```

#### size()

获取数据的大小（以字节为单位）。

```typescript
size(): number
```

#### copy()

创建此实例的深拷贝。

```typescript
copy(): String_
```

#### key()

获取用于相等性比较的键表示形式。

```typescript
key(): string
```

**示例：**

```typescript
const str1 = new String_("hello");
const str2 = new String_(str1.data());
console.log(str1.toString());  // "hello"
```

---

## Variable

演绎系统中逻辑 Variable 的包装类。

### 构造函数

```typescript
constructor(value: string | Buffer | Variable, size?: number)
```

**参数：**

- `value`：初始值（以反引号开头的字符串、Buffer 或另一个 Variable）
- `size` (可选)：内部存储的缓冲区容量

### 方法

继承自 `String_` 的所有方法，加上：

#### name()

获取此 Variable 的名称（不带反引号前缀）。

```typescript
name(): String_
```

**示例：**

```typescript
const var1 = new Variable("`X");
console.log(var1.name().toString());  // "X"
console.log(var1.toString());         // "`X"
```

---

## Item

演绎系统中 Item（常量/函子）的包装类。

### 构造函数

```typescript
constructor(value: string | Buffer | Item, size?: number)
```

### 方法

继承自 `String_` 的所有方法，加上：

#### name()

获取此 Item 的名称。

```typescript
name(): String_
```

**示例：**

```typescript
const item = new Item("atom");
console.log(item.name().toString());  // "atom"
```

---

## List

演绎系统中 List 的包装类。

### 构造函数

```typescript
constructor(value: string | Buffer | List, size?: number)
```

### 方法

继承自 `String_` 的所有方法，加上：

#### length()

获取 List 中的元素数量。

```typescript
length(): number
```

#### getitem()

通过索引获取 List 中的元素。

```typescript
getitem(index: number): Term
```

**示例：**

```typescript
const list = new List("(a b c)");
console.log(list.length());           // 3
console.log(list.getitem(0).toString());  // "a"
```

---

## Term

演绎系统中逻辑 Term 的包装类。一个 Term 可以是 Variable、Item 或 List。

### 构造函数

```typescript
constructor(value: string | Buffer | Term, size?: number)
```

### 方法

继承自 `String_` 的所有方法，加上：

#### term()

提取底层 Term 并将其作为具体类型返回。

```typescript
term(): Variable | Item | List
```

#### ground()

使用字典将此 Term 具体化 (Ground)，用值替换 Variable。

```typescript
ground(other: Term, scope?: string): Term | null
```

**参数：**

- `other`：表示字典的 Term（对列表）
- `scope` (可选)：用于 Variable 作用域的字符串

**返回值：** 具体化后的 Term，如果失败则返回 null。

**示例：**

```typescript
const a = new Term("`a");
const dict = new Term("((`a b))");
const result = a.ground(dict);
if (result !== null) {
    console.log(result.toString());  // "b"
}
```

#### match()

将两个 Term 进行合一，并返回合一结果作为字典。

```typescript
match(other: Term): Term | null
```

**参数：**

- `other`：要与此 Term 匹配的 Term

**返回值：** 表示合一字典（元组列表）的 Term，如果匹配失败则返回 null。

**示例：**

```typescript
const a = new Term("`a");
const b = new Term("b");
const result = a.match(b);
if (result !== null) {
    console.log(result.toString());  // "((1 2 `a b))"
}
```

#### rename()

通过添加前缀和后缀重命名此 Term 中的所有 Variable。

```typescript
rename(prefix_and_suffix: Term): Term | null
```

**参数：**

- `prefix_and_suffix`：格式为 `((prefix) (suffix))` 的 Term

**返回值：** 重命名后的 Term，如果重命名失败则返回 null。

**示例：**

```typescript
const term = new Term("`x");
const spec = new Term("((pre_) (_suf))");
const result = term.rename(spec);
if (result !== null) {
    console.log(result.toString());  // "`pre_x_suf"
}
```

---

## Rule

演绎系统中逻辑 Rule 的包装类。

### 构造函数

```typescript
constructor(value: string | Buffer | Rule, size?: number)
```

### 方法

继承自 `String_` 的所有方法，加上：

#### length()

获取 Rule 中的前提数量。

```typescript
length(): number
```

#### getitem()

通过索引获取前提 Term。

```typescript
getitem(index: number): Term
```

#### conclusion()

获取 Rule 的结论。

```typescript
conclusion(): Term
```

#### ground()

使用字典将此 Rule 具体化 (Ground)。

```typescript
ground(other: Rule, scope?: string): Rule | null
```

#### match()

使用合一将此 Rule 与另一个 Rule 匹配。

```typescript
match(other: Rule): Rule | null
```

**参数：**

- `other`：要匹配的 Rule（必须是没有前提的事实）

**返回值：** 匹配后的 Rule，如果匹配失败则返回 null。

**示例：**

```typescript
const mp = new Rule("(`p -> `q)\n`p\n`q\n");
const pq = new Rule("((! (! `x)) -> `x)");
const result = mp.match(pq);
if (result !== null) {
    console.log(result.toString());
    // "(! (! `x))\n----------\n`x\n"
}
```

#### rename()

重命名此 Rule 中的所有 Variable。

```typescript
rename(prefix_and_suffix: Rule): Rule | null
```

---

## Search

演绎系统的搜索引擎。

### 构造函数

```typescript
constructor(limit_size?: number, buffer_size?: number)
```

**参数：**

- `limit_size` (可选)：用于存储 Rule/事实的缓冲区大小（默认值：1000）
- `buffer_size` (可选)：用于内部操作的缓冲区大小（默认值：10000）

### 方法

#### set_limit_size()

设置存储最终对象的缓冲区大小。

```typescript
set_limit_size(limit_size: number): void
```

#### set_buffer_size()

设置内部操作的缓冲区大小。

```typescript
set_buffer_size(buffer_size: number): void
```

#### reset()

重置搜索引擎，清除所有 Rule 和事实。

```typescript
reset(): void
```

#### add()

向知识库添加 Rule 或事实。

```typescript
add(text: string): boolean
```

**返回值：** 如果添加成功则返回 true，否则返回 false。

#### execute()

执行搜索引擎，并为每个推导出的 Rule 调用回调。

```typescript
execute(callback: (candidate: Rule) => boolean): number
```

**参数：**

- `callback`：对每个候选 Rule 调用的函数。返回 false 继续，返回 true 停止。

**返回值：** 处理的 Rule 数量。

**示例：**

```typescript
const search = new Search(1000, 10000);
search.add("p q");  // p implies q
search.add("q r");  // q implies r
search.add("p");    // fact: p

search.execute((candidate) => {
    console.log(candidate.toString());
    return false;  // Continue searching
});
```

---

## 完整示例

这是一个演示大多数 TypeScript API 的完整示例：

```typescript
import { 
    buffer_size, 
    String_, 
    Variable, 
    Item, 
    List, 
    Term, 
    Rule, 
    Search 
} from "atsds";

// Configure buffer size
buffer_size(2048); 

// Create terms
const varX = new Variable("`X");
const item = new Item("hello");
const lst = new List("(a b c)");
const term = new Term("(f `x `y)");

console.log(`Variable: ${varX.toString()}, name: ${varX.name().toString()}`);
console.log(`Item: ${item.toString()}, name: ${item.name().toString()}`);
console.log(`List: ${lst.toString()}, length: ${lst.length()}`);
console.log(`Term: ${term.toString()}`);

// Work with rules
const fact = new Rule("(parent john mary)");
const rule = new Rule("(father `X `Y)\n----------\n(parent `X `Y)\n");

console.log(`\nFact: ${fact.toString()}`);
console.log(`Rule premises: ${rule.length()}, conclusion: ${rule.conclusion().toString()}`);

// Grounding
const termA = new Term("`a");
const dictionary = new Term("((`a hello))");
const grounded = termA.ground(dictionary);
if (grounded) {
    console.log(`\nGrounding 
 with ((
)): ${grounded.toString()}`);
}

// Matching
const mp = new Rule("(`p -> `q)\n`p\n`q\n");
const axiom = new Rule("((A) -> B)");
const matched = mp.match(axiom);
if (matched) {
    console.log(`\nMatching modus ponens with (A -> B):\n${matched.toString()}`);
}

// Search engine
const search = new Search(1000, 10000);
search.add("p q");  // p implies q
search.add("q r");  // q implies r
search.add("p");    // fact: p

console.log("\nRunning inference:");
for (let i = 0; i < 3; i++) {
    const count = search.execute((r) => {
        console.log(`  Derived: ${r.toString()}`);
        return false;
    });
    if (count === 0) break;
}

// Copying and comparison
const rule1 = new Rule("(a b c)");
const rule2 = rule1.copy();
console.log(`\nRule comparison: ${rule1.key() === rule2.key()}`);  // true
```
