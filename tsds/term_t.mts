import { ds, type dst } from "./emcc_interface.mts";
import { _common_t, type InitialArgument } from "./common_t.mts";
import { variable_t } from "./variable_t.mjs";
import { item_t } from "./item_t.mjs";
import { list_t } from "./list_t.mjs";
import { buffer_size } from "./buffer_size.mjs";

export class term_t extends _common_t<dst.Term> {
    constructor(value: InitialArgument<dst.Term>, size: number = 0) {
        super(ds.Term, value, size);
    }

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

    ground(other: term_t, scope: string = ""): term_t | null {
        const capacity = buffer_size();
        const term = ds.Term.ground(this.value, other.value, scope, capacity);
        if (term === null) {
            return null;
        }
        return new term_t(term, capacity);
    }
}
