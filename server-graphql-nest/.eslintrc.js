module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: ['plugin:@typescript-eslint/recommended'],
    root: true,
    env: {
        node: true,
        jest: true
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        'no-restricted-syntax': [
            'error',
            {
                selector:
                    'ImportDeclaration[source.value=/graphql-types/] > ImportSpecifier',
                message:
                    'Named imports are not allowed for "graphql-types" imports. Use "import * as GraphQLTypes [...]" instead.'
            }
        ]
    }
};
