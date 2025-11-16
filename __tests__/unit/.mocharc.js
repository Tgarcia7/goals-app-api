module.exports = {
  colors: true,
  environment: { NODE_ENV: 'test' },
  file: '__tests__/unit/globalHooks.ts',
  spec: '__tests__/unit/**/*.test.ts',
  recursive: true,
  reporters: ['spec', 'mocha-junit-reporter'],
  timeout: 15000,
  traceDeprecation: true,
  require: ['ts-node/register'],
  extension: ['ts']
}
