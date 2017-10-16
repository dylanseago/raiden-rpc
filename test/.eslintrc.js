module.exports = {
  "plugins": [
    "mocha",
    "chai-expect"
  ],
  "env": {
    "mocha": true
  },
  "rules": {
    "chai-expect/missing-assertion": 2,
    "chai-expect/terminating-properties": 1,
    "import/no-extraneous-dependencies": 0,
  }
};
