import path from "node:path";
import { readFile } from "node:fs/promises";
import { argv, stdin, stdout, exit } from "node:process";
import { createInterface } from "node:readline/promises";
import { buffer_size, rule_t } from "../jsds/jsds.mjs";

function* search(input_strings, buffer_limit, callback) {
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
    const results = sections.filter((section) => section.trim().length > 0).map((section) => section.trim());
    return results;
}

function default_callback(candidate) {
    console.log(candidate.toString());
}

async function main() {
    const help_message = "Usage: node engine.mjs <file_path> <buffer_limit> [config_module]";
    if (argv.length != 4 && argv.length != 5) {
        console.error(help_message);
        exit(1);
    }
    const file_path = argv[2];
    const buffer_limit = parseInt(argv[3]);
    let callback;
    let await_each_step;
    if (argv.length == 5) {
        try {
            const config_module = await import(path.resolve(argv[4]));
            callback = config_module.callback;
            await_each_step = config_module.await_each_step;
        } catch (error) {
            console.error(`Error importing callback module: ${error.message}`);
            exit(1);
        }
    } else {
        callback = default_callback;
        await_each_step = true;
    }

    const data = await read_file_to_string_array(file_path);
    for (const input of data) {
        callback(new rule_t(input));
    }
    const generator = search(data, buffer_limit, callback);
    const handle = createInterface({
        input: stdin,
        output: stdout,
    });
    console.log("Search starting...");
    while (true) {
        if (generator.next().done) {
            console.log("Search completed.");
            break;
        }
        if (await_each_step) {
            await handle.question("Press Enter to continue...");
        }
    }
    exit(0);
}

await main(); // jshint ignore:line
