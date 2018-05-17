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
    vm.deploymentMaps = ['PlatformServices'];
    vm.selectedServerRoleType = 'Linux';
    vm.serverRoleTypes = ['Linux', 'Windows', 'Custom'];

    function init() {
      portservice.getNextSequentialPair().then(function(portPair){
        vm.bluePort = portPair.Blue;
        vm.greenPort = portPair.Green;
      });
      cachedResources.config.clusters.all().then(function(clusters){
        vm.owningClusters = _.map(clusters, 'ClusterName').sort();
      });
    }


    vm.finishedWizard = function(){
      console.log('Wizard finished ... ');
    };

    vm.cancelledWizard = function(){
      console.log('Wizard cancelled ... ');
    };

    $scope.$on('wizard:stepChanged', function(event, args) {
      console.log('Step changed ... ');
      console.log(args);
    });

    init();
  });

