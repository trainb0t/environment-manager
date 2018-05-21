/* TODO: enable linting and fix resulting errors */
/* eslint-disable */
/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

angular.module('EnvironmentManager.deploy').controller('DeployController',
  function ($scope, $routeParams, $location, $uibModal, $http, $q, modal,
    resources, cachedResources, Environment, localstorageservice, teamstorageservice,
    WizardHandler, portservice) {

    var vm = this;
    vm.dataLoading = false;

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
      vm.selectedDeploymentMaps.push({ DeploymentMap: 'new Map', ServerRole: '' })
    }

    vm.createDeploymentMap = function (index) {
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
      instance.result.then(function(result){
        vm.selectedDeploymentMaps[index].IsNewRole = true;
        vm.selectedDeploymentMaps[index].SelectedRole = `New Role(${result.selectedPlatform},${result.selectedPlatformSize})`;
      });
    }

    vm.removeDeploymentMap = function (index) {
          vm.selectedDeploymentMaps.splice(index, 1);
        }

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

