/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

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
    ],

  }
  return res.json(template)
    .catch(e => { res.status(400).json({ errors: [{ title: 'Wizard error', detail: e.message }] }); next(e); });
}

module.exports = {
  getData
};
