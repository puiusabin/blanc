import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default [
  // Base ESLint recommended config
  js.configs.recommended,

  // TypeScript config
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      // Next.js rules
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,

      // TypeScript rules adjustments
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
    settings: {
      next: {
        rootDir: "./",
      },
    },
  },

  {
    ignores: [
      ".next/**",
      ".open-next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "*.config.{js,ts,mjs}",
    ],
  },
];
