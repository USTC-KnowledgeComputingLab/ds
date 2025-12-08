import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default [
    {
        input: "atsds_bnf/index.mjs",
        output: {
            file: "dist/index.mjs",
            format: "es",
        },
        plugins: [
            nodeResolve({
                browser: true,
            }),
            commonjs(),
            json(),
            terser(),
        ],
    },
];
