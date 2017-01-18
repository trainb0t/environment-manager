/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

angular.module('EnvironmentManager.operations').component('opsDeploymentsList', {
  templateUrl: '/app/operations/deployments/opsDeploymentsList.html',
  bindings: {
    query: '<',
    showDetails: '&',
    foundServicesFilter: '&',
  },
  controllerAs: 'vm',
  controller: function ($scope, Deployment, $uibModal) {
    var vm = this;

    function refresh() {
      
      console.dir(vm.query);

      vm.dataLoading = true;
      Deployment.getAll(vm.query).then(function (data) {
        vm.deployments = data.map(Deployment.convertToListView);
        vm.uniqueServices = _.uniq(data.map(function (d) { return d.Value.ServiceName; }));
        vm.dataLoading = false;
        vm.dataFound = true;
        
        var emptysummary = { 'Success':0, 'In Progress':0, 'Cancelled':0, 'Failed':0 };
        vm.summary = vm.deployments.reduce(function(summary, d) {
          summary[d.status]++;
          return summary;
        },
        emptysummary);
      });
    }

    $scope.$watch('vm.query', function () {
      refresh();
    });
  }
});
