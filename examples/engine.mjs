/* jshint esversion:11 */

import {
    readFile,
} from "node:fs/promises";
import {
    argv,
    stdin,
    stdout,
    exit,
} from "node:process";
import {
    createInterface
} from "node:readline/promises";
import {
    buffer_size,
    rule_t,
}
from "../jsds/jsds.mjs";

function default_callback(candidate) {
    console.log(candidate.toString());
}

function* search(input_strings, buffer_limit = 1024, callback = default_callback) {
    buffer_size(buffer_limit);

    let rules = {};
    let facts = {};

    let cycle = -1;

    for (let input_string of input_strings) {
        let rule = new rule_t(input_string);
        if (rule.length() !== 0) {
            rules[rule.key()] = [rule, cycle];
        } else {
            facts[rule.key()] = [rule, cycle];
        }
    }

    while (true) {
        let temp_rules = {};
        let temp_facts = {};
        let something_new = false;

        for (let r_hash in rules) {
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
        for (let r_hash in temp_rules) {
            const rule = temp_rules[r_hash];
            rules[rule.key()] = [rule, cycle];
        }
        for (let f_hash in temp_facts) {
            const fact = temp_facts[f_hash];
            facts[fact.key()] = [fact, cycle];
        }
        if (!something_new) {
            return;
        }

        yield;
    }
}

async function read_file_to_string_array(file_path) {
    const content = await readFile(file_path, "utf-8");
    const sections = content.split(/\n\n/);
    const results = sections
          .filter(section => section.trim().length > 0)
          .map(section => section.trim());
    return results;
}

async function main() {
    const help_message = "Usage: node engine.mjs <file_path> <buffer_limit> [callback_module]";
    if (argv.length != 4 && argv.length != 5) {
        console.error(help_message);
        exit(1);
    }
    const file_path = argv[2];
    const buffer_limit = parseInt(argv[3], 10);
    let callback;
    if (argv.length == 5) {
        try {
            const callback_module = await import(argv[4]);
            if (typeof callback_module.default === "function") {
                callback = callback_module.default;
            } else {
                console.error("Callback module must export a default function.");
                exit(1);
            }
        } catch (error) {
            console.error(`Error importing callback module: ${error.message}`);
            exit(1);
        }
    } else {
        callback = default_callback;
    }

    const data = await read_file_to_string_array(file_path);
    const generator = search(data, buffer_limit, callback);
    const handle = createInterface({
        input: stdin,
        output: stdout
    });
    while (true) {
        if (generator.next().done) {
            console.log("Search completed.");
            break;
        }
        await handle.question("Press Enter to continue...");
    }
}

await main(); // jshint ignore:line
