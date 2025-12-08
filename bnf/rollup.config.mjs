import terser from "@rollup/plugin-terser";
import nodeResolve from "@rollup/plugin-node-resolve";

export default [
    {
        input: "atsds_bnf/index.mjs",
        output: {
            file: "dist/index.mjs",
            format: "es",
        },
        plugins: [terser(), nodeResolve()],
    },
];
