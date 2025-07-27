import { ds, type dst } from "./emcc_interface.mts";
import { _common_t, type InitialArgument } from "./common_t.mts";
import { term_t } from "./term_t.mts";
import { buffer_size } from "./buffer_size.mts";

export class rule_t extends _common_t<dst.Rule> {
    constructor(value: InitialArgument<dst.Rule>, size: number = 0) {
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
        if (rule === null) {
            return null;
        }
        return new rule_t(rule, capacity);
    }

    match(other: rule_t): rule_t | null {
        const capacity = buffer_size();
        const rule = ds.Rule.match(this.value, other.value, capacity);
        if (rule === null) {
            return null;
        }
        return new rule_t(rule, capacity);
    }
}
