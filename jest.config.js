module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/unit/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    '*.js',
    '!app.js', // Main app file excluded as it's mostly initialization
    '!config.js', // Config file excluded
    '!firebase.js', // Firebase config excluded
    '!vertex-ai-test.html',
    '!node_modules/**',
    '!coverage/**',
    '!tests/**',
    '!.github/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Transform files
  transform: {},
  
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
