// functions/eslint.config.js
const typescriptParser = require("@typescript-eslint/parser");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser: typescriptParser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      "quotes": ["error", "double"],
      "indent": ["error", 2],
      "no-unused-vars": "off", // Turn off base rule
      "@typescript-eslint/no-unused-vars": ["warn"],
      "no-console": "off",
      "semi": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
  {
    ignores: ["lib/**/*", "generated/**/*", "node_modules/**/*"],
  },
];