import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import { copy } from "@web/rollup-plugin-copy";

export default {
    input: {
        ds: "tsds/ds.mjs",
        tsds: "tsds/tsds.mts",
        example: "examples/main.mjs",
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
        nodeResolve(),
        copy({
            patterns: ["**/*.wasm", "**/*.wasm.map", "**/ds.d.mts"],
            rootDir: "tsds",
        }),
    ],
};
