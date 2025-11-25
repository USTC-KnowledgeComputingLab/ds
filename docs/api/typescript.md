# TypeScript API Reference

The TypeScript API is available through the `atsds` npm package.

```typescript
import { 
    buffer_size,
    string_t, 
    variable_t, 
    item_t, 
    list_t, 
    term_t, 
    rule_t, 
    search_t 
} from "atsds";
```

## buffer_size

Gets the current buffer size, or sets a new buffer size and returns the previous value.

```typescript
function buffer_size(size?: number): number;
```

**Parameters:**

- `size` (optional): The new buffer size to set. If 0 or omitted, returns current size without modification.

**Returns:** The previous buffer size value.

**Example:**

```typescript
const currentSize = buffer_size();     // Get current size
const oldSize = buffer_size(2048);     // Set new size, returns old size
```

---

## string_t

Wrapper class for deductive system strings.

### Constructor

```typescript
constructor(value: string | Buffer | string_t, size?: number)
```

**Parameters:**

- `value`: Initial value (string, buffer, or another string_t)
- `size` (optional): Buffer capacity for internal storage

### Methods

#### toString()

Convert the value to a string representation.

```typescript
toString(): string
```

#### data()

Get the binary representation of the value.

```typescript
data(): Buffer
```

#### size()

Get the size of the data in bytes.

```typescript
size(): number
```

#### copy()

Create a deep copy of this instance.

```typescript
copy(): string_t
```

#### key()

Get a key representation for equality comparison.

```typescript
key(): string
```

**Example:**

```typescript
const str1 = new string_t("hello");
const str2 = new string_t(str1.data());
console.log(str1.toString());  // "hello"
```

---

## variable_t

Wrapper class for logical variables in the deductive system.

### Constructor

```typescript
constructor(value: string | Buffer | variable_t, size?: number)
```

**Parameters:**

- `value`: Initial value (string starting with backtick, buffer, or another variable_t)
- `size` (optional): Buffer capacity for internal storage

### Methods

Inherits all methods from `string_t`, plus:

#### name()

Get the name of this variable (without the backtick prefix).

```typescript
name(): string_t
```

**Example:**

```typescript
const var1 = new variable_t("`X");
console.log(var1.name().toString());  // "X"
console.log(var1.toString());         // "`X"
```

---

## item_t

Wrapper class for items (constants/functors) in the deductive system.

### Constructor

```typescript
constructor(value: string | Buffer | item_t, size?: number)
```

### Methods

Inherits all methods from `string_t`, plus:

#### name()

Get the name of this item.

```typescript
name(): string_t
```

**Example:**

```typescript
const item = new item_t("atom");
console.log(item.name().toString());  // "atom"
```

---

## list_t

Wrapper class for lists in the deductive system.

### Constructor

```typescript
constructor(value: string | Buffer | list_t, size?: number)
```

### Methods

Inherits all methods from `string_t`, plus:

#### length()

Get the number of elements in the list.

```typescript
length(): number
```

#### getitem()

Get an element from the list by index.

```typescript
getitem(index: number): term_t
```

**Example:**

```typescript
const list = new list_t("(a b c)");
console.log(list.length());           // 3
console.log(list.getitem(0).toString());  // "a"
```

---

## term_t

Wrapper class for logical terms in the deductive system. A term can be a variable, item, or list.

### Constructor

```typescript
constructor(value: string | Buffer | term_t, size?: number)
```

### Methods

Inherits all methods from `string_t`, plus:

#### term()

Extracts the underlying term and returns it as its concrete type.

```typescript
term(): variable_t | item_t | list_t
```

#### ground()

Ground this term using a dictionary to substitute variables with values.

```typescript
ground(other: term_t, scope?: string): term_t | null
```

**Parameters:**

- `other`: A term representing a dictionary (list of pairs)
- `scope` (optional): Scope string for variable scoping

**Returns:** The grounded term, or null if grounding fails.

**Example:**

```typescript
const a = new term_t("`a");
const dict = new term_t("((`a b))");
console.log(a.ground(dict)?.toString());  // "b"
```

#### rename()

Rename all variables in this term by adding prefix and suffix.

```typescript
rename(prefix_and_suffix: term_t): term_t | null
```

**Parameters:**

- `prefix_and_suffix`: A term with format `((prefix) (suffix))`

**Returns:** The renamed term, or null if renaming fails.

**Example:**

```typescript
const term = new term_t("`x");
const spec = new term_t("((pre_) (_suf))");
console.log(term.rename(spec)?.toString());  // "`pre_x_suf"
```

---

## rule_t

Wrapper class for logical rules in the deductive system.

### Constructor

```typescript
constructor(value: string | Buffer | rule_t, size?: number)
```

### Methods

Inherits all methods from `string_t`, plus:

#### length()

Get the number of premises in the rule.

```typescript
length(): number
```

#### getitem()

Get a premise term by index.

```typescript
getitem(index: number): term_t
```

#### conclusion()

Get the conclusion of the rule.

```typescript
conclusion(): term_t
```

#### ground()

Ground this rule using a dictionary.

```typescript
ground(other: rule_t, scope?: string): rule_t | null
```

#### match()

Match this rule with another rule using unification.

```typescript
match(other: rule_t): rule_t | null
```

**Parameters:**

- `other`: The rule to match against (must be a fact without premises)

**Returns:** The matched rule, or null if matching fails.

**Example:**

```typescript
const mp = new rule_t("(`p -> `q)\n`p\n`q\n");
const pq = new rule_t("((! (! `x)) -> `x)");
console.log(mp.match(pq)?.toString());
// "(! (! `x))\n----------\n`x\n"
```

#### rename()

Rename all variables in this rule.

```typescript
rename(prefix_and_suffix: rule_t): rule_t | null
```

---

## search_t

Search engine for the deductive system.

### Constructor

```typescript
constructor(limit_size?: number, buffer_size?: number)
```

**Parameters:**

- `limit_size` (optional): Size of the buffer for storing rules/facts (default: 1000)
- `buffer_size` (optional): Size of the buffer for internal operations (default: 10000)

### Methods

#### set_limit_size()

Set the size of the buffer for storing final objects.

```typescript
set_limit_size(limit_size: number): void
```

#### set_buffer_size()

Set the buffer size for internal operations.

```typescript
set_buffer_size(buffer_size: number): void
```

#### reset()

Reset the search engine, clearing all rules and facts.

```typescript
reset(): void
```

#### add()

Add a rule or fact to the knowledge base.

```typescript
add(text: string): boolean
```

**Returns:** True if successfully added, false otherwise.

#### execute()

Execute the search engine with a callback for each inferred rule.

```typescript
execute(callback: (candidate: rule_t) => boolean): number
```

**Parameters:**

- `callback`: Function called for each candidate rule. Return false to continue, true to stop.

**Returns:** The number of rules processed.

**Example:**

```typescript
const search = new search_t(1000, 10000);
search.add("(`P -> `Q) `P `Q");
search.add("(! (! X))");

search.execute((candidate) => {
    console.log(candidate.toString());
    return false;  // Continue searching
});
```
