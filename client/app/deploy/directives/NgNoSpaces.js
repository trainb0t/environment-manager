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

