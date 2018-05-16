/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

angular.module('EnvironmentManager.deploy', [
  'ngRoute',
  'ui.bootstrap',
  'EnvironmentManager.common'
]);

angular.module('EnvironmentManager.deploy').config(function ($routeProvider) {
  $routeProvider
    .when('/deploy', {
      templateUrl: '/app/deploy/deploy.html',
      controller: 'DeployController as vm',
      reloadOnSearch: false,
      menusection: ''
    });
});
