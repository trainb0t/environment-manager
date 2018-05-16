/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

angular.module('EnvironmentManager.deploy', [
  'ngRoute',
  'ui.bootstrap',
  'mgo-angular-wizard',
  'EnvironmentManager.common',
  'EnvironmentManager.configuration'
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
