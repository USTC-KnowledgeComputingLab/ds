import path from "node:path";
import { readFile } from "node:fs/promises";
import { argv, stdin, stdout, exit } from "node:process";
import { createInterface } from "node:readline/promises";
import { rule_t } from "../tsds/tsds.mts";
import { search } from "./search.mjs";

async function read_file_to_string_array(file_path) {
    const content = await readFile(file_path, "utf-8");
    return content
        .split("\n\n")
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
}

function default_callback(candidate) {
    console.log(candidate.toString());
}

async function main() {
    const help_message = "Usage: node engine.mjs <file_path> <buffer_limit> [config_module]";
    if (argv.length !== 4 && argv.length !== 5) {
        console.error(help_message);
        exit(1);
    }
    const file_path = argv[2];
    const buffer_limit = parseInt(argv[3]);
    let callback;
    let await_each_step;
    if (argv.length === 5) {
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
