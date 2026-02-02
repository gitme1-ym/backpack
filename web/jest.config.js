/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["package.json"],
  coveragePathIgnorePatterns: ["/node_modules/"],
};