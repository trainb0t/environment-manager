module.exports = {
  env: {
    browser: true,
    jasmine: true,
    es6: true,
  },
  globals: {
    angular: false,
    _: false,
    moment: false,
    it: false,
    expect: false,
    beforeEach: false,
    inject: false,
    Promise: true
  },

  extends: ["eslint:recommended", "plugin:jasmine/recommended"],
  plugins: ['jasmine', 'angular'],

  rules: {
    "no-undef": "off"
  }
};
