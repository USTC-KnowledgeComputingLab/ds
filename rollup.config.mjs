import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import { copy } from "@web/rollup-plugin-copy";

export default {
    input: {
        ds: "tsds/ds.mjs",
        tsds: "tsds/tsds.mts",
        example: "examples/main.mjs",
        search: "examples/search.mjs",
        engine: "examples/engine.mjs",
        ddar: "examples/ddar.mjs",
    },
    output: {
        dir: "dist",
        format: "es",
        sourcemap: true,
        entryFileNames: "[name].mjs",
    },
    plugins: [
        json(),
        terser(),
        commonjs(),
        typescript(),
        nodeResolve(),
        copy({
            patterns: ["**/*.wasm", "**/*.wasm.map"],
            rootDir: "tsds",
        }),
    ],
};
