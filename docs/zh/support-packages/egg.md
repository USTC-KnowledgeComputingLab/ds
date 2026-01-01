# E-Graph 支持包

E-Graph 支持包为 DS 演绎系统提供了 Term 等价类的有效管理和操作。

E-Graph (等价图) 是一种数据结构，可以有效地表示 Term 的等价类，并自动维护同余闭包。该实现遵循 egg 风格的方法，具有延迟重建功能以获得最佳性能。灵感来自 [egg 库](https://egraphs-good.github.io/)。

## 安装

::: code-group
```bash [TypeScript]
npm install atsds-egg
```
```bash [Python]
pip install apyds-egg
```
:::

    需要 Python 3.11-3.14。

## 用法

::: code-group
```typescript [TypeScript]
import { Term } from "atsds";
import { EGraph } from "atsds-egg";

// Create an E-Graph
const eg = new EGraph();

// Add terms to the E-Graph
const a = eg.add(new Term("a"));
const b = eg.add(new Term("b"));
const x = eg.add(new Term("x"));

// Add compound terms
const ax = eg.add(new Term("(+ a x)"));
const bx = eg.add(new Term("(+ b x)"));

// Initially, (+ a x) and (+ b x) are in different E-classes
if (eg.find(ax) === eg.find(bx)) throw new Error("Should be different");

// Merge a and b
eg.merge(a, b);

// Rebuild to restore congruence
eg.rebuild();

// Now (+ a x) and (+ b x) are in the same E-class
if (eg.find(ax) !== eg.find(bx)) throw new Error("Should be same");
```
```python [Python]
import apyds
from apyds_egg import EGraph

# Create an E-Graph
eg = EGraph()

# Add terms to the E-Graph
a = eg.add(apyds.Term("a"))
b = eg.add(apyds.Term("b"))
x = eg.add(apyds.Term("x"))

# Add compound terms
ax = eg.add(apyds.Term("(+ a x)"))
bx = eg.add(apyds.Term("(+ b x)"))

# Initially, (+ a x) and (+ b x) are in different E-classes
assert eg.find(ax) != eg.find(bx)

# Merge a and b
eg.merge(a, b)

# Rebuild to restore congruence
eg.rebuild()

# Now (+ a x) and (+ b x) are in the same E-class
assert eg.find(ax) == eg.find(bx)
```
:::

### 同余闭包 (Congruence Closure)

E-Graph 自动维护同余闭包。当两个 E-Class 合并时，`rebuild()` 方法确保所有同余 Term 保持在同一个 E-Class 中。

::: code-group
```typescript [TypeScript]
import { Term } from "atsds";
import { EGraph } from "atsds-egg";

const eg = new EGraph();

// Add terms with nested structure
const fa = eg.add(new Term("(f a)"));
const fb = eg.add(new Term("(f b)"));
const gfa = eg.add(new Term("(g (f a))"));
const gfb = eg.add(new Term("(g (f b))"));

// Merge a and b
const a = eg.add(new Term("a"));
const b = eg.add(new Term("b"));
eg.merge(a, b);

// Rebuild propagates equivalence
eg.rebuild();

// Now all derived terms are equivalent
if (eg.find(fa) !== eg.find(fb)) throw new Error("fa != fb");
if (eg.find(gfa) !== eg.find(gfb)) throw new Error("gfa != gfb");
```
```python [Python]
eg = EGraph()

# Add terms with nested structure
fa = eg.add(apyds.Term("(f a)"))
fb = eg.add(apyds.Term("(f b)"))
gfa = eg.add(apyds.Term("(g (f a))"))
gfb = eg.add(apyds.Term("(g (f b))"))

# Merge a and b
a = eg.add(apyds.Term("a"))
b = eg.add(apyds.Term("b"))
eg.merge(a, b)

# Rebuild propagates equivalence
eg.rebuild()

# Now all derived terms are equivalent
assert eg.find(fa) == eg.find(fb)
assert eg.find(gfa) == eg.find(gfb)
```
:::

## 核心概念

### E-Graph 结构

E-Graph 由几个关键组件组成：

- **E-Node**：表示具有操作符和子节点的 Term
- **E-Class**：E-Node 的等价类
- **Hash-consing**：通过将相同的节点映射到同一个 E-Class 来确保 E-Node 的唯一性
- **并查集 (Union-Find)**：管理 E-Class 的等价关系
- **Parents**：跟踪哪些 Term 依赖于每个 E-Class
- **Worklist**：管理延迟的同余重建

### 延迟重建 (Deferred Rebuilding)

该实现使用 egg 风格的延迟重建：

1. **Merge**：合并两个 E-Class 并添加到 Worklist
2. **Rebuild**：处理 Worklist 以恢复同余
3. **Repair**：重新规范化父节点并合并同余节点

这种方法通过批量处理同余更新，提供了比立即重建更好的性能。

### 添加 Term

Term 被转换为 E-Node 并添加到 E-Graph 中：

- **Item（常量/函子）和 Variable**：原子 Term 如 `a`, `b`，或以反引号为前缀的 variable 如 `x`，表示为没有子节点的 E-Node
- **List**：复合 Term 如 `(+ a b)` 表示为操作符为 `"()"` 且每个列表元素都有子节点的 E-Node

Hash-consing 机制确保相同的 E-Node 共享相同的 E-Class ID。

## API 参考

### TypeScript (atsds-egg)

- `new EGraph()`: 创建一个新的 E-Graph
- `add(term: atsds.Term): EClassId`: 向 E-Graph 添加一个 Term
- `merge(a: EClassId, b: EClassId): EClassId`: 合并两个 E-Class
- `rebuild(): void`: 恢复同余闭包
- `find(eclass: EClassId): EClassId`: 查找规范的 E-Class 代表

### Python (apyds-egg)

- `EGraph()`: 创建一个新的 E-Graph
- `add(term: apyds.Term) -> EClassId`: 向 E-Graph 添加一个 Term
- `merge(a: EClassId, b: EClassId) -> EClassId`: 合并两个 E-Class
- `rebuild() -> None`: 恢复同余闭包
- `find(eclass: EClassId) -> EClassId`: 查找规范的 E-Class 代表

## 包信息

- **Python 包**: [apyds-egg](https://pypi.org/project/apyds-egg/)
- **npm 包**: [atsds-egg](https://www.npmjs.com/package/atsds-egg)
- **源代码**: [GitHub - egg 目录](https://github.com/USTC-KnowledgeComputingLab/ds/tree/main/egg)
