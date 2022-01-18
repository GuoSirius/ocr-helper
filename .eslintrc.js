require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    jest: true,
    node: true,
    browser: true,
    commonjs: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    '@vue/typescript/recommended',
    '@vue/prettier',
    // "@vue/prettier/@typescript-eslint",
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-typescript'
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    semi: ['error', 'never'],
    'vue/multi-word-component-names': 'off'
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        mocha: true
      }
    }
  ]
}
