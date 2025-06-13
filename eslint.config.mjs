import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import jsoncPlugin from 'eslint-plugin-jsonc';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import noRelativeImportPathsPlugin from 'eslint-plugin-no-relative-import-paths';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import requireExplicitGenericsPlugin from 'eslint-plugin-require-explicit-generics';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const defaultConfig = {
  files: ['src/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
  ignores: ['node_modules/**/*', 'coverage/**/*', 'build/**/*', 'dist/**/*', 'docker/**/*', 'public/**/*']
};

const typescriptRules = {
  '@typescript-eslint/array-type': 'error',
  '@typescript-eslint/array-type': 'warn',
  '@typescript-eslint/consistent-generic-constructors': 'warn',
  '@typescript-eslint/consistent-indexed-object-style': 'warn',
  '@typescript-eslint/consistent-type-definitions': 'off',
  '@typescript-eslint/consistent-type-imports': 'warn',
  '@typescript-eslint/default-param-last': 'off',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/indent': 'off',
  '@typescript-eslint/no-base-to-string': 'warn',
  '@typescript-eslint/no-duplicate-type-constituents': 'off',
  '@typescript-eslint/no-dynamic-delete': 'off',
  '@typescript-eslint/no-empty-function': 'warn',
  '@typescript-eslint/no-empty-object-type': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-floating-promises': 'warn',
  '@typescript-eslint/no-for-in-array': 'warn',
  '@typescript-eslint/no-inferrable-types': 'off',
  '@typescript-eslint/no-invalid-void-type': 'warn',
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/no-redundant-type-constituents': 'warn',
  '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
  '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
  '@typescript-eslint/no-unsafe-argument': 'warn',
  '@typescript-eslint/no-unsafe-assignment': 'warn',
  '@typescript-eslint/no-unsafe-call': 'warn',
  '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
  '@typescript-eslint/no-unsafe-function-type': 'warn',
  '@typescript-eslint/no-unsafe-member-access': 'warn',
  '@typescript-eslint/no-unsafe-return': 'warn',
  '@typescript-eslint/no-unused-expressions': 'off',
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/no-use-before-define': 'warn',
  '@typescript-eslint/no-wrapper-object-types': 'warn',
  '@typescript-eslint/prefer-as-const': 'warn',
  '@typescript-eslint/prefer-for-of': 'warn',
  '@typescript-eslint/space-before-function-paren': 'off',

  '@typescript-eslint/naming-convention': [
    'error',
    // Allow camelCase variables (23.2), PascalCase variables (23.8), and UPPER_CASE variables (23.10)
    {
      format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      leadingUnderscore: 'allow',
      selector: 'variable'
    },
    // Allow camelCase functions (23.2), and PascalCase functions (23.8)
    {
      format: ['camelCase', 'PascalCase'],
      leadingUnderscore: 'allow',
      selector: 'function'
    },
    // Airbnb recommends PascalCase for classes (23.3), and although Airbnb does not make TypeScript recommendations, we are assuming this rule would similarly apply to anything "type like", including interfaces, type aliases, and enums
    {
      format: ['PascalCase'],
      selector: 'typeLike'
    }
  ]
};

export default tseslint.config(
  // ESLint rules
  { ...eslint.configs.recommended, ...defaultConfig },
  // {
  //   ...eslint.configs.recommended,
  //   ...defaultConfig,
  //   rules: {
  //     'sort-keys': ['warn', 'asc', { caseSensitive: false, natural: false, minKeys: 2 }]
  //   }
  // },

  // Strict Typescript ESLint
  tseslint.configs.strict.map(config => ({
    ...config,
    ...defaultConfig,
    rules: { ...config.rules, ...typescriptRules }
  })),

  // Stylistic Typescript ESLint
  tseslint.configs.stylistic.map(config => ({
    ...config,
    ...defaultConfig,
    rules: {
      ...config.rules,
      ...typescriptRules,
      '@stylistic/indent': 'off',
      '@stylistic/jsx-curly-brace-presence': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/quote-props': 'off'
    }
  })),

  // Imports Plugin
  {
    ...importPlugin.flatConfigs.recommended,
    ...defaultConfig,
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    settings: { 'import/resolver': { typescript: true, node: true } },
    rules: {
      ...importPlugin.flatConfigs.recommended.rules,
      'import/imports-first': ['error', 'absolute-first'],
      'import/newline-after-import': 'error',
      'import/no-cycle': ['warn', { maxDepth: 1 }],
      'import/no-extraneous-dependencies': ['error', { devDependencies: true, packageDir: './' }],
      'import/no-named-as-default': 'off',
      'import/prefer-default-export': 'off'
    }
  },

  // Prettier
  eslintConfigPrettier,

  // JSX A11y Plugin
  {
    ...defaultConfig,
    plugins: { 'jsx-a11y': jsxA11yPlugin },
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn'
    }
  },

  // No Relative Import Paths Plugin
  {
    ...defaultConfig,
    plugins: { 'no-relative-import-paths': noRelativeImportPathsPlugin },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': [
        'warn',
        { allowSameFolder: false, prefix: '', rootDir: 'src' }
      ]
    }
  },

  // React Hook Plugin
  {
    ...defaultConfig,
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error'
    }
  },

  // JSON C Plugin
  jsoncPlugin.configs['flat/all'].map(config => ({
    ...config,
    ...defaultConfig,
    files: ['src/**/*.json'],
    rules: {
      ...config.rules,
      'jsonc/indent': 'off',
      'jsonc/key-name-casing': 'off'
    }
  })),

  // Require Explicit Generics Plugin
  {
    ...defaultConfig,
    plugins: { 'require-explicit-generics': requireExplicitGenericsPlugin },
    rules: {
      'require-explicit-generics/require-explicit-generics': ['warn', ['useState', 'useRef']]
    }
  },

  // React Refresh Plugin
  {
    ...defaultConfig,
    plugins: { 'react-refresh': reactRefreshPlugin },
    rules: {
      ...reactRefreshPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': 'off'
    }
  },

  // React Plugin
  {
    ...defaultConfig,
    plugins: { react: reactPlugin },
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser } },
    settings: {
      react: { version: 'detect' },
      formComponents: ['Form'],
      linkComponents: [
        { name: 'Link', linkAttribute: 'to' },
        { name: 'NavLink', linkAttribute: 'to' }
      ],
      'import/resolver': { typescript: {} }
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      'react/display-name': 'off',
      'react/jsx-curly-newline': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
      'react/jsx-no-literals': [
        'warn',
        {
          allowedStrings: ['/', ':', '(', ')', ':&nbsp;', '-', 'APA2B', '.'],
          ignoreProps: false,
          noAttributeStrings: false,
          noStrings: false
        }
      ],
      'react/jsx-one-expression-per-line': ['off', { allow: 'literal' }],
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-wrap-multilines': 'off',
      'react/no-array-index-key': 'off',
      'react/no-children-prop': 'off',
      'react/no-deprecated': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off'
    }
  },

  // Default Configuration
  {
    ...defaultConfig,
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      'no-async-promise-executor': 'off',
      'no-console': 'warn',
      'no-extra-boolean-cast': 'off',
      'no-param-reassign': 'warn',
      'no-prototype-builtins': 'warn',
      'no-unsafe-optional-chaining': 'warn',
      'no-unused-vars': 'warn',
      'no-var': 'warn',
      'prefer-const': 'warn'
    }
  }
);
