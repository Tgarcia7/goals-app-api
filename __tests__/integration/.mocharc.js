module.exports = {
  colors: true,
  file: '__tests__/integration/globalHooks.js',
  reporters: ['spec', 'mocha-junit-reporter'],
  timeout: 15000,
  traceDeprecation: true,
  NODE_ENV: 'test'
}
