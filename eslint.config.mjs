// import js from '@eslint/js';
// import tses from 'typescript-eslint';
// import prettierRec from 'eslint-plugin-prettier/recommended';
// import globals from 'globals';

// export default [
//   js.configs.recommended,
//   ...tses.configs.recommendedTypeChecked,
//   prettierRec,
//   {
//     ignores: ['eslint.config.mjs'],
//   },
//   {
//     // For test files - MUST come before main config to override properly
//     files: [
//       'services/**/test/**/*.ts',
//       'services/**/src/**/*.spec.ts',
//       '**/*.e2e-spec.ts',
//       '**/test/**/*.ts',
//       'test/**/*.ts'
//     ],
//     languageOptions: {
//       globals: {
//         ...globals.node,
//         ...globals.jest,
//       },
//       sourceType: 'module',
//       // No parserOptions = no type checking
//     },
//     rules: {
//       // Only basic rules that don't require type information
//       '@typescript-eslint/no-unused-vars': 'warn',
//       '@typescript-eslint/no-explicit-any': 'off',
//       '@typescript-eslint/ban-ts-comment': 'off',
      
//       // Explicitly disable ALL type-aware rules
//       '@typescript-eslint/no-unsafe-argument': 'off',
//       '@typescript-eslint/no-unsafe-assignment': 'off',
//       '@typescript-eslint/no-unsafe-call': 'off',
//       '@typescript-eslint/no-unsafe-member-access': 'off',
//       '@typescript-eslint/no-unsafe-return': 'off',
//       '@typescript-eslint/restrict-template-expressions': 'off',
//       '@typescript-eslint/no-floating-promises': 'off',
//       '@typescript-eslint/require-await': 'off',
//       '@typescript-eslint/await-thenable': 'off',
//       '@typescript-eslint/no-misused-promises': 'off',
//       '@typescript-eslint/unbound-method': 'off',
//       '@typescript-eslint/restrict-plus-operands': 'off',
//       '@typescript-eslint/no-unnecessary-type-assertion': 'off',
//     },
//   },
//   {
//     // Main configuration for source files
//     languageOptions: {
//       globals: {
//         ...globals.node,
//         ...globals.jest,
//       },
//       sourceType: 'module',
//       parserOptions: {
//         project: './tsconfig.base.json',
//         tsconfigRootDir: import.meta.dirname,
//       },
//     },
//     rules: {
//       ...tses.configs.recommendedTypeChecked.rules,
//       '@typescript-eslint/no-explicit-any': 'off',
//       '@typescript-eslint/no-floating-promises': 'warn',
//       '@typescript-eslint/no-unsafe-argument': 'warn',
//       '@typescript-eslint/no-unsafe-assignment': 'off', 
//       '@typescript-eslint/no-unsafe-call': 'off',       
//       '@typescript-eslint/no-unsafe-member-access': 'off',
//     },
//   },
//   prettierRec,
// ];

import js from '@eslint/js';
import tses from 'typescript-eslint';
import prettierRec from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  // Basic JS config
  js.configs.recommended,
  
  // Ignore patterns - add more as needed
  {
    ignores: [
      'eslint.config.mjs',
      '**/node_modules/**',
      '**/dist/**',
      '**/*.d.ts',
      '**/coverage/**',
      '**/.next/**',
      '**/build/**'
    ],
  },
  
  // Test files configuration (lighter rules)
  {
    files: [
      'services/**/test/**/*.ts',
      'services/**/src/**/*.spec.ts',
      '**/*.e2e-spec.ts',
      '**/test/**/*.ts',
      'test/**/*.ts'
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  
  // Main configuration for source files (FASTER - no type checking by default)
  {
    files: ['**/*.ts', '**/*.tsx'],
    ...tses.configs.recommended, // Use recommended instead of recommendedTypeChecked
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      // Remove parserOptions entirely for faster linting
    },
    rules: {
      // Essential rules only for speed
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      
      // Disable slow type-checking rules
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
  
  // Prettier config (should be last)
  prettierRec,
];