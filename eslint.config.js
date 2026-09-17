import globals from "globals";
import eslintJs from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import { defineConfig } from "eslint/config";

export default defineConfig({
  files: ["**/*.{js,jsx}"],

  extends: [
    eslintJs.configs.recommended,
    eslintReact.configs.recommended,
  ],

  languageOptions: {
    globals: {
      ...globals.browser,
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },

  rules: {
    "@eslint-react/no-missing-key": "warn",
    "@eslint-react/no-unused-class-component-members": "warn",
    "@eslint-react/no-unused-state": "warn",
    "@eslint-react/no-use-context": "warn",
    "@eslint-react/naming-convention-id-name": "warn",
    "@eslint-react/static-components": "warn",
    "no-unused-vars": "warn",
    "no-undef": "warn",
  },
});