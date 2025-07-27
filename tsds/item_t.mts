import { ds, type dst } from "./emcc_interface.mts";
import { _common_t, type InitialArgument } from "./common_t.mts";
import { string_t } from "./string_t.mts";

export class item_t extends _common_t<dst.Item> {
    constructor(value: InitialArgument<dst.Item>, size: number = 0) {
        super(ds.Item, value, size);
    }

    name(): string_t {
        return new string_t(this.value.name());
    }
}
