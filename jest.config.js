process.env.NODE_PATH = '.';
process.env.LOG_SILENT = true;
process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';
module.exports = {
  cache: false,
  resetMocks: true,
  modulePaths: ['<rootDir>'],
  reporters: ['default'],
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.[t]s?(x)',
    '**/?(*.)+(spec).[t]s?(x)',
    '!**/?(*.)+(func\.spec).[t]s?(x)'
  ],
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  }
};