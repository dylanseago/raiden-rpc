module.exports = {
  "extends": "airbnb-base",
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
    "no-unused-expressions": 0,
    "no-param-reassign": 0,
  }
};
