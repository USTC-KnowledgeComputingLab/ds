import { ds, type dst } from "./emcc_interface.mts";
import { _common_t, type InitialArgument } from "./common_t.mts";
import { term_t } from "./term_t.mts";

export class list_t extends _common_t<dst.List> {
    constructor(value: InitialArgument<dst.List>, size: number = 0) {
        super(ds.List, value, size);
    }

    length(): number {
        return this.value.length();
    }

    getitem(index: number): term_t {
        return new term_t(this.value.getitem(index));
    }
}
