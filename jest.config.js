module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ["src/index.ts"],
  coverageDirectory: "coverage",
  moduleFileExtensions: ["js", "ts"],
  testEnvironment: "node",
  "transform": {
    "^.+\\.ts?$": "ts-jest"
  },
};
