module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
  ],
  rules: {
    // Disable all rules that might cause errors
    "quotes": "off",
    "indent": "off", 
    "max-len": "off",
    "comma-dangle": "off",
    "object-curly-spacing": "off",
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "no-unused-vars": "warn",
    "no-console": "off",
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
};
