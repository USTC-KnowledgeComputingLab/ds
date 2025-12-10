# TypeScript API Reference

This page documents the TypeScript API for the `atsds` package. The documentation is generated from the TypeScript source code.

```typescript
import { 
    bufferSize,
    StringT, 
    VariableT, 
    ItemT, 
    ListT, 
    TermT, 
    RuleT, 
    SearchT 
} from "atsds";
```

## bufferSize

Gets the current buffer size, or sets a new buffer size and returns the previous value.

```typescript
function bufferSize(size?: number): number;
```

**Parameters:**

- `size` (optional): The new buffer size to set. If 0 or omitted, returns current size without modification.

**Returns:** The previous buffer size value.

**Example:**

```typescript
const currentSize = bufferSize();     // Get current size
const oldSize = bufferSize(2048);     // Set new size, returns old size
```

---

## StringT

Wrapper class for deductive system strings.

### Constructor

```typescript
constructor(value: string | Buffer | StringT, size?: number)
```

**Parameters:**

- `value`: Initial value (string, buffer, or another StringT)
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
copy(): StringT
```

#### key()

Get a key representation for equality comparison.

```typescript
key(): string
```

**Example:**

```typescript
const str1 = new StringT("hello");
const str2 = new StringT(str1.data());
console.log(str1.toString());  // "hello"
```

---

## VariableT

Wrapper class for logical variables in the deductive system.

### Constructor

```typescript
constructor(value: string | Buffer | VariableT, size?: number)
```

**Parameters:**

- `value`: Initial value (string starting with backtick, buffer, or another VariableT)
- `size` (optional): Buffer capacity for internal storage

### Methods

Inherits all methods from `StringT`, plus:

#### name()

Get the name of this variable (without the backtick prefix).

```typescript
name(): StringT
```

**Example:**

```typescript
const var1 = new VariableT("`X");
console.log(var1.name().toString());  // "X"
console.log(var1.toString());         // "`X"
```

---

## ItemT

Wrapper class for items (constants/functors) in the deductive system.

### Constructor

```typescript
constructor(value: string | Buffer | ItemT, size?: number)
```

### Methods

Inherits all methods from `StringT`, plus:

#### name()

Get the name of this item.

```typescript
name(): StringT
```

**Example:**

```typescript
const item = new ItemT("atom");
console.log(item.name().toString());  // "atom"
```

---

## ListT

Wrapper class for lists in the deductive system.

### Constructor

```typescript
constructor(value: string | Buffer | ListT, size?: number)
```

### Methods

Inherits all methods from `StringT`, plus:

#### length()

Get the number of elements in the list.

```typescript
length(): number
```

#### getitem()

Get an element from the list by index.

```typescript
getitem(index: number): TermT
```

**Example:**

```typescript
const list = new ListT("(a b c)");
console.log(list.length());           // 3
console.log(list.getitem(0).toString());  // "a"
```

---

## TermT

Wrapper class for logical terms in the deductive system. A term can be a variable, item, or list.

### Constructor

```typescript
constructor(value: string | Buffer | TermT, size?: number)
```

### Methods

Inherits all methods from `StringT`, plus:

#### term()

Extracts the underlying term and returns it as its concrete type.

```typescript
term(): VariableT | ItemT | ListT
```

#### ground()

Ground this term using a dictionary to substitute variables with values.

```typescript
ground(other: TermT, scope?: string): TermT | null
```

**Parameters:**

- `other`: A term representing a dictionary (list of pairs)
- `scope` (optional): Scope string for variable scoping

**Returns:** The grounded term, or null if grounding fails.

**Example:**

```typescript
const a = new TermT("`a");
const dict = new TermT("((`a b))");
const result = a.ground(dict);
if (result !== null) {
    console.log(result.toString());  // "b"
}
```

#### rename()

Rename all variables in this term by adding prefix and suffix.

```typescript
rename(prefix_and_suffix: TermT): TermT | null
```

**Parameters:**

- `prefix_and_suffix`: A term with format `((prefix) (suffix))`

**Returns:** The renamed term, or null if renaming fails.

**Example:**

```typescript
const term = new TermT("`x");
const spec = new TermT("((pre_) (_suf))");
const result = term.rename(spec);
if (result !== null) {
    console.log(result.toString());  // "`pre_x_suf"
}
```

---

## RuleT

Wrapper class for logical rules in the deductive system.

### Constructor

```typescript
constructor(value: string | Buffer | RuleT, size?: number)
```

### Methods

Inherits all methods from `StringT`, plus:

#### length()

Get the number of premises in the rule.

```typescript
length(): number
```

#### getitem()

Get a premise term by index.

```typescript
getitem(index: number): TermT
```

#### conclusion()

Get the conclusion of the rule.

```typescript
conclusion(): TermT
```

#### ground()

Ground this rule using a dictionary.

```typescript
ground(other: RuleT, scope?: string): RuleT | null
```

#### match()

Match this rule with another rule using unification.

```typescript
match(other: RuleT): RuleT | null
```

**Parameters:**

- `other`: The rule to match against (must be a fact without premises)

**Returns:** The matched rule, or null if matching fails.

**Example:**

```typescript
const mp = new RuleT("(`p -> `q)\n`p\n`q\n");
const pq = new RuleT("((! (! `x)) -> `x)");
const result = mp.match(pq);
if (result !== null) {
    console.log(result.toString());
    // "(! (! `x))\n----------\n`x\n"
}
```

#### rename()

Rename all variables in this rule.

```typescript
rename(prefix_and_suffix: RuleT): RuleT | null
```

---

## SearchT

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
execute(callback: (candidate: RuleT) => boolean): number
```

**Parameters:**

- `callback`: Function called for each candidate rule. Return false to continue, true to stop.

**Returns:** The number of rules processed.

**Example:**

```typescript
const search = new SearchT(1000, 10000);
search.add("(`P -> `Q) `P `Q");
search.add("(! (! X))");

search.execute((candidate) => {
    console.log(candidate.toString());
    return false;  // Continue searching
});
```

---

## Complete Example

Here's a complete example demonstrating most of the TypeScript API:

```typescript
import { 
    bufferSize, 
    StringT, 
    VariableT, 
    ItemT, 
    ListT, 
    TermT, 
    RuleT, 
    SearchT 
} from "atsds";

// Configure buffer size
bufferSize(2048);

// Create terms
const varX = new VariableT("`X");
const item = new ItemT("hello");
const lst = new ListT("(a b c)");
const term = new TermT("(f `x `y)");

console.log(`Variable: ${varX.toString()}, name: ${varX.name().toString()}`);
console.log(`Item: ${item.toString()}, name: ${item.name().toString()}`);
console.log(`List: ${lst.toString()}, length: ${lst.length()}`);
console.log(`Term: ${term.toString()}`);

// Work with rules
const fact = new RuleT("(parent john mary)");
const rule = new RuleT("(father `X `Y)\n----------\n(parent `X `Y)\n");

console.log(`\nFact: ${fact.toString()}`);
console.log(`Rule premises: ${rule.length()}, conclusion: ${rule.conclusion().toString()}`);

// Grounding
const termA = new TermT("`a");
const dictionary = new TermT("((`a hello))");
const grounded = termA.ground(dictionary);
if (grounded) {
    console.log(`\nGrounding \`a with ((\`a hello)): ${grounded.toString()}`);
}

// Matching
const mp = new RuleT("(`p -> `q)\n`p\n`q\n");
const axiom = new RuleT("((A) -> B)");
const matched = mp.match(axiom);
if (matched) {
    console.log(`\nMatching modus ponens with (A -> B):\n${matched.toString()}`);
}

// Search engine
const search = new SearchT(1000, 10000);
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
const rule1 = new RuleT("(a b c)");
const rule2 = rule1.copy();
console.log(`\nRule comparison: ${rule1.key() === rule2.key()}`);  // true
```
