/* TODO: enable linting and fix resulting errors */
/* eslint-disable */
/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

angular.module('EnvironmentManager.deploy').controller('ServerRoleController',
  function ($scope, $location, $uibModalInstance, $uibModal, $q, Image, resources, cachedResources, modal, foo) {
    var vm = this;

    vm.ok = function() {
      return $uibModalInstance.close({
        selectedPlatform:vm.selectedPlatform, 
        selectedPlatformSize: vm.selectedPlatformSize
      });
    };

    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    };

  });