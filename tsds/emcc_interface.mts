import create_ds from "./ds.mjs";
import type * as dst from "./ds.mjs";

export const ds: dst.EmbindModule = await create_ds();

export type { dst };

export interface Common {
    clone(): Common;
    data_size(): number;
}

export interface StaticCommon<T extends Common> {
    from_binary(buffer: dst.Buffer): T;
    to_binary(value: T): dst.Buffer;
    from_string(text: string, size: number): T;
    to_string(value: T, size: number): string;
}
