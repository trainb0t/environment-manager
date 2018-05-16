/* TODO: enable linting and fix resulting errors */
/* eslint-disable */
/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

angular.module('EnvironmentManager.deploy').controller('DeployController',
  function ($scope, $routeParams, $location, $uibModal, $http, $q, modal, resources, cachedResources, Environment, localstorageservice, teamstorageservice) {
    var vm = this;
    vm.data = [];
    vm.dataLoading = false;

    function init() {
      console.log('Init called from deploy!');
    }

    init();
  });

