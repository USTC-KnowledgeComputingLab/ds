# C++ API 参考

本页记录了 DS 库的 C++ API。文档由 C++ 源代码生成。

所有类和函数都在 `ds` 命名空间中。

## 头文件

```cpp
#include <ds/ds.hh>        // 所有基本类型
#include <ds/search.hh>    // 搜索引擎
#include <ds/utility.hh>   // 辅助函数
```

---

## string_t

字符串处理类。定义在 `<ds/string.hh>` 中。

### 方法

#### data_size()

获取字符串数据的大小（以字节为单位）。

```cpp
length_t data_size();
```

#### head()

获取指向第一个字节的指针。

```cpp
std::byte* head();
```

#### tail()

获取指向最后一个字节之后的指针。

```cpp
std::byte* tail();
```

#### print()

将字符串输出到缓冲区。

```cpp
char* print(char* buffer, char* check_tail = nullptr);
```

#### scan()

从缓冲区读取字符串。

```cpp
const char* scan(const char* buffer, std::byte* check_tail = nullptr);
```

---

## variable_t

逻辑 Variable 类。定义在 `<ds/variable.hh>` 中。

Variable 表示可以与其他 Term 进行合一的占位符。

### 方法

#### name()

获取 Variable 的名称（不带反引号前缀）。

```cpp
string_t* name();
```

#### data_size()

获取 Variable 数据的大小（以字节为单位）。

```cpp
length_t data_size();
```

#### head() / tail()

获取指向数据边界的指针。

```cpp
std::byte* head();
std::byte* tail();
```

#### print() / scan()

输入/输出操作。

```cpp
char* print(char* buffer, char* check_tail = nullptr);
const char* scan(const char* buffer, std::byte* check_tail = nullptr);
```

---

## item_t

Item（常量/函子）类。定义在 `<ds/item.hh>` 中。

Item 表示原子值或函数符号。

### 方法

#### name()

获取 Item 的名称。

```cpp
string_t* name();
```

#### data_size()

获取 Item 数据的大小（以字节为单位）。

```cpp
length_t data_size();
```

#### head() / tail()

获取指向数据边界的指针。

```cpp
std::byte* head();
std::byte* tail();
```

#### print() / scan()

输入/输出操作。

```cpp
char* print(char* buffer, char* check_tail = nullptr);
const char* scan(const char* buffer, std::byte* check_tail = nullptr);
```

---

## list_t

List 类。定义在 `<ds/list.hh>` 中。

List 包含 Term 的有序序列。

### 方法

#### length()

获取 List 中的元素数量。

```cpp
length_t length();
```

#### getitem()

通过索引获取元素。

```cpp
term_t* getitem(length_t index);
```

#### data_size()

获取 List 数据的大小（以字节为单位）。

```cpp
length_t data_size();
```

#### head() / tail()

获取指向数据边界的指针。

```cpp
std::byte* head();
std::byte* tail();
```

#### print() / scan()

输入/输出操作。

```cpp
char* print(char* buffer, char* check_tail = nullptr);
const char* scan(const char* buffer, std::byte* check_tail = nullptr);
```

---

## term_t

通用 Term 类。定义在 `<ds/term.hh>` 中。

一个 Term 可以是 Variable、Item 或 List。

### 枚举：term_type_t

```cpp
enum class term_type_t : min_uint_t {
    null = 0,
    variable = 1,
    item = 2,
    list = 3
};
```

### 方法

#### get_type()

获取此 Term 的类型。

```cpp
term_type_t get_type();
```

#### is_null()

检查 Term 是否为 null。

```cpp
bool is_null();
```

#### variable() / item() / list()

获取作为特定类型的底层值。如果 Term 不是该类型，则返回 nullptr。

```cpp
variable_t* variable();
item_t* item();
list_t* list();
```

#### set_type() / set_null() / set_variable() / set_item() / set_list()

设置 Term 类型。

```cpp
term_t* set_type(term_type_t type, std::byte* check_tail = nullptr);
term_t* set_null(std::byte* check_tail = nullptr);
term_t* set_variable(std::byte* check_tail = nullptr);
term_t* set_item(std::byte* check_tail = nullptr);
term_t* set_list(std::byte* check_tail = nullptr);
```

#### data_size()

获取 Term 数据的大小（以字节为单位）。

```cpp
length_t data_size();
```

#### head() / tail()

获取指向数据边界的指针。

```cpp
std::byte* head();
std::byte* tail();
```

#### print() / scan()

输入/输出操作。

```cpp
char* print(char* buffer, char* check_tail = nullptr);
const char* scan(const char* buffer, std::byte* check_tail = nullptr);
```

#### ground()

使用字典将此 Term 具体化 (Ground)，替换 Variable。

```cpp
term_t* ground(term_t* term, term_t* dictionary, const char* scope, 
               std::byte* check_tail = nullptr);
```

#### match()

将两个 Term 进行合一并生成合一字典。

```cpp
term_t* match(term_t* term_1, term_t* term_2, 
              const char* scope_1, const char* scope_2, 
              std::byte* check_tail = nullptr);
```

#### rename()

通过添加前缀和后缀重命名 Variable。

```cpp
term_t* rename(term_t* term, term_t* prefix_and_suffix, 
               std::byte* check_tail = nullptr);
```

---

## rule_t

逻辑 Rule 类。定义在 `<ds/rule.hh>` 中。

一条 Rule 由前提和结论组成。

### 方法

#### conclusion()

获取 Rule 的结论。

```cpp
term_t* conclusion();
```

#### only_conclusion()

仅当没有前提时获取结论。否则返回 nullptr。

```cpp
term_t* only_conclusion();
```

#### premises()

通过索引获取前提。

```cpp
term_t* premises(length_t index);
```

#### premises_count()

获取前提的数量。

```cpp
length_t premises_count();
```

#### valid()

检查 Rule 是否有效。

```cpp
bool valid();
```

#### data_size()

获取 Rule 数据的大小（以字节为单位）。

```cpp
length_t data_size();
```

#### head() / tail()

获取指向数据边界的指针。

```cpp
std::byte* head();
std::byte* tail();
```

#### print() / scan()

输入/输出操作。

```cpp
char* print(char* buffer, char* check_tail = nullptr);
const char* scan(const char* buffer, std::byte* check_tail = nullptr);
```

#### ground()

使用字典将此 Rule 具体化 (Ground)。

```cpp
rule_t* ground(rule_t* rule, term_t* dictionary, const char* scope, 
               std::byte* check_tail = nullptr);
rule_t* ground(rule_t* rule, rule_t* dictionary, const char* scope, 
               std::byte* check_tail = nullptr);
```

#### match()

将此 Rule 与事实进行匹配。

```cpp
rule_t* match(rule_t* rule_1, rule_t* rule_2, 
              std::byte* check_tail = nullptr);
```

#### rename()

重命名此 Rule 中的 Variable。

```cpp
rule_t* rename(rule_t* rule, rule_t* prefix_and_suffix, 
               std::byte* check_tail = nullptr);
```

---

## search_t

搜索引擎类。定义在 `<ds/search.hh>` 中。

管理知识库并执行逻辑推理。

### 构造函数

```cpp
search_t(length_t limit_size, length_t buffer_size);
```

**参数：**

- `limit_size`：每个存储的 Rule/事实的最大大小
- `buffer_size`：操作的内部缓冲区大小

### 方法

#### set_limit_size()

设置最大 Rule/事实大小。

```cpp
void set_limit_size(length_t limit_size);
```

#### set_buffer_size()

设置内部缓冲区大小。

```cpp
void set_buffer_size(length_t buffer_size);
```

#### reset()

清除所有 Rule 和事实。

```cpp
void reset();
```

#### add()

从文本添加 Rule 或事实。

```cpp
bool add(std::string_view text);
```

#### execute()

执行一轮推理。

```cpp
length_t execute(const std::function<bool(rule_t*)>& callback);
```

**参数：**

- `callback`：对每个新推理调用的函数。返回 false 继续，返回 true 停止。

**返回值：** 生成的新推理数量。

---

## 辅助函数

`<ds/utility.hh>` 中的辅助函数。

### text_to_term()

将文本解析为 Term 对象。

```cpp
std::unique_ptr<term_t> text_to_term(const char* text, length_t length);
```

**参数：**

- `text`：Term 的文本表示
- `length`：生成的二进制 Term 的最大大小

**返回值：** 指向创建的 Term 的 unique_ptr，如果超过长度则返回 nullptr。

### term_to_text()

将 Term 对象转换为文本。

```cpp
std::unique_ptr<char> term_to_text(term_t* term, length_t length);
```

**参数：**

- `term`：要转换的二进制 Term
- `length`：生成的文本的最大大小

**返回值：** 指向文本的 unique_ptr，如果超过长度则返回 nullptr。

### text_to_rule()

将文本解析为 Rule 对象。

```cpp
std::unique_ptr<rule_t> text_to_rule(const char* text, length_t length);
```

**参数：**

- `text`：Rule 的文本表示
- `length`：生成的二进制 Rule 的最大大小

**返回值：** 指向创建的 Rule 的 unique_ptr，如果超过长度则返回 nullptr。

### rule_to_text()

将 Rule 对象转换为文本。

```cpp
std::unique_ptr<char> rule_to_text(rule_t* rule, length_t length);
```

**参数：**

- `rule`：要转换的二进制 Rule
- `length`：生成的文本的最大大小

**返回值：** 指向文本的 unique_ptr，如果超过长度则返回 nullptr。

---

## 完整示例

这是一个演示 C++ API 的完整示例：

```cpp
#include <ds/ds.hh>
#include <ds/search.hh>
#include <ds/utility.hh>
#include <cstring>
#include <iostream>

int main() {
    const int buffer_size = 1000;
    
    // Create terms using utility functions
    auto term = ds::text_to_term("(f `x `y)", buffer_size);
    
    std::cout << "Term: " << ds::term_to_text(term.get(), buffer_size).get() << std::endl;
    
    // Work with rules
    auto fact = ds::text_to_rule("(parent john mary)", buffer_size);
    auto rule = ds::text_to_rule("(father `X `Y)\n----------\n(parent `X `Y)\n", buffer_size);
    
    std::cout << "\nFact:\n" << ds::rule_to_text(fact.get(), buffer_size).get();
    std::cout << "Rule premises: " << rule->premises_count() << std::endl;
    std::cout << "Rule conclusion: " << ds::term_to_text(rule->conclusion(), buffer_size).get() << std::endl;
    
    // Search engine
    ds::search_t search(1000, 10000);
    
    // Add rules and facts
    search.add("p q");  // p implies q
    search.add("q r");  // q implies r
    search.add("p");    // fact: p
    
    std::cout << "\nRunning inference:" << std::endl;
    
    // Execute search
    auto target = ds::text_to_rule("r", buffer_size);
    bool found = false;
    
    while (!found) {
        auto count = search.execute([&](ds::rule_t* candidate) {
            std::cout << "  Derived: " << ds::rule_to_text(candidate, buffer_size).get();
            
            // Check if this is our target
            if (candidate->data_size() == target->data_size() &&
                memcmp(candidate->head(), target->head(), candidate->data_size()) == 0) {
                found = true;
                return true;  // Stop
            }
            return false;  // Continue
        });
        
        if (count == 0) {
            std::cout << "  (no more inferences)" << std::endl;
            break;
        }
    }
    
    if (found) {
        std::cout << "Target found!" << std::endl;
    }
    
    return 0;
}
```
