module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { 
      configFile: './babel.config.js',
      targets: { node: 'current' },
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  extensionsToTreatAsEsm: ['.jsx'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch|fetch-blob|data-uri-to-buffer|formdata-polyfill)/)'
  ],
  globals: {
    'import.meta': {
      url: 'https://example.com'
    }
  }
};
