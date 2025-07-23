import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { copy } from "@web/rollup-plugin-copy";

export default {
    input: {
        ds: "tsds/ds.mjs",
        tsds: "tsds/tsds.mts",
        example: "examples/main.mjs",
        engine: "examples/engine.mjs",
    },
    output: {
        dir: "dist",
        format: "es",
        sourcemap: true,
        entryFileNames: "[name].mjs",
    },
    plugins: [
        terser(),
        typescript(),
        copy({
            patterns: ["**/*.wasm", "**/*.wasm.map"],
            rootDir: "tsds",
        }),
    ],
};
