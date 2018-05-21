/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

let clusters = require('../../../modules/data-access/clusters');
let deploymentMaps = require('../../../modules/data-access/deploymentMaps');

function getData(req, res, next) {
  const template = {
    owningTeams: [
      'Bonsai',
      'Ransom'
    ],
    deploymentMaps: [
      { name: 'Cluster', roles: [' Cluster Role 1', 'Cluster Role 2'] },
      { name: 'Staging', roles: ['Staging Role 1', 'Staging Role 2'] },
      { name: 'Production', roles: ['Production Role 1', 'Production Role 2'] }
    ]
  };

  Promise.all([deploymentMaps.scan(), clusters.scan()])
  .then((results) => {
    let deploymentData = results[0];
    template.deploymentMaps = deploymentData.sort((a, b) => a.DeploymentMapName > b.DeploymentMapName).map((n) => {
      return { name: n.DeploymentMapName, roles: n.Value.DeploymentTarget.map(o => o.ServerRoleName).sort() };
    });
    let clusterData = results[1];
    template.owningTeams = clusterData.map(c => c.ClusterName).sort();
    res.json(template)
      .catch((e) => {
        res.status(400).json({
          errors: [{ title: 'Wizard error', detail: e.message }]
        }); next(e);
      });
  });
}

module.exports = {
  getData
};
