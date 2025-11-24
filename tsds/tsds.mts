/**
 * TypeScript wrapper for a deductive system implemented in WebAssembly.
 * Provides classes and functions for working with logical terms, rules, and inference.
 */

import create_ds from "./ds.mjs";
import type * as dst from "./ds.d.mts";

const ds: dst.EmbindModule = await create_ds();

let _buffer_size: number = 1024;

/**
 * Gets the current buffer size, or sets a new buffer size and returns the previous value.
 * The buffer size is used for string conversions and internal storage of terms, rules, and other objects.
 *
 * @param size - The new buffer size to set. If 0 (default), the current size is returned without modification.
 * @returns The previous buffer size value.
 *
 * @example
 * ```typescript
 * const currentSize = buffer_size(); // Get current size
 * const oldSize = buffer_size(2048); // Set new size, returns old size
 * ```
 */
export function buffer_size(size: number = 0): number {
    const old_size = _buffer_size;
    if (size !== 0) {
        _buffer_size = size;
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
type InitialArgument<T extends Common> = _common_t<T> | T | string | dst.Buffer | null;

/**
 * Base class for all deductive system wrapper types.
 * Handles initialization, serialization, and common operations.
 * @internal
 */
class _common_t<T extends Common> {
    type: StaticCommon<T>;
    value: T;
    capacity: number;

    /**
     * Creates a new instance.
     *
     * @param type - The static type interface for this common type.
     * @param value - Initial value (can be another instance, base value, string, or buffer).
     * @param size - Optional buffer capacity for the internal storage.
     * @throws {Error} If initialization fails or invalid arguments provided.
     */
    constructor(type: StaticCommon<T>, value: InitialArgument<T>, size: number = 0) {
        this.type = type;
        if (value instanceof _common_t) {
            this.value = value.value;
            this.capacity = value.capacity;
            if (size !== 0) {
                throw new Error("Cannot set capacity when copying from another instance.");
            }
        } else if (value instanceof (this.type as unknown as new () => T)) {
            this.value = value;
            this.capacity = size;
        } else if (typeof value === "string") {
            this.capacity = size !== 0 ? size : buffer_size();
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
        const result = this.type.to_string(this.value, buffer_size());
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
 * const str1 = new string_t("hello");
 * const str2 = new string_t(str1.data()); // From binary
 * console.log(str1.toString()); // "hello"
 * ```
 */
export class string_t extends _common_t<dst.String> {
    /**
     * Creates a new string instance.
     *
     * @param value - Initial value (string, buffer, or another string_t).
     * @param size - Optional buffer size for string initialization.
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
 * const var1 = new variable_t("X");
 * console.log(var1.name().toString()); // "X"
 * ```
 */
export class variable_t extends _common_t<dst.Variable> {
    /**
     * Creates a new variable instance.
     *
     * @param value - Initial value (string, buffer, or another variable_t).
     * @param size - Optional buffer size for string initialization.
     * @throws {Error} If initialization fails.
     */
    constructor(value: InitialArgument<dst.Variable>, size: number = 0) {
        super(ds.Variable, value, size);
    }

    /**
     * Get the name of this variable.
     *
     * @returns The variable name as a string_t.
     */
    name(): string_t {
        return new string_t(this.value.name());
    }
}

/**
 * Wrapper class for items in the deductive system.
 * Items represent constants or functors in logical terms.
 *
 * @example
 * ```typescript
 * const item = new item_t("atom");
 * console.log(item.name().toString()); // "atom"
 * ```
 */
export class item_t extends _common_t<dst.Item> {
    /**
     * Creates a new item instance.
     *
     * @param value - Initial value (string, buffer, or another item_t).
     * @param size - Optional buffer size for string initialization.
     * @throws {Error} If initialization fails.
     */
    constructor(value: InitialArgument<dst.Item>, size: number = 0) {
        super(ds.Item, value, size);
    }

    /**
     * Get the name of this item.
     *
     * @returns The item name as a string_t.
     */
    name(): string_t {
        return new string_t(this.value.name());
    }
}

/**
 * Wrapper class for lists in the deductive system.
 * Lists contain ordered sequences of terms.
 *
 * @example
 * ```typescript
 * const list = new list_t("(a b c)");
 * console.log(list.length()); // 3
 * console.log(list.getitem(0).toString()); // "a"
 * ```
 */
export class list_t extends _common_t<dst.List> {
    /**
     * Creates a new list instance.
     *
     * @param value - Initial value (string, buffer, or another list_t).
     * @param size - Optional buffer size for string initialization.
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
    getitem(index: number): term_t {
        return new term_t(this.value.getitem(index));
    }
}

/**
 * Wrapper class for logical terms in the deductive system.
 * A term can be a variable, item, or list.
 *
 * @example
 * ```typescript
 * const term = new term_t("(f X a)");
 * const innerTerm = term.term(); // Get the underlying term type
 * ```
 */
export class term_t extends _common_t<dst.Term> {
    /**
     * Creates a new term instance.
     *
     * @param value - Initial value (string, buffer, or another term_t).
     * @param size - Optional buffer size for string initialization.
     * @throws {Error} If initialization fails.
     */
    constructor(value: InitialArgument<dst.Term>, size: number = 0) {
        super(ds.Term, value, size);
    }

    /**
     * Extracts the underlying term and returns it as its concrete type (variable_t, item_t, or list_t).
     *
     * @returns The term as a variable_t, item_t, or list_t.
     * @throws {Error} If the term type is unexpected.
     */
    term(): variable_t | item_t | list_t {
        const term_type: dst.TermType = this.value.get_type();
        if (term_type === ds.TermType.Variable) {
            return new variable_t(this.value.variable());
        } else if (term_type === ds.TermType.Item) {
            return new item_t(this.value.item());
        } else if (term_type === ds.TermType.List) {
            return new list_t(this.value.list());
        } else {
            throw new Error("Unexpected term type.");
        }
    }

    /**
     * Ground this term using a dictionary to substitute variables with values.
     *
     * @param other - A term representing a dictionary (list of pairs). Each pair contains a variable and its substitution value.
     * @param scope - Optional scope string for variable scoping.
     * @returns The grounded term, or null if grounding fails.
     */
    ground(other: term_t, scope: string = ""): term_t | null {
        const capacity = buffer_size();
        const term = ds.Term.ground(this.value, other.value, scope, capacity);
        if (term === null) {
            return null;
        }
        return new term_t(term, capacity);
    }
}

/**
 * Wrapper class for logical rules in the deductive system.
 * A rule consists of a conclusion and zero or more premises.
 *
 * @example
 * ```typescript
 * const rule = new rule_t("(father X Y)\n----------\n(parent X Y)\n");
 * console.log(rule.conclusion().toString()); // "(parent X Y)"
 * console.log(rule.length()); // Number of premises
 * ```
 */
export class rule_t extends _common_t<dst.Rule> {
    /**
     * Creates a new rule instance.
     *
     * @param value - Initial value (string, buffer, or another rule_t).
     * @param size - Optional buffer size for string initialization.
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
    getitem(index: number): term_t {
        return new term_t(this.value.getitem(index));
    }

    /**
     * Get the conclusion (head) of the rule.
     *
     * @returns The conclusion term.
     */
    conclusion(): term_t {
        return new term_t(this.value.conclusion());
    }

    /**
     * Ground this rule using a dictionary to substitute variables with values.
     *
     * @param other - A rule representing a dictionary (list of pairs). Each pair contains a variable and its substitution value.
     * @param scope - Optional scope string for variable scoping.
     * @returns The grounded rule, or null if grounding fails.
     */
    ground(other: rule_t, scope: string = ""): rule_t | null {
        const capacity = buffer_size();
        const rule = ds.Rule.ground(this.value, other.value, scope, capacity);
        if (rule === null) {
            return null;
        }
        return new rule_t(rule, capacity);
    }

    /**
     * Match this rule with another rule using unification.
     * This performs pattern matching and unification between the two rules.
     *
     * @param other - The rule to match against.
     * @returns The matched rule, or null if matching fails.
     */
    match(other: rule_t): rule_t | null {
        const capacity = buffer_size();
        const rule = ds.Rule.match(this.value, other.value, capacity);
        if (rule === null) {
            return null;
        }
        return new rule_t(rule, capacity);
    }
}

/**
 * Search engine for the deductive system.
 * Manages a knowledge base of rules and performs logical inference.
 *
 * @example
 * ```typescript
 * const search = new search_t();
 * search.add("(parent john mary)");
 * search.add("(father X Y)\n----------\n(parent X Y)\n");
 * search.execute((rule) => {
 *   console.log(rule.toString());
 *   return true; // Continue search
 * });
 * ```
 */
export class search_t {
    _search: dst.Search;

    /**
     * Creates a new search engine instance.
     *
     * @param limit_size - Maximum number of rules/facts in the knowledge base (default: 1000).
     * @param buffer_size - Buffer size for internal operations (default: 10000).
     */
    constructor(limit_size: number = 1000, buffer_size: number = 10000) {
        this._search = new ds.Search(limit_size, buffer_size);
    }

    /**
     * Set the maximum number of rules/facts the search engine can hold.
     *
     * @param limit_size - The new limit size.
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
     * @param callback - Function called for each candidate rule. Return true to continue, false to stop.
     * @returns The number of rules processed.
     */
    execute(callback: (candidate: rule_t) => boolean): number {
        return this._search.execute((candidate: dst.Rule): boolean => {
            return callback(new rule_t(candidate).copy());
        });
    }
}
