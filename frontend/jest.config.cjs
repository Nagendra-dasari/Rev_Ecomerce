module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx"],
  transform: {
    "^.+\\.[tj]sx?$": ["babel-jest", { configFile: "./babel.config.cjs" }],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": "identity-obj-proxy",
  },
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
};
