require('dotenv').config();

module.exports = {
  preset: 'ts-jest',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
};
