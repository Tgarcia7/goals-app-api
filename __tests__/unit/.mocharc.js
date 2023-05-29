module.exports = {
  colors: true,
  environment: { NODE_ENV: 'test' },
  file: '__tests__/unit/globalHooks.js',
  recursive: true,
  reporters: ['spec', 'mocha-junit-reporter'],
  timeout: 15000,
  traceDeprecation: true
}
