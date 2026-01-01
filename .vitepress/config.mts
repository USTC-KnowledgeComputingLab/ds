import path from "node:path";
import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: "/ds/",
    title: "DS - A Deductive System",
    description:
        "A deductive system for logical inference, implemented in C++ with bindings for Python and TypeScript/JavaScript",
    srcDir: "docs",

    locales: {
        en: {
            label: "English",
            lang: "en",
            link: "/en/",
            themeConfig: {
                nav: [
                    { text: "Home", link: "/en/" },
                    { text: "Getting Started", link: "/en/getting-started/installation" },
                    { text: "Core Concepts", link: "/en/concepts/terms" },
                    { text: "API Reference", link: "/en/api/typescript" },
                    { text: "Support Packages", link: "/en/support-packages/bnf" },
                    { text: "Examples", link: "/en/examples/basic" },
                ],
                sidebar: [
                    {
                        text: "Getting Started",
                        items: [
                            { text: "Installation", link: "/en/getting-started/installation" },
                            { text: "Quick Start", link: "/en/getting-started/quickstart" },
                        ],
                    },
                    {
                        text: "Core Concepts",
                        items: [
                            { text: "Terms", link: "/en/concepts/terms" },
                            { text: "Rules", link: "/en/concepts/rules" },
                            { text: "Search Engine", link: "/en/concepts/search" },
                        ],
                    },
                    {
                        text: "API Reference",
                        items: [
                            { text: "TypeScript API", link: "/en/api/typescript" },
                            { text: "Python API", link: "/en/api/python" },
                            { text: "C++ API", link: "/en/api/cpp" },
                        ],
                    },
                    {
                        text: "Support Packages",
                        items: [
                            { text: "BNF", link: "/en/support-packages/bnf" },
                            { text: "E-Graph", link: "/en/support-packages/egg" },
                        ],
                    },
                    {
                        text: "Examples",
                        items: [
                            { text: "Basic Examples", link: "/en/examples/basic" },
                            { text: "Sudoku", link: "/en/examples/sudoku" },
                        ],
                    },
                ],
            },
        },
        zh: {
            label: "简体中文",
            lang: "zh",
            link: "/zh/",
            themeConfig: {
                nav: [
                    { text: "首页", link: "/zh/" },
                    { text: "快速开始", link: "/zh/getting-started/installation" },
                    { text: "核心概念", link: "/zh/concepts/terms" },
                    { text: "API 参考", link: "/zh/api/typescript" },
                    { text: "支持包", link: "/zh/support-packages/bnf" },
                    { text: "示例", link: "/zh/examples/basic" },
                ],
                sidebar: [
                    {
                        text: "快速开始",
                        items: [
                            { text: "安装", link: "/zh/getting-started/installation" },
                            { text: "快速上手", link: "/zh/getting-started/quickstart" },
                        ],
                    },
                    {
                        text: "核心概念",
                        items: [
                            { text: "Term", link: "/zh/concepts/terms" },
                            { text: "Rule", link: "/zh/concepts/rules" },
                            { text: "搜索引擎", link: "/zh/concepts/search" },
                        ],
                    },
                    {
                        text: "API 参考",
                        items: [
                            { text: "TypeScript API", link: "/zh/api/typescript" },
                            { text: "Python API", link: "/zh/api/python" },
                            { text: "C++ API", link: "/zh/api/cpp" },
                        ],
                    },
                    {
                        text: "支持包",
                        items: [
                            { text: "BNF", link: "/zh/support-packages/bnf" },
                            { text: "E-Graph", link: "/zh/support-packages/egg" },
                        ],
                    },
                    {
                        text: "示例",
                        items: [
                            { text: "基础示例", link: "/zh/examples/basic" },
                            { text: "数独", link: "/zh/examples/sudoku" },
                        ],
                    },
                ],
            },
        },
    },

    themeConfig: {
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
