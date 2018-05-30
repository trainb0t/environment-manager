/* Copyright (c) Trainline Limited, 2016-2018. All rights reserved. See LICENSE.txt in the project root for license information. */

angular.module('EnvironmentManager.deploy').directive('ngNoSpaces', function () {
  return {
    restrict: 'A',
    link: function ($scope, $element) {
      $element.bind('keydown', function (e) {
        if (e.which === 32) {
          e.preventDefault();
        }
      });
    }
  };
});

