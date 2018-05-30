'use strict';

var homePage = require('../../pages/home-page')
var loginPage = require('../../pages/login-page')
var configPage = require('../../pages/config-page')
var newServicePage = require('../../pages/deploy/createnewservice-page')

var assert = require('assert');

describe.only('When creating new services', function () {
  beforeEach(() => {
    homePage.load();
    loginPage.logIn('anyUser', 'anyPassword');
    homePage.navigateToNewService();
    browser.pause(250);
  });

  it('Then I should be able to create one easily using a wizard', function () {
    newServicePage.fillInStep1('any-new-service', 'Bonsai');
    newServicePage.nextStep(1);
    browser.waitForExist('legend=Deployment Details');
    newServicePage.fillInStep2('PlatformServices', 'c50', 'BlueGreenTest');
    newServicePage.nextStep(2);
    browser.waitForExist('legend=Confirmation');
    newServicePage.nextStep(3);
    browser.pause(2000);
  });

});
