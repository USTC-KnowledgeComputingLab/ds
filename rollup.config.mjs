/* jshint esversion:6 */

import terser from "@rollup/plugin-terser";

export default {
    input: {
        jsds: "jsds/jsds.mjs",
        example: "examples/main.mjs",
        engine: "examples/engine.mjs",
    },
    output: [
        {
            dir: "dist",
            format: "es",
            entryFileNames: "[name].mjs",
        },
    ],
    plugins: [terser()],
};
