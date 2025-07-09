/* jshint esversion:6 */

import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
    input: {
        jsds: "jsds/jsds.mts",
        example: "examples/main.mjs"
    },
    output: [{
        dir: "dist",
        format: "es",
        entryFileNames: "[name].mjs"
    }],
    plugins: [terser(), typescript({
        compilerOptions: {
            target: "esnext"
        },
        include: ["**/*.mts"]
    })]
};
