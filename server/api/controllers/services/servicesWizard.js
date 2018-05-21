/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

let clusters = require('../../../modules/data-access/clusters');
let deploymentMaps = require('../../../modules/data-access/deploymentMaps');

function getData(req, res, next) {
  const template = {};
  const dataCollection = [deploymentMaps.scan(), clusters.scan()];

  Promise.all(dataCollection)
    .then(addCollectedDataTo(template))
    .then(handleResponse);

  function handleResponse(template) {
    res.json(template)
      .catch((e) => {
        res.status(400).json({
          errors: [{ title: 'Wizard error', detail: e.message }]
        }); next(e);
      });
  }
}

function addCollectedDataTo(template) {
  return (collectedData) => {
    let [deploymentData, clusterData] = collectedData;
    assignDeploymentDataToTemplate(template, deploymentData);
    assignClusterDataToTemplate(template, clusterData);
    return template;
  };
}

function assignDeploymentDataToTemplate(template, deploymentData) {
  template.deploymentMaps = deploymentData.sort(sortByDeploymentNameAscending)
    .map(deploymentMap => ({ 
      name: deploymentMap.DeploymentMapName,
      roles: deploymentMap.Value.DeploymentTarget.map(role => role.ServerRoleName).sort()
    }));
  return template;

  function sortByDeploymentNameAscending(a, b) {
    return a.DeploymentMapName > b.DeploymentMapName
  }
}

function assignClusterDataToTemplate(template, clusterData) {
  template.owningTeams = clusterData.map(c => c.ClusterName).sort();
  return template;
}

module.exports = {
  getData
};
