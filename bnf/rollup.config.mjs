import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

export default [
    {
        input: "atsds_bnf/index.mts",
        output: {
            file: "dist/index.mjs",
            format: "es",
        },
        plugins: [
            typescript(),
            nodeResolve({
                browser: true,
            }),
            commonjs(),
            json(),
            terser(),
        ],
    },
    {
        input: "atsds_bnf/index.mts",
        output: {
            file: "dist/index.d.mts",
            format: "es",
        },
        plugins: [dts()],
    },
];
