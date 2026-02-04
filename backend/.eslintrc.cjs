module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: ['eslint:recommended', 'prettier'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'no-console': 'off',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
        'prefer-template': 'error',
        'no-useless-concat': 'error',
        'prettier/prettier': 'error',
    },
    plugins: ['prettier'],
};
