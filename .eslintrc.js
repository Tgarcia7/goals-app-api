module.exports = {
  'env': {
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 2022,
    'sourceType': 'module'
  },
  'plugins': ['@typescript-eslint'],
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'indent': [
      'warn',
      2,
      { 'SwitchCase': 1 }
    ],
    'quotes': [
      'warn',
      'single'
    ],
    'semi': [
      'warn',
      'never'
    ],
    'eqeqeq': [
      'warn'
    ],
    'no-multiple-empty-lines': [
      'warn', { 'max': 1 }
    ],
    '@typescript-eslint/no-unused-vars': [2, { 'vars': 'all', 'args': 'after-used' }],
    'no-unused-vars': 'off',
    'eol-last': [
      'warn',
      'always'
    ],
  }
}
