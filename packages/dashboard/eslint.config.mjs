import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  ...vue.configs['flat/recommended'], // sets up vue-eslint-parser for .vue SFCs
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
    },
  },
  {
    // Build/tooling files run in Node (CommonJS), not the browser.
    files: ['config/**/*.js', '*.config.{js,cjs}', 'webpack.*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  prettier, // keep last: disables ESLint formatting rules that conflict with Prettier
];
