# BNF 支持包

BNF 支持包提供了 DS 两种语法格式之间的双向转换：

- **Ds**：DS 内部使用的 S-表达式（类 Lisp）语法
- **Dsp**：传统的、带有中缀操作符的人类可读语法

该包允许您使用更自然、更数学化的符号编写逻辑 Rule，并将其转换为 DS 内部格式，反之亦然。

## 安装

::: code-group
```bash [TypeScript]
npm install atsds-bnf
```
```bash [Python]
pip install apyds-bnf
```
:::

    需要 Python 3.11-3.14。

## 用法

::: code-group
```javascript [TypeScript]
import { parse, unparse } from "atsds-bnf";

// Parse: Convert from readable Dsp to DS format
const dsp_input = "a, b => c";
const ds_output = parse(dsp_input);
console.log(ds_output);
// Output:
// a
// b
// ----
// c

// Unparse: Convert from DS format to readable Dsp
const ds_input = "a\nb\n----\nc\n";
const dsp_output = unparse(ds_input);
console.log(dsp_output);
// Output: a, b => c
```
```python [Python]
from apyds_bnf import parse, unparse

# Parse: Convert from readable Dsp to DS format
dsp_input = "a, b => c"
ds_output = parse(dsp_input)
print(ds_output)
# Output:
# a
# b
# ----
# c

# Unparse: Convert from DS format to readable Dsp
ds_input = "a\nb\n----\nc\n"
dsp_output = unparse(ds_input)
print(dsp_output)
# Output: a, b => c
```
:::

## 语法格式

### Ds 格式 (内部)

Ds 格式使用 S-表达式（类 Lisp 语法）来表示逻辑 Rule：

```
premise1
premise2
----------
conclusion
```

对于结构化 Term：

- 函数：`(function f a b)`
- 下标：`(subscript a i j)`
- 二元操作符：`(binary + a b)`
- 一元操作符：`(unary ~ a)`

### Dsp 格式 (人类可读)

Dsp 格式使用传统的数学符号：

```
premise1, premise2 => conclusion
```

对于结构化 Term：

- 函数：`f(a, b)`
- 下标：`a[i, j]`
- 二元操作符：`(a + b)` (带括号)
- 一元操作符：`(~ a)` (带括号)

### 语法比较

| 描述 | Dsp 格式 | Ds 格式 |
|-------------|------------|-----------|
| 简单 Rule | `a, b => c` | `a\nb\n----\nc\n` | 
| 公理 | `a` | `----\na\n` | 
| 函数调用 | `f(a, b) => c` | `(function f a b)\n----------------\nc\n` | 
| 下标 | `a[i, j] => b` | `(subscript a i j)\n-----------------\nb\n` | 
| 二元操作符 | `(a + b) => c` | `(binary + a b)\n--------------\nc\n` | 
| 一元操作符 | `~ a => b` | `(unary ~ a)\n-----------\nb\n` | 
| 复杂表达式 | `((a + b) * c), d[i] => f(g, h)` | `(binary * (binary + a b) c)\n(subscript d i)\n---------------------------\n(function f g h)\n` |

## 包信息

- **Python 包**: [apyds-bnf](https://pypi.org/project/apyds-bnf/)
- **npm 包**: [atsds-bnf](https://www.npmjs.com/package/atsds-bnf)
- **源代码**: [GitHub - bnf 目录](https://github.com/USTC-KnowledgeComputingLab/ds/tree/main/bnf)
