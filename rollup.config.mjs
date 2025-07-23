import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
    input: {
        jsds: "jsds/tsds.mts",
        example: "examples/main.mjs",
        engine: "examples/engine.mjs",
    },
    output: [
        {
            dir: "dist",
            format: "es",
            sourcemap: true,
            entryFileNames: "[name].mjs",
        },
    ],
    plugins: [terser(), typescript({ target: "esnext" })],
};
