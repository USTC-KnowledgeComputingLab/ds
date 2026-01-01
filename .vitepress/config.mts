import { defineConfig } from "vitepress";
import path from "node:path";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "DS - A Deductive System",
    description:
        "A deductive system for logical inference, implemented in C++ with bindings for Python and TypeScript/JavaScript",
    srcDir: "docs",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "Home", link: "/" },
            { text: "Getting Started", link: "/getting-started/installation" },
            { text: "Core Concepts", link: "/concepts/terms" },
            { text: "API Reference", link: "/api/typescript" },
            { text: "Support Packages", link: "/support-packages/bnf" },
            { text: "Examples", link: "/examples/basic" },
        ],

        sidebar: [
            {
                text: "Getting Started",
                items: [
                    { text: "Installation", link: "/getting-started/installation" },
                    { text: "Quick Start", link: "/getting-started/quickstart" },
                ],
            },
            {
                text: "Core Concepts",
                items: [
                    { text: "Terms", link: "/concepts/terms" },
                    { text: "Rules", link: "/concepts/rules" },
                    { text: "Search Engine", link: "/concepts/search" },
                ],
            },
            {
                text: "API Reference",
                items: [
                    { text: "TypeScript API", link: "/api/typescript" },
                    { text: "Python API", link: "/api/python" },
                    { text: "C++ API", link: "/api/cpp" },
                ],
            },
            {
                text: "Support Packages",
                items: [
                    { text: "BNF", link: "/support-packages/bnf" },
                    { text: "E-Graph", link: "/support-packages/egg" },
                ],
            },
            {
                text: "Examples",
                items: [
                    { text: "Basis Examples", link: "/examples/basic" },
                    { text: "Sudoku", link: "/examples/sudoku" },
                ],
            },
        ],

        search: { provider: "local" },
        socialLinks: [{ icon: "github", link: "https://github.com/USTC-KnowledgeComputingLab/ds" }],
    },
    vite: {
        build: {
            target: "esnext",
        },
        resolve: {
            alias: {
                atsds: path.resolve(__dirname, "../atsds/index.mts"),
            },
        },
    },
});
