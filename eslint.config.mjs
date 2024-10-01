import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [{
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "module",

        parserOptions: {
            project: "tsconfig.json",
            tsconfigRootDir: __dirname,
        },
    },

    rules: {
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/dot-notation": "error",

        "@typescript-eslint/explicit-member-accessibility": ["error", {
            accessibility: "explicit",
        }],

        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-require-imports": "error",

        "@typescript-eslint/no-shadow": ["error", {
            hoist: "all",
        }],

        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",

        "@typescript-eslint/triple-slash-reference": "error",
        "brace-style": ["error", "1tbs"],
        "comma-dangle": ["error", "always-multiline"],
        curly: ["error", "multi-line"],
        "default-case": "error",
        "eol-last": "error",
        eqeqeq: ["error", "smart"],
        "guard-for-in": "error",

        "id-blacklist": [
            "error",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined",
        ],

        "id-match": "error",

        "max-len": ["error", {
            code: 140,
        }],

        "no-bitwise": "error",
        "no-caller": "error",
        "no-cond-assign": "error",

        "no-console": ["error", {
            allow: [
                "log",
                "warn",
                "dir",
                "timeLog",
                "assert",
                "clear",
                "count",
                "countReset",
                "group",
                "groupEnd",
                "table",
                "dirxml",
                "error",
                "groupCollapsed",
                "Console",
                "profile",
                "profileEnd",
                "timeStamp",
                "context",
            ],
        }],

        "no-debugger": "error",
        "no-empty": "error",
        "no-eval": "error",
        "no-fallthrough": "error",
        "no-invalid-this": "error",
        "no-multiple-empty-lines": "off",
        "no-new-wrappers": "error",
        "no-null/no-null": "off",
        "no-redeclare": "error",
        "no-trailing-spaces": "error",
        "no-unused-labels": "error",
        "no-var": "error",
        "one-var": ["error", "never"],
        radix: "error",

        "spaced-comment": ["error", "always", {
            markers: ["/"],
        }],

        "use-isnan": "error",
    },
}];
