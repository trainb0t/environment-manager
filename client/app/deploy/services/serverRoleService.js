/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

(function () {
  angular
    .module('EnvironmentManager.deploy')
    .factory('clientServerRoleService', serverRoleService);

  serverRoleService.$inject = ['$http'];

  function serverRoleService($http) {
    return {
      create: create
    };

    function reduceDeploymentMaps(model) {
      return _.groupBy(model.DeploymentMaps, 'SelectedName');
    }

    function pushServiceIntoDeploymentMap(deploymentMapServerRoles, model, map) {
      var templates = {
        default: function (name, ami, instanceType, primaryDiskSizeGB, secondaryDiskSizeGB) {
          return {
            ServerRoleName: name,
            InstanceProfileName: 'roleInfraEnvironmentManager',
            OwningCluster: model.OwningCluster,
            RoleTag: name,
            PuppetRole: 'linux_nodejs_envmngr',
            Services: [],
            ContactEmailTag: 'jake.cross@thetrainline.com',
            AutoScalingSettings: {
              MinCapacity: 1,
              DesiredCapacity: 1,
              MaxCapacity: 1
            },
            Volumes: [
              {
                Size: primaryDiskSizeGB,
                Type: 'SSD',
                Name: 'OS'
              },
              {
                Size: secondaryDiskSizeGB,
                Type: 'SSD',
                Name: 'Data'
              }
            ],
            SecurityZone: 'Other',
            SubnetTypeName: 'PrivateApp',
            ClusterKeyName: 'TestPlatformDevelopment',
            TerminationDelay: 0,
            InstanceType: instanceType,
            AMI: ami,
            FleetPerSlice: false
          };
        },
        smallLinux: function (name) {
          return this.default(name, 'ubuntu-16.04-ttl-vanilla', 't2.medium', 20 /*Primary Disk GB*/, 20 /*Secondary Disk GB*/);
        },
        mediumLinux: function (name) {
          return this.default(name, 'ubuntu-16.04-ttl-vanilla', 't2.xlarge', 40 /*Primary Disk GB*/, 40 /*Secondary Disk GB*/);
        },
        largeLinux: function (name) {
          return this.default(name, 'ubuntu-16.04-ttl-vanilla', 'm5.2xlarge', 80 /*Primary Disk GB*/, 80 /*Secondary Disk GB*/);
        },
        smallWindows: function (name) {
          return this.default(name, 'windows-2012r2-ttl-app', 't2.medium', 40 /*Primary Disk GB*/, 40 /*Secondary Disk GB*/);
        },
        mediumWindows: function (name) {
          return this.default(name, 'windows-2012r2-ttl-app', 't2.xlarge', 40 /*Primary Disk GB*/, 80 /*Secondary Disk GB*/);
        },
        largeWindows: function (name) {
          return this.default(name, 'windows-2012r2-ttl-app', 'm5.2xlarge', 40 /*Primary Disk GB*/, 120 /*Secondary Disk GB*/);
        },
      };

      (deploymentMapServerRoles || []).forEach(function (role) {
        if (role.IsNewRole) {
          var details = role.SelectedRoleFullName.split(',').map(function (x) { return x.split(':')[1]; });
          var name = details[0];
          var platform = details[1];
          var type = details[2];
          switch (platform) {
            case 'windows':
              switch (type) {
                case 'small':
                  map.push(templates.smallWindows(name));
                  break;
                case 'medium':
                  map.push(templates.mediumWindows(name));
                  break;
                case 'large':
                  map.push(templates.largeWindows(name));
                  break;
              }
              break;
            case 'linux':
              switch (type) {
                case 'small':
                  map.push(templates.smallLinux(name));
                  break;
                case 'medium':
                  map.push(templates.mediumLinux(name));
                  break;
                case 'large':
                  map.push(templates.largeLinux(name));
                  break;
              }
              break;
          }
          let currentServiceRole = map.find(function (item) { return item.ServerRoleName === name; });
          currentServiceRole.Services.push({ ServiceName: model.ServiceName });
        } else {
          let currentServiceRole = map.find(function (item) { return item.ServerRoleName === role.SelectedRole; });
          if (!currentServiceRole.Services.find(function (service) { return service === model.ServiceName; })) {
            currentServiceRole.Services.push({ ServiceName: model.ServiceName });
          }
        }
      });
    }

    function create(model) {
      var maps = reduceDeploymentMaps(model);
      for (var entry of Object.entries(maps)) {
        var deploymentMapName = entry[0];
        var deploymentMapServerRoles = entry[1];
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
