/**
 * TypeScript wrapper for a deductive system implemented in WebAssembly.
 * Provides classes and functions for working with logical terms, rules, and inference.
 */

import create_ds from "./ds.mjs";
import type * as dst from "./ds.d.mts";

const ds: dst.EmbindModule = await create_ds();

let _bufferSize: number = 1024;

/**
 * Gets the current buffer size, or sets a new buffer size and returns the previous value.
 * The buffer size is used for internal operations like conversions and transformations.
 *
 * @param size - The new buffer size to set. If 0 (default), the current size is returned without modification.
 * @returns The previous buffer size value.
 *
 * @example
 * ```typescript
 * const currentSize = bufferSize(); // Get current size
 * const oldSize = bufferSize(2048); // Set new size, returns old size
 * ```
 */
export function bufferSize(size: number = 0): number {
    const old_size = _bufferSize;
    if (size !== 0) {
        _bufferSize = size;
    }
    return old_size;
}

/**
 * Common interface for all deductive system types.
 * @internal
 */
interface Common {
    clone(): Common;
    data_size(): number;
}

/**
 * Static methods interface for deductive system types.
 * @internal
 */
interface StaticCommon<T extends Common> {
    from_binary(buffer: dst.Buffer): T;
    to_binary(value: T): dst.Buffer;
    from_string(text: string, size: number): T;
    to_string(value: T, size: number): string;
}

/**
 * Valid initialization arguments for deductive system types.
 * @internal
 */
type InitialArgument<T extends Common> = _CommonT<T> | T | string | dst.Buffer | null;

/**
 * Base class for all deductive system wrapper types.
 * Handles initialization, serialization, and common operations.
 * @internal
 */
class _CommonT<T extends Common> {
    type: StaticCommon<T>;
    value: T;
    capacity: number;

    /**
     * Creates a new instance.
     *
     * @param type - The static type interface for this common type.
     * @param value - Initial value (can be another instance, base value, string, or buffer).
     * @param size - Optional buffer capacity for the internal storage.
     * @throws {Error} If initialization fails or invalid arguments are provided.
     */
    constructor(type: StaticCommon<T>, value: InitialArgument<T>, size: number = 0) {
        this.type = type;
        if (value instanceof _CommonT) {
            this.value = value.value;
            this.capacity = value.capacity;
            if (size !== 0) {
                throw new Error("Cannot set capacity when copying from another instance.");
            }
        } else if (value instanceof (this.type as unknown as new () => T)) {
            this.value = value;
            this.capacity = size;
        } else if (typeof value === "string") {
            this.capacity = size !== 0 ? size : bufferSize();
            this.value = this.type.from_string(value, this.capacity);
            if (this.value === null) {
                throw new Error("Initialization from a string failed.");
            }
        } else if (value instanceof ds.Buffer) {
            this.value = this.type.from_binary(value);
            this.capacity = this.size();
            if (size !== 0) {
                throw new Error("Cannot set capacity when initializing from bytes.");
            }
        } else {
            throw new Error("Unsupported type for initialization.");
        }
    }

    /**
     * Convert the value to a string representation.
     *
     * @returns The string representation.
     * @throws {Error} If conversion fails.
     */
    toString(): string {
        const result = this.type.to_string(this.value, bufferSize());
        if (result === "") {
            throw new Error("Conversion to string failed.");
        }
        return result;
    }

    /**
     * Get the binary representation of the value.
     *
     * @returns The binary data as a Buffer.
     */
    data(): dst.Buffer {
        return this.type.to_binary(this.value);
    }

    /**
     * Get the size of the data in bytes.
     *
     * @returns The data size.
     */
    size(): number {
        return this.value.data_size();
    }

    /**
     * Create a deep copy of this instance.
     *
     * @returns A new instance with cloned value.
     */
    copy(): this {
        const this_constructor = this.constructor as new (value: T, size: number) => this;
        return new this_constructor(this.value.clone() as T, this.size());
    }

    /**
     * Get a key representation for this value.
     * The key equality is consistent with object equality.
     *
     * @returns The string key.
     */
    key(): string {
        return this.toString();
    }
}

/**
 * Wrapper class for deductive system strings.
 * Supports initialization from strings, buffers, or other instances.
 *
 * @example
 * ```typescript
 * const str1 = new StringT("hello");
 * const str2 = new StringT(str1.data()); // From binary
 * console.log(str1.toString()); // "hello"
 * ```
 */
export class StringT extends _CommonT<dst.String> {
    /**
     * Creates a new string instance.
     *
     * @param value - Initial value (string, buffer, or another StringT).
     * @param size - Optional buffer capacity for the internal storage.
     * @throws {Error} If initialization fails.
     */
    constructor(value: InitialArgument<dst.String>, size: number = 0) {
        super(ds.String, value, size);
    }
}

/**
 * Wrapper class for logical variables in the deductive system.
 * Variables are used in logical terms and can be unified.
 *
 * @example
 * ```typescript
 * const var1 = new VariableT("`X");
 * console.log(var1.name().toString()); // "X"
 * ```
 */
export class VariableT extends _CommonT<dst.Variable> {
    /**
     * Creates a new variable instance.
     *
     * @param value - Initial value (string, buffer, or another VariableT).
     * @param size - Optional buffer capacity for the internal storage.
     * @throws {Error} If initialization fails.
     */
    constructor(value: InitialArgument<dst.Variable>, size: number = 0) {
        super(ds.Variable, value, size);
    }

    /**
     * Get the name of this variable.
     *
     * @returns The variable name as a StringT.
     */
    name(): StringT {
        return new StringT(this.value.name());
    }
}

/**
 * Wrapper class for items in the deductive system.
 * Items represent constants or functors in logical terms.
 *
 * @example
 * ```typescript
 * const item = new ItemT("atom");
 * console.log(item.name().toString()); // "atom"
 * ```
 */
export class ItemT extends _CommonT<dst.Item> {
    /**
     * Creates a new item instance.
     *
     * @param value - Initial value (string, buffer, or another ItemT).
     * @param size - Optional buffer capacity for the internal storage.
     * @throws {Error} If initialization fails.
     */
    constructor(value: InitialArgument<dst.Item>, size: number = 0) {
        super(ds.Item, value, size);
    }

    /**
     * Get the name of this item.
     *
     * @returns The item name as a StringT.
     */
    name(): StringT {
        return new StringT(this.value.name());
    }
}

/**
 * Wrapper class for lists in the deductive system.
 * Lists contain ordered sequences of terms.
 *
 * @example
 * ```typescript
 * const list = new ListT("(a b c)");
 * console.log(list.length()); // 3
 * console.log(list.getitem(0).toString()); // "a"
 * ```
 */
export class ListT extends _CommonT<dst.List> {
    /**
     * Creates a new list instance.
     *
     * @param value - Initial value (string, buffer, or another ListT).
     * @param size - Optional buffer capacity for the internal storage.
     * @throws {Error} If initialization fails.
     */
    constructor(value: InitialArgument<dst.List>, size: number = 0) {
        super(ds.List, value, size);
    }

    /**
     * Get the number of elements in the list.
     *
     * @returns The list length.
     */
    length(): number {
        return this.value.length();
    }

    /**
     * Get an element from the list by index.
     *
     * @param index - The zero-based index of the element.
     * @returns The term at the specified index.
     */
    getitem(index: number): TermT {
        return new TermT(this.value.getitem(index));
    }
}

/**
 * Wrapper class for logical terms in the deductive system.
 * A term can be a variable, item, or list.
 *
 * @example
 * ```typescript
 * const term = new TermT("(f `x a)");
 * const innerTerm = term.term(); // Get the underlying term type
 * ```
 */
export class TermT extends _CommonT<dst.Term> {
    /**
     * Creates a new term instance.
     *
     * @param value - Initial value (string, buffer, or another TermT).
     * @param size - Optional buffer capacity for the internal storage.
     * @throws {Error} If initialization fails.
     */
    constructor(value: InitialArgument<dst.Term>, size: number = 0) {
        super(ds.Term, value, size);
    }

    /**
     * Extracts the underlying term and returns it as its concrete type (VariableT, ItemT, or ListT).
     *
     * @returns The term as a VariableT, ItemT, or ListT.
     * @throws {Error} If the term type is unexpected.
     */
    term(): VariableT | ItemT | ListT {
        const term_type: dst.TermType = this.value.get_type();
        if (term_type === ds.TermType.Variable) {
            return new VariableT(this.value.variable());
        } else if (term_type === ds.TermType.Item) {
            return new ItemT(this.value.item());
        } else if (term_type === ds.TermType.List) {
            return new ListT(this.value.list());
        } else {
            throw new Error("Unexpected term type.");
        }
    }

    /**
     * Ground this term using a dictionary to substitute variables with values.
     *
     * @param other - A term representing a dictionary (list of pairs). Each pair contains a variable and its substitution value.
     *                Example: "((`a b))" means substitute variable `a with value b.
     * @param scope - Optional scope string for variable scoping.
     * @returns The grounded term, or null if grounding fails.
     *
     * @example
     * ```typescript
     * const a = new TermT("`a");
     * const b = new TermT("((`a b))");
     * console.log(a.ground(b).toString()); // "b"
     *
     * // With scope
     * const c = new TermT("`a");
     * const d = new TermT("((x y `a `b) (y x `b `c))");
     * console.log(c.ground(d, "x").toString()); // "`c"
     * ```
     */
    ground(other: TermT, scope: string = ""): TermT | null {
        const capacity = bufferSize();
        const term = ds.Term.ground(this.value, other.value, scope, capacity);
        if (term === null) {
            return null;
        }
        return new TermT(term, capacity);
    }

    /**
     * Rename all variables in this term by adding prefix and suffix.
     *
     * @param prefix_and_suffix - A term representing a list with two inner lists.
     *                            Each inner list contains 0 or 1 item representing the prefix and suffix.
     *                            Example: "((pre_) (_suf))" adds "pre_" as prefix and "_suf" as suffix.
     * @returns The renamed term, or null if renaming fails.
     *
     * @example
     * ```typescript
     * const a = new TermT("`x");
     * const b = new TermT("((pre_) (_suf))");
     * console.log(a.rename(b).toString()); // "`pre_x_suf"
     *
     * // With empty prefix (only suffix)
     * const c = new TermT("`x");
     * const d = new TermT("(() (_suf))");
     * console.log(c.rename(d).toString()); // "`x_suf"
     * ```
     */
    rename(prefix_and_suffix: TermT): TermT | null {
        const capacity = bufferSize();
        const term = ds.Term.rename(this.value, prefix_and_suffix.value, capacity);
        if (term === null) {
            return null;
        }
        return new TermT(term, capacity);
    }
}

/**
 * Wrapper class for logical rules in the deductive system.
 * A rule consists of zero or more premises (above the line) and a conclusion (below the line).
 *
 * @example
 * ```typescript
 * const rule = new RuleT("(father `X `Y)\n----------\n(parent `X `Y)\n");
 * console.log(rule.conclusion().toString()); // "(parent `X `Y)"
 * console.log(rule.length()); // 1 (number of premises)
 * ```
 */
export class RuleT extends _CommonT<dst.Rule> {
    /**
     * Creates a new rule instance.
     *
     * @param value - Initial value (string, buffer, or another RuleT).
     * @param size - Optional buffer capacity for the internal storage.
     * @throws {Error} If initialization fails.
     */
    constructor(value: InitialArgument<dst.Rule>, size: number = 0) {
        super(ds.Rule, value, size);
    }

    /**
     * Get the number of premises in the rule.
     *
     * @returns The number of premises.
     */
    length(): number {
        return this.value.length();
    }

    /**
     * Get a premise term by index.
     *
     * @param index - The zero-based index of the premise.
     * @returns The premise term at the specified index.
     */
    getitem(index: number): TermT {
        return new TermT(this.value.getitem(index));
    }

    /**
     * Get the conclusion of the rule.
     *
     * @returns The conclusion term.
     */
    conclusion(): TermT {
        return new TermT(this.value.conclusion());
    }

    /**
     * Ground this rule using a dictionary to substitute variables with values.
     *
     * @param other - A rule representing a dictionary (list of pairs). Each pair contains a variable and its substitution value.
     *                Example: new RuleT("((`a b))") means substitute variable `a with value b.
     * @param scope - Optional scope string for variable scoping.
     * @returns The grounded rule, or null if grounding fails.
     *
     * @example
     * ```typescript
     * const a = new RuleT("`a");
     * const b = new RuleT("((`a b))");
     * console.log(a.ground(b).toString()); // "----\nb\n"
     *
     * // With scope
     * const c = new RuleT("`a");
     * const d = new RuleT("((x y `a `b) (y x `b `c))");
     * console.log(c.ground(d, "x").toString()); // "----\n`c\n"
     * ```
     */
    ground(other: RuleT, scope: string = ""): RuleT | null {
        const capacity = bufferSize();
        const rule = ds.Rule.ground(this.value, other.value, scope, capacity);
        if (rule === null) {
            return null;
        }
        return new RuleT(rule, capacity);
    }

    /**
     * Match this rule with another rule using unification.
     * This unifies the first premise of this rule with the other rule.
     * The other rule must be a fact (a rule without premises).
     *
     * @param other - The rule to match against (must be a fact without premises).
     * @returns The matched rule, or null if matching fails.
     *
     * @example
     * ```typescript
     * const mp = new RuleT("(`p -> `q)\n`p\n`q\n");
     * const pq = new RuleT("((! (! `x)) -> `x)");
     * console.log(mp.match(pq).toString()); // "(! (! `x))\n----------\n`x\n"
     * ```
     */
    match(other: RuleT): RuleT | null {
        const capacity = bufferSize();
        const rule = ds.Rule.match(this.value, other.value, capacity);
        if (rule === null) {
            return null;
        }
        return new RuleT(rule, capacity);
    }

    /**
     * Rename all variables in this rule by adding prefix and suffix.
     *
     * @param prefix_and_suffix - A rule with only a conclusion that is a list with two inner lists.
     *                            Each inner list contains 0 or 1 item representing the prefix and suffix.
     *                            Example: "((pre_) (_suf))" adds "pre_" as prefix and "_suf" as suffix.
     * @returns The renamed rule, or null if renaming fails.
     *
     * @example
     * ```typescript
     * const a = new RuleT("`x");
     * const b = new RuleT("((pre_) (_suf))");
     * console.log(a.rename(b).toString()); // "----\n`pre_x_suf\n"
     *
     * // With empty prefix (only suffix)
     * const c = new RuleT("`x");
     * const d = new RuleT("(() (_suf))");
     * console.log(c.rename(d).toString()); // "----\n`x_suf\n"
     * ```
     */
    rename(prefix_and_suffix: RuleT): RuleT | null {
        const capacity = bufferSize();
        const rule = ds.Rule.rename(this.value, prefix_and_suffix.value, capacity);
        if (rule === null) {
            return null;
        }
        return new RuleT(rule, capacity);
    }
}

/**
 * Search engine for the deductive system.
 * Manages a knowledge base of rules and performs logical inference.
 *
 * @example
 * ```typescript
 * const search = new SearchT();
 * search.add("(parent john mary)");
 * search.add("(father `X `Y)\n----------\n(parent `X `Y)\n");
 * search.execute((rule) => {
 *   console.log(rule.toString());
 *   return false; // Return false to continue, true to stop
 * });
 * ```
 */
export class SearchT {
    _search: dst.Search;

    /**
     * Creates a new search engine instance.
     *
     * @param limit_size - Size of the buffer for storing the final objects (rules/facts) in the knowledge base (default: 1000).
     * @param buffer_size - Size of the buffer for internal operations like conversions and transformations (default: 10000).
     */
    constructor(limit_size: number = 1000, buffer_size: number = 10000) {
        this._search = new ds.Search(limit_size, buffer_size);
    }

    /**
     * Set the size of the buffer for storing final objects.
     *
     * @param limit_size - The new limit size for storing rules/facts.
     */
    set_limit_size(limit_size: number): void {
        this._search.set_limit_size(limit_size);
    }

    /**
     * Set the buffer size for internal operations.
     *
     * @param buffer_size - The new buffer size.
     */
    set_buffer_size(buffer_size: number): void {
        this._search.set_buffer_size(buffer_size);
    }

    /**
     * Reset the search engine, clearing all rules and facts.
     */
    reset(): void {
        this._search.reset();
    }

    /**
     * Add a rule or fact to the knowledge base.
     *
     * @param text - The rule or fact as a string.
     * @returns True if successfully added, false otherwise.
     */
    add(text: string): boolean {
        return this._search.add(text);
    }

    /**
     * Execute the search engine with a callback for each inferred rule.
     *
     * @param callback - Function called for each candidate rule. Return false to continue, true to stop.
     * @returns The number of rules processed.
     */
    execute(callback: (candidate: RuleT) => boolean): number {
        return this._search.execute((candidate: dst.Rule): boolean => {
            return callback(new RuleT(candidate).copy());
        });
    }
}
