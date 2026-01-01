---
layout: home

hero:
  name: "DS"
  text: "一个演绎系统"
  tagline: 一个用于逻辑推理的演绎系统，使用 C++ 实现，并提供 Python 和 TypeScript/JavaScript 的绑定
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/getting-started/quickstart
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/USTC-KnowledgeComputingLab/ds

features:
  - title: 多语言支持
    details: 在 C++、Python 或 TypeScript/JavaScript 中无缝使用同一个演绎系统。
  - title: WebAssembly 性能
    details: 通过 Emscripten 在浏览器或 Node.js 中运行高性能演绎系统。
  - title: 丰富的逻辑 Term
    details: 对 Variable、Item 和嵌套 List 的全面支持。
  - title: 基于 Rule 的推理
    details: 用于定义 Rule 和事实以执行复杂逻辑推演的灵活框架。
  - title: 合一引擎
    details: 强大的内置机制，用于 Term 合一和 Rule 匹配。
  - title: 自动搜索
    details: 内置搜索引擎，用于迭代推理。
---

## 支持的语言

::: code-group
```typescript [TypeScript]
import { Term } from "atsds";

const term = new Term("(hello world)");
console.log(term.toString());
// Output: (hello world)
```
```python [Python]
import apyds

term = apyds.Term("(hello world)")
print(term)  # (hello world)
```
```cpp [C++]
#include <ds/ds.hh>
#include <ds/utility.hh>
#include <iostream>

int main() {
    auto term = ds::text_to_term("(hello world)", 1000);
    std::cout << ds::term_to_text(term.get(), 1000).get() << std::endl;
    return 0;
}
```
:::

## 快速链接

- **[安装](getting-started/installation.md)** - 为您偏好的语言安装 DS
- **[快速开始](getting-started/quickstart.md)** - 在几分钟内启动并运行
- **[核心概念](concepts/terms.md)** - 了解 Term、Rule 和推理
- **[API 参考](api/typescript.md)** - 完整的 API 文档
- **[示例](examples/basic.md)** - 可运行的代码示例

## 许可证

本项目采用 GNU 通用公共许可证 v3.0 或更高版本授权。
