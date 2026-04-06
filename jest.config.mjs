export default {
    testMatch: ["<rootDir>/tests/test_*.mjs"],
    collectCoverage: true,
    extensionsToTreatAsEsm: [".mts"],
    transform: {
        "^.+\\.m?tsx?$": ["@swc/jest"],
    },
};
