/* Copyright (c) Trainline Limited, 2016-2018. All rights reserved. See LICENSE.txt in the project root for license information. */

angular.module('EnvironmentManager.deploy').directive('ngAutoFocus', function ($timeout) {
  return {
    restrict: 'AC',
    link: function (_scope, _element) {
      $timeout(function () {
        _element[0].focus();
      }, 0);
    }
  };
});

