module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parserOptions: {
        tsconfigRootDir: __dirname
    },
    plugins: ['react', 'react-hooks'],
    rules: {
        '@typescript-eslint/no-unused-vars': 'error'
    }
};
