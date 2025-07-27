import { ds, type dst } from "./emcc_interface.mts";
import { _common_t, type InitialArgument } from "./common_t.mts";

export class string_t extends _common_t<dst.String> {
    constructor(value: InitialArgument<dst.String>, size: number = 0) {
        super(ds.String, value, size);
    }
}
