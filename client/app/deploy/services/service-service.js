/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

(function () {
  angular
    .module('EnvironmentManager.deploy')
    .factory('serviceService', serviceService);

  serviceService.$inject = ['$http'];

  function serviceService($http) {
    return {
      create: create
    };

    function create(data) {
      var model = {
        ServiceName: '',
        OwningCluster: '',
        Value: {
          SchemaVersion: 1
        }
      };

      Object.assign(model, data);

      return $http.post('/api/v1/config/services', model);
    }
  }
}());
