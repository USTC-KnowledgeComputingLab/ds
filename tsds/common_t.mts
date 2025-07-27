import { ds, type dst, type Common, type StaticCommon } from "./emcc_interface.mts";
import { buffer_size } from "./buffer_size.mts";

export type InitialArgument<T extends Common> = _common_t<T> | T | string | dst.Buffer | null;

export class _common_t<T extends Common> {
    type: StaticCommon<T>;
    value: T;
    capacity: number;

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

    toString(): string {
        const result = this.type.to_string(this.value, buffer_size());
        if (result === "") {
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

    copy(): this {
        const this_constructor = this.constructor as new (value: T, size: number) => this;
        return new this_constructor(this.value.clone() as T, this.size());
    }

    key(): string {
        return this.toString();
    }
}
