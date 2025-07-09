import create_ds from "./ds.mjs";
import type * as dst from "./ds.d.mts";

export const ds: dst.EmbindModule = await create_ds();

let _buffer_size: number = 1024;

export function buffer_size(size: number = 0): number {
    const old_buffer_size: number = _buffer_size ;
    if (size != 0) {
        _buffer_size = size;
    }
    return old_buffer_size;
}

type ds_types = dst.String | dst.Variable | dst.Item | dst.List | dst.Term | dst.Rule;
type value_t<base_t extends ds_types> = _common_t<base_t> | base_t | string | dst.Buffer;

interface ds_types_interface<base_t extends ds_types> {
    new(...args: never);
    from_string(text: string, size: number): base_t | null;
    to_string(value: base_t, size: number): string;
    from_binary(binary: dst.Buffer): base_t;
    to_binary(value: base_t): dst.Buffer;
};

class _common_t<base_t extends ds_types> {
    type: ds_types_interface<base_t>;
    value: base_t;
    capacity: number;

    constructor(type: ds_types_interface<base_t>, value: value_t<base_t>, size: number = 0) {
        this.type = type;
        if (value instanceof _common_t) {
            this.value = value.value;
            this.capacity = value.capacity;
            if (size != 0) {
                throw new Error("Cannot set capacity when copying from another instance.");
            }
        } else if (value instanceof this.type) {
            this.value = value as base_t;
            this.capacity = size;
        } else if (typeof value == "string") {
            this.capacity = size != 0 ? size : buffer_size();
            this.value = this.type.from_string(value, this.capacity);
            if (this.value == null) {
                throw new Error("Initialization from a string failed.");
            }
        } else if (value instanceof ds.Buffer) {
            this.value = this.type.from_binary(value as dst.Buffer);
            this.capacity = this.size();
            if (size != 0) {
                throw new Error("Cannot set capacity when initializing from bytes.");
            }
        } else {
            throw new Error("Unsupported type for initialization.");
        }
    }

    toString(): string {
        const result = this.type.to_string(this.value, buffer_size());
        if (result == "") {
            throw new Error("Conversion to string failed.");
        }
        return result;
    }

    data(): dst.Buffer {
        return this.type.to_binary(this.value);
    }

    size(): number {
        return this.value.data_size();
    }

    copy(): _common_t<base_t> {
        return new this.constructor(this.value.clone(), this.size());
    }

    key(): string {
        return this.toString();
    }
}

export class string_t extends _common_t<dst.String> {
    constructor(value: value_t<dst.String>, size: number = 0) {
        super(ds.String, value, size);
    }
}

export class variable_t extends _common_t<dst.Variable> {
    constructor(value: value_t<dst.Value>, size: number = 0) {
        super(ds.Variable, value, size);
    }

    name(): string_t {
        return new string_t(this.value.name());
    }
}

export class item_t extends _common_t<dst.Item> {
    constructor(value: value_t<dst.Item>, size: number = 0) {
        super(ds.Item, value, size);
    }

    name(): string_t {
        return new string_t(this.value.name());
    }
}

export class list_t extends _common_t<dst.List> {
    constructor(value: value_t<dst.List>, size: number = 0) {
        super(ds.List, value, size);
    }

    length(): number {
        return this.value.length();
    }

    getitem(index: number): term_t {
        return new term_t(this.value.getitem(index));
    }
}

export class term_t extends _common_t<dst.Term> {
    constructor(value: value_t<dst.Term>, size: number = 0) {
        super(ds.Term, value, size);
    }

    term(): variable_t | item_t | list_t {
        const term_type = this.value.get_type();
        if (term_type == ds.TermType.Variable) {
            return new variable_t(this.value.variable());
        } else if (term_type == ds.TermType.Item) {
            return new item_t(this.value.item());
        } else if (term_type == ds.TermType.List) {
            return new list_t(this.value.list());
        } else {
            throw new TypeError("Unexpected term type.");
        }
    }

    ground(other: term_t, scope: string = ""): term_t | null {
        const capacity = buffer_size();
        const term = ds.Term.ground(this.value, other.value, scope, capacity);
        if (term == null) {
            return null;
        }
        return new term_t(term, capacity);
    }
}

export class rule_t extends _common_t<dst.Rule> {
    constructor(value: value_t<dst.Rule>, size: number = 0) {
        super(ds.Rule, value, size);
    }

    length(): number {
        return this.value.length();
    }

    getitem(index: number): term_t {
        return new term_t(this.value.getitem(index));
    }

    conclusion(): term_t {
        return new term_t(this.value.conclusion());
    }

    ground(other: rule_t, scope: string = ""): rule_t | null {
        const capacity = buffer_size();
        const rule = ds.Rule.ground(this.value, other.value, scope, capacity);
        if (rule == null) {
            return null;
        }
        return new rule_t(rule, capacity);
    }

    match(other: rule_t): rule_t | null {
        const capacity = buffer_size();
        const rule = ds.Rule.match(this.value, other.value, capacity);
        if (rule == null) {
            return null;
        }
        return new rule_t(rule, capacity);
    }
}
