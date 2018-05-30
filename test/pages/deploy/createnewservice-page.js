/* eslint-disable */
'use strict';

const uuid = require('uuid/v4');

module.exports = {
  fillInStep1: (serviceName, owningCluster) => {
    browser.waitForExist('#serviceName');
    browser.setValue('input[name=serviceName]', `${serviceName}-${uuid()}`);
    browser.selectByVisibleText('select[name=owningCluster]', owningCluster);
    browser.pause(250);
  },
  fillInStep2: (deploymentMapName, environmentName, roleName) => {
    browser.waitForExist('select[name=SelectedDeploymentMap_0]');
    browser.selectByVisibleText('select[name=SelectedDeploymentMap_0]', deploymentMapName);
    browser.selectByVisibleText('select[name=SelectedDeploymentMap_Environment_0]', environmentName);
    browser.selectByVisibleText('select[name=SelectedDeploymentMap_ServerRole_0]', roleName);
    browser.pause(250);
  },
  fillInStep3: (serviceName, owningCluster) => {
  },
  fillInStep4: (serviceName, owningCluster) => {
  },
  nextStep: (stepNumber) => {
    browser.click('#nextButton' + stepNumber);
  }
};