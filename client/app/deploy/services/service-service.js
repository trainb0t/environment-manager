/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

(function () {
  angular
    .module('EnvironmentManager.deploy')
    .factory('serviceService', serviceService);

  serviceService.$inject = ['$http', 'portservice'];

  function serviceService($http, portservice) {
    return {
      create
    };

    function create({ ServiceName, OwningCluster, ServiceType }) {
      var promise;

      if (ServiceType.toLowerCase().startsWith('http')) promise = portservice.getNextSequentialPair();
      else promise = Promise.resolve();

      return promise
        .then(function (pair) {
          var model;
          if (pair) model = Object.assign(getModel(), { ServiceName, OwningCluster, Value: { GreenPort: pair.Green, BluePort: pair.Blue } });
          else model = Object.assign(getModel(), { ServiceName, OwningCluster, Value: {} })

          return $http.post('/api/v1/config/services', model);
        });
    }

    function getModel() {
      return {
        ServiceName: '',
        OwningCluster: '',
        Audit: {
          TransactionID: 1,
          User: user.getName()
        },
        Value: {}
      };
    }
  }
}());
