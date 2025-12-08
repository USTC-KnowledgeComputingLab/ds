import terser from "@rollup/plugin-terser";
import nodeResolve from "@rollup/plugin-node-resolve";

export default [
    {
        input: "atsds_bnf/index.js",
        output: {
            file: "dist/bnf.mjs",
            format: "es",
        },
        plugins: [
            terser(),
            nodeResolve(),
        ],
    },
];
