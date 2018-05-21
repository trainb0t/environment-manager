/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

let clusters = require('../../../modules/data-access/clusters');
let deploymentMaps = require('../../../modules/data-access/deploymentMaps');

/**
 * GET /services/wizard
 */
function getData(req, res, next) {
  const template = {};
  const dataCollection = [deploymentMaps.scan(), clusters.scan()];

  Promise.all(dataCollection)
    .then(addCollectedDataTo(template))
    .then(handleResponse(res, next));
}

/**
 * POST /services/wizard
 */
function createData(req, res, next) {
  let completedJobs = [];
  let operations = [
    createService(),
    addServiceToDeploymentMap(),
    createUpstream(),
    createLoadBalancerSettings()
  ];
  Promise.all(operations)
    .then(() => completedJobs)
    .then(handleResponse(res, next));

  function createJob(main, ...subs) {
    return { Name: main, SubTasks: subs.map(t => t) }
  }

  function createService() {
    completedJobs.push(createJob('Create Service', 'Create Service Ports', 'Create Service ID'));
  }

  function addServiceToDeploymentMap() {
    completedJobs.push(createJob('Add Service to Deployment Map -> Server Role'));
  }

  function createUpstream() {
    completedJobs.push(createJob('Create Upstream'));
  }

  function createLoadBalancerSettings() {
    completedJobs.push(createJob('Create Load Balancer Settings'));
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

function handleResponse(res, next) {
  return (data) => {
    try {
      res.json(data);
    } catch (e) {
      res.status(400).json({
        errors: [{ title: 'Wizard error', detail: e.message }]
      });
      next(e);
    };
  }
}

module.exports = {
  getData,
  createData
};
