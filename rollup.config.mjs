import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import { copy } from "@web/rollup-plugin-copy";
import { dts } from "rollup-plugin-dts";

export default [
    {
        input: {
            tsds: "atsds/tsds.mts",
            example: "examples/main.mjs",
        },
        output: {
            dir: "dist",
            format: "es",
            sourcemap: false,
            entryFileNames: "[name].mjs",
        },
        plugins: [
            terser(),
            typescript(),
            nodeResolve(),
            copy({
                patterns: ["ds.wasm"],
                rootDir: "atsds",
            }),
        ],
    },
    {
        input: {
            tsds: "atsds/tsds.mts",
        },
        output: {
            dir: "dist",
            format: "es",
            entryFileNames: "[name].d.mts",
        },
        plugins: [dts()],
    },
];
