import { ds, type dst } from "./emcc_interface.mts";
import { _common_t, type InitialArgument } from "./common_t.mts";
import { string_t } from "./string_t.mts";

export class variable_t extends _common_t<dst.Variable> {
    constructor(value: InitialArgument<dst.Variable>, size: number = 0) {
        super(ds.Variable, value, size);
    }

    name(): string_t {
        return new string_t(this.value.name());
    }
}
