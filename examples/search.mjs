import { buffer_size, rule_t } from "../tsds/tsds.mts";

export function* search(input_strings, buffer_limit, callback) {
    buffer_size(buffer_limit);

    const rules = {};
    const facts = {};

    let cycle = -1;

    for (const input_string of input_strings) {
        const rule = new rule_t(input_string);
        if (rule.length() !== 0) {
            rules[rule.key()] = [rule, cycle];
        } else {
            facts[rule.key()] = [rule, cycle];
        }
    }

    while (true) {
        const temp_rules = {};
        const temp_facts = {};
        let something_new = false;

        for (const r_hash in rules) {
            for (const f_hash in facts) {
                const [rule, r_cycle] = rules[r_hash];
                const [fact, f_cycle] = facts[f_hash];
                if (r_cycle !== cycle && f_cycle !== cycle) {
                    continue;
                }
                const candidate = rule.match(fact);
                if (candidate === null) {
                    continue;
                }
                const candidate_hash = candidate.key();
                if (candidate.length() !== 0) {
                    // rule
                    if (candidate_hash in rules || candidate_hash in temp_rules) {
                        continue;
                    }
                    temp_rules[candidate_hash] = candidate;
                } else {
                    // fact
                    if (candidate_hash in facts || candidate_hash in temp_facts) {
                        continue;
                    }
                    temp_facts[candidate_hash] = candidate;
                }
                callback(candidate);
                something_new = true;
            }
        }

        cycle++;
        for (const r_hash in temp_rules) {
            const rule = temp_rules[r_hash];
            rules[rule.key()] = [rule, cycle];
        }
        for (const f_hash in temp_facts) {
            const fact = temp_facts[f_hash];
            facts[fact.key()] = [fact, cycle];
        }
        if (!something_new) {
            return;
        }

        yield;
    }
}
