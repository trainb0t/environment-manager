/* TODO: enable linting and fix resulting errors */
/* eslint-disable */
/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

angular.module('EnvironmentManager.deploy').controller('DeployController',
  function ($scope, $routeParams, $location, $uibModal, $http, $q, modal,
    resources, cachedResources, Environment, localstorageservice, teamstorageservice,
    WizardHandler, portservice) {

    var vm = this;

    vm.bluePort = 40000;
    vm.greenPort = 41000;
    vm.applicationID = 0;
    vm.owningClusters = [];
    vm.createNewDeploymentMap = true;

    vm.deploymentMaps = [{
      Name: 'Cluster',
      Roles: ['Service C.A', 'Service C.B', 'Service C.C'],
    }, {
      Name: 'Staging',
      Roles: ['Service S.A', 'Service S.B', 'Service S.C'],
    },
    {
      Name: 'Production',
      Roles: ['Service P.A', 'Service P.B', 'Service P.C']
    }];

    vm.selectedDeploymentMaps = [];

    vm.serverRoleTypes = ['Linux', 'Windows', 'Custom'];
    vm.selectedServerRoleType = 'Linux';

    vm.serverRoleSizeTypes = ['Small', 'Medium', 'Large'];
    vm.selectedServerRoleSizeType = 'Medium';

    function init() {
      portservice.getNextSequentialPair().then(function (portPair) {
        vm.bluePort = portPair.Blue;
        vm.greenPort = portPair.Green;
      });
      cachedResources.config.clusters.all().then(function (clusters) {
        vm.owningClusters = _.map(clusters, 'ClusterName').sort();
      });
    }

    // TODO: This is rubbish and should not be here. Please see rubbish bindings in deploymentmap-details.html
    vm.findDeploymentMapByName = function(deploymentMapName){
      return vm.deploymentMaps.find(function (map) {
        return map.Name === deploymentMapName;
      });
    }

    vm.addDeploymentMap = function () {
      vm.selectedDeploymentMaps.push({ DeploymentMap: 'new Map', ServerRole: '' })
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

