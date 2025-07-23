export default {
    testMatch: ["**/test_*.mjs"],
    collectCoverage: true,
    extensionsToTreatAsEsm: [".mts"],
    transform: {
        "^.+\\.m?tsx?$": ["ts-jest", {}],
    },
};
