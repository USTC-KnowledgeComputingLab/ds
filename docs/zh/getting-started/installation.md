# 安装

DS 可以为 TypeScript/JavaScript、Python 安装，或直接作为 C++ 库使用。

## TypeScript/JavaScript

TypeScript/JavaScript 包 `atsds` 通过 WebAssembly 封装了 C++ 核心。

```bash
npm install atsds
```

该包包含：

- WebAssembly 二进制文件 (`.wasm`)
- TypeScript 类型定义 (`.d.mts`)
- ES 模块支持

### 要求

- Node.js 20+ 或支持 WebAssembly 的现代浏览器

### 浏览器用法

该包适用于支持 WebAssembly 的浏览器：

```html
<script type="module">
  import { Term } from "https://unpkg.com/atsds/dist/index.mjs";
  
  const term = new Term("(hello world)");
  console.log(term.toString());
</script>
```

## Python

Python 包 `apyds` 通过 pybind11 封装了 C++ 核心。

```bash
pip install apyds
```

### 要求

- Python 3.11-3.14
- 已为常见平台（Linux, macOS, Windows）提供预编译的 Wheel 包

### 虚拟环境（推荐）

推荐使用虚拟环境：

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install apyds
```

### 开发安装

要从源码安装并包含开发依赖：

```bash
git clone https://github.com/USTC-KnowledgeComputingLab/ds.git
cd ds
uv sync --extra dev
```

## C++

C++ 库是核心实现。Python 和 TypeScript 绑定都建立在其之上。

### 先决条件

- 兼容 C++20 的编译器 (GCC 10+, Clang 10+, MSVC 2019+)
- CMake 3.30+

### 使用 vcpkg

克隆仓库并使用覆盖端口 (overlay port)：

```bash
git clone https://github.com/USTC-KnowledgeComputingLab/ds.git
vcpkg install ds --overlay-ports=./ds/ports
```

添加到你的 `vcpkg.json`：

```json
{
  "dependencies": ["ds"]
}
```

在你的 CMakeLists.txt 中：

```cmake
find_package(ds CONFIG REQUIRED)
target_link_libraries(your_target PRIVATE ds::ds)
```

### 从源码构建

```bash
git clone https://github.com/USTC-KnowledgeComputingLab/ds.git
cd ds
cmake -B build
cmake --build build
```

### 在你的项目中使用

在你的 C++ 项目中包含 `include/ds/` 下的头文件：

```cpp
#include <ds/ds.hh>
#include <ds/search.hh>
```

链接构建生成的 `ds` 静态库。

## 构建所有组件

要从源码构建所有语言绑定：

### TypeScript/JavaScript (需要 Emscripten)

```bash
# Install Emscripten SDK first
# https://emscripten.org/docs/getting_started/downloads.html

npm install
npm run build
```

### Python

```bash
uv sync --extra dev
```

### C++

```bash
cmake -B build
cmake --build build
```

## 运行测试

安装后，你可以通过运行测试来验证一切正常：

### TypeScript/JavaScript 测试

```bash
npm test
```

### Python 测试

```bash
uv run pytest
```

### C++ 测试

```bash
cd build
ctest
```

## 验证安装

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
