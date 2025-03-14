// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            ecmaVersion: 5,
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',

            // 🔥 Added Indentation Rules
            'indent': ['error', 'tab'],
            'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'], // Prevents mixed indentation issues

            // Prettier Override for Tab-Based Formatting
            'prettier/prettier': [
                'error',
                {
                    useTabs: true,
                    tabWidth: 4,    // Recommended for readability in NestJS projects
                    printWidth: 100  // Controls maximum line length for improved readability
                },
            ],
        },
    },
);
