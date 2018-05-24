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

    function reduceDeploymentMaps(model) {
      return model.DeploymentMaps.reduce(function (acc, curr) {
        acc[curr.SelectedName] = acc[curr.SelectedName] || [];
        acc[curr.SelectedName].push(curr);
        return acc;
      }, {});
    }

    function smallLinux(name) {
      return {
        "ServerRoleName": name,
        "InstanceProfileName": "roleInfraEnvironmentManager",
        "OwningCluster": "Infra",
        "RoleTag": name,
        "PuppetRole": "linux_nodejs_envmngr",
        "Services": [],
        "ContactEmailTag": "platform.development@thetrainline.com",
        "AutoScalingSettings": {
          "MinCapacity": 1,
          "DesiredCapacity": 1,
          "MaxCapacity": 1
        },
        "Volumes": [
          {
            "Size": 8,
            "Type": "SSD",
            "Name": "OS"
          },
          {
            "Size": 10,
            "Type": "Disk",
            "Name": "Data"
          }
        ],
        "SecurityZone": "Other",
        "SubnetTypeName": "PrivateApp",
        "ClusterKeyName": "TestPlatformDevelopment",
        "TerminationDelay": 0,
        "InstanceType": "t2.micro",
        "AMI": "ubuntu-16.04-ttl-vanilla",
        "FleetPerSlice": false
      }
    }

    function pushServiceIntoDeploymentMap(deploymentMapServerRoles, model, map) {
      (deploymentMapServerRoles || []).forEach(function (role) {
        if (role.IsNewRole) {
          map.push(smallLinux(role.SelectedRole));
          var currentServiceRole = map.find(function (item) { return item.ServerRoleName === role.SelectedRole });
          currentServiceRole.Services.push({ ServiceName: model.ServiceName });
        } else {
          var currentServiceRole = map.find(function (item) { return item.ServerRoleName === role.SelectedRole; });
          if (!currentServiceRole.Services.find(function (service) { return service === model.ServiceName; })) {
            currentServiceRole.Services.push({ ServiceName: model.ServiceName });
          }
        }
      });
    }

    function create(model) {
      var maps = reduceDeploymentMaps(model);
      for (let [deploymentMapName, deploymentMapServerRoles] of Object.entries(maps)) {
        return $http.get(`/api/v1/config/deployment-maps/${deploymentMapName}`)
          .then(function (result) {
            var map = result.data.Value.DeploymentTarget;
            pushServiceIntoDeploymentMap(deploymentMapServerRoles, model, map);
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
