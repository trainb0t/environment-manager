/* Copyright (c) Trainline Limited, 2016-2018. All rights reserved. See LICENSE.txt in the project root for license information. */

angular.module('EnvironmentManager.deploy').directive('ngEnter', function () {
  return function (scope, elements, attrs) {
    elements.bind('keydown keypress', function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});

