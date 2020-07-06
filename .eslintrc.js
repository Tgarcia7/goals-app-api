module.exports = {
  'env': {
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'parserOptions': {
    'ecmaVersion': 2018
  },
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
    'no-unused-vars': [2, { 'vars': 'all', 'args': 'after-used' }]
  }
}