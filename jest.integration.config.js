module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test file patterns - Integration tests
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.js',
    '<rootDir>/tests/integration/**/*.spec.js'
  ],
  
  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Longer timeout for integration tests
  testTimeout: 10000,
  
  // Coverage (optional for integration tests)
  collectCoverage: false,
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/'
  ],
  
  // Mock modules
  moduleNameMapping: {
    '^firebase/app$': '<rootDir>/tests/mocks/firebase.js',
    '^firebase/auth$': '<rootDir>/tests/mocks/firebase.js',
    '^firebase/firestore$': '<rootDir>/tests/mocks/firebase.js'
  },
  
  // Globals
  globals: {
    'window': {},
    'document': {},
    'localStorage': {}
  },
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset modules between tests
  resetModules: true
};
