/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

let clusters = require('../../../modules/data-access/clusters');
let deploymentMaps = require('../../../modules/data-access/deploymentMaps');
let environments = require('../../../modules/data-access/configEnvironments');

/**
 * GET /services/wizard
 */
function getData(req, res, next) {
  const template = {};
  const dataCollection = [deploymentMaps.scan(), clusters.scan(), environments.scan()];

  Promise.all(dataCollection)
    .then(addCollectedDataTo(template))
    .then(handleResponse(res, next));
}

function addCollectedDataTo(template) {
  return (collectedData) => {
    let [deploymentData, clusterData, environmentData] = collectedData;
    assignDeploymentDataToTemplate(template, deploymentData, environmentData);
    assignClusterDataToTemplate(template, clusterData);
    return template;
  };
}

function assignDeploymentDataToTemplate(template, deploymentData, environmentData) {
  template.deploymentMaps = deploymentData.sort(sortByDeploymentNameAscending)
    .map(deploymentMap => ({
      name: deploymentMap.DeploymentMapName,
      roles: deploymentMap.Value.DeploymentTarget.map(role => role.ServerRoleName).sort(),
      environments: environmentData.filter(e => e.Value.DeploymentMap === deploymentMap.DeploymentMapName).map(e => e.EnvironmentName).sort()
    }));
  for (let deploymentMap of template.deploymentMaps) {
    deploymentMap.roles.unshift('Create new role ... ');
  }
  return template;

  function sortByDeploymentNameAscending(a, b) {
    return a.DeploymentMapName > b.DeploymentMapName;
  }
}

function assignClusterDataToTemplate(template, clusterData) {
  template.owningTeams = clusterData.map(c => c.ClusterName).sort();
  return template;
}

function handleResponse(res, next) {
  return (data) => {
    try {
      res.json(data);
    } catch (e) {
      res.status(400).json({
        errors: [{ title: 'Wizard error', detail: e.message }]
      });
      next(e);
    }
  };
}

module.exports = {
  getData
};
