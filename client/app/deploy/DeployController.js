/* TODO: enable linting and fix resulting errors */
/* eslint-disable */
/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

angular.module('EnvironmentManager.deploy').controller('DeployController',
  function ($scope, $routeParams, $location, $uibModal, $http, $q, modal,
    resources, cachedResources, Environment, localstorageservice, teamstorageservice,
    WizardHandler, serviceService, clientUpstreamService, clientLoadBalancerService, clientServerRoleService, portservice) {

    var vm = this;

    vm.dataLoading = false;

    vm.model = {
      ServiceName: '',
      OwningCluster: '',
      DeploymentMaps: [{}]
    };

    vm.owningClusters = [];
    vm.deploymentMaps = [];
    vm.serverRoleTypes = ['Linux', 'Windows', 'Custom'];
    vm.serverRoleSizeTypes = ['Small', 'Medium', 'Large'];

    vm.createNewDeploymentMap = true;
    vm.selectedDeploymentMaps = [];

    vm.selectedServerRoleType = 'Linux';
    vm.selectedServerRoleSizeType = 'Medium';

    function init() {
      startLoadingData()
        .then(setupControllerData)
        .then(stopLoadingData);
    }

    function startLoadingData() {
      vm.dataLoading = true;
      return Promise.resolve();
    }

    function stopLoadingData() {
      vm.dataLoading = false;
      return Promise.resolve();
    }

    function setupControllerData() {
      return $http.get(`/api/v1/services/wizard`)
        .then(function (response) {
          console.log(response)
          vm.deploymentMaps = response.data.deploymentMaps;
          vm.owningClusters = response.data.owningTeams;
        });
    }

    // TODO: This is rubbish and should not be here. Please see rubbish bindings in deploymentmap-details.html
    vm.findDeploymentMapByName = function (deploymentMapName) {
      return vm.deploymentMaps.find(function (map) {
        return map.name === deploymentMapName;
      });
    }

    vm.addDeploymentMap = function (index) {
      vm.model.DeploymentMaps.push({});
    }

    vm.createNewServerRole = function (index) {
      var instance = $uibModal.open({
        templateUrl: '/app/deploy/views/modals/server-role-modal.html',
        controller: 'ServerRoleController as vm',
        size: 'lg',
        resolve: {
          foo: function () {
            return "ping!";
          }
        }
      });
      instance.result.then(function (result) {
        vm.model.DeploymentMaps[index].IsNewRole = true;
        vm.model.DeploymentMaps[index].SelectedRole = `New Role(${result.selectedPlatform},${result.selectedPlatformSize})`;
      });
    }

    vm.removeDeploymentMap = function (index) {
      vm.model.DeploymentMaps.splice(index, 1);
    }

    vm.doAllTheThings = function () {
      function createJob(main, ...subs) {
        return { Name: main, SubTasks: subs.map(t => t) }
      }

      var portsUsed;

      function createService() {
        return serviceService.create(vm.model)
          .then(function (pair) {
            portsUsed = pair;
            completedJobs.push(createJob('Create Service', 'Create Service Ports', 'Create Service ID'));
          });
      }

      function addServiceToServerRole() {
        return clientServerRoleService.create(vm.model)
          .then(function () {
            completedJobs.push(createJob('Add Service to Deployment Map -> Server Role'));
          })
      }

      function createUpstream() {
        if (!vm.model.ServiceType.toLowerCase().startsWith('http')) return Promise.resolve();
        
        let promises = [];
        for (let deploymentMap of vm.model.DeploymentMaps) {
          promises.push(clientUpstreamService.create(deploymentMap.SelectedEnvironment, vm.model.ServiceName, portsUsed.Blue, portsUsed.Green).then(() => {
            completedJobs.push(createJob('Create Load Balancer Settings'));
          }));
        }
        return Promise.all(promises);
      }

      function createLoadBalancerSettings() {
        let promises = [];
        for (let deploymentMap of vm.model.DeploymentMaps) {
          promises.push(clientLoadBalancerService.create(deploymentMap.SelectedEnvironment, vm.model.ServiceName).then(() => {
            completedJobs.push(createJob('Create Load Balancer Settings'));
          }));
        }
        return Promise.all(promises);
      }

      var completedJobs = [];

      return Promise.all([createService()])
        .then(function () {
          return Promise.all([
            addServiceToServerRole(),
            createUpstream(),
            createLoadBalancerSettings()
          ]);
        })
        .then(function () { vm.result = completedJobs; $scope.$apply(); console.log(vm.result) });
    };

    vm.finishedWizard = function () {
      console.log('Wizard finished ... ');
    };

    vm.cancelledWizard = function () {
      console.log('Wizard cancelled ... ');
    };

    $scope.$on('wizard:stepChanged', function (event, args) {
      console.log('Step changed ... ');
      console.log(args);
    });

    init();
  });

