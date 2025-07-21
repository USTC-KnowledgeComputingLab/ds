export default {
    testMatch: ["**/test_*.mjs"],
    collectCoverage: true,
    extensionsToTreatAsEsm: [".mts"],
    transform: {
        "^.+\\.m?tsx?$": [
            "ts-jest",
            {
                tsconfig: {
                    target: "esnext",
                    module: "esnext",
                    strict: true,
                    esModuleInterop: true,
                    isolatedModules: true,
                },
                useESM: true,
            },
        ],
    },
};
