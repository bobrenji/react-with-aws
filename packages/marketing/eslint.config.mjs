import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    settings: { react: { version: '17.0' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // React 17 + @babel/preset-react classic runtime needs React in scope.
      // Flip to 'off' if these apps switch to the automatic JSX runtime.
      'react/react-in-jsx-scope': 'error',
      'react/prop-types': 'off',
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
