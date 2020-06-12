require('dotenv').config();

module.exports = {
  preset: 'ts-jest',
  globalSetup: "./src/__test__/setup.js",
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
      babelConfig: 'babel.test.config.js',
    },
  },
};
