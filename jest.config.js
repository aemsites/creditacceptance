module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
