/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

(function () {
  angular
    .module('EnvironmentManager.deploy')
    .factory('clientServerRoleService', serverRoleService);

  serverRoleService.$inject = ['$http'];

  function serverRoleService($http) {
    return {
      create
    };

    function reduceDeploymentMaps (model){
      return model.DeploymentMaps.reduce(function (acc, curr) {
        acc[curr.SelectedName] = acc[curr.SelectedName] || [];
        acc[curr.SelectedName].push(curr);
        return acc;
      }, {});
    }

    function pushServiceIntoDeploymentMap(deploymentMapServerRoles, model){
      (deploymentMapServerRoles||[]).forEach(function (role) {
        var currentServiceRole = map.find(function (item) { return item.ServerRoleName === role.SelectedRole; });
        if (!currentServiceRole.Services.find(function (service) { return service === model.ServiceName; })) {
          currentServiceRole.Services.push({ ServiceName: model.ServiceName });
        }
      });
    }

    function create(model) {
      var maps = reduceDeploymentMaps(model);
      for (let [deploymentMapName, deploymentMapServerRoles] of Object.entries(maps)) {
        return $http.get(`/api/v1/config/deployment-maps/${deploymentMapName}`)
          .then(function (result) {
            var map = result.data.Value.DeploymentTarget;
            pushServiceIntoDeploymentMap(deploymentMapServerRoles, model);
            result.data.Value['expected-version'] = result.data.Version;
            return $http({
              method: 'put',
              data: result.data.Value,
              url: `/api/v1/config/deployment-maps/${deploymentMapName}`,
              headers: { 'expected-version': result.data.Version }
            });
          });
      }
    }
  }
}());
