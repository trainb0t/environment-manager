/* TODO: enable linting and fix resulting errors */
/* eslint-disable */
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

    function create(config) {
      return decideWhetherPortsAreRelevant()
        .then(function (pair) {
          var model = createModel(pair);
          return $http.post('/api/v1/config/services', model)
            .then(function () {
              return pair;
            });
        });

      function decideWhetherPortsAreRelevant() {
        if (config.ServiceType && config.ServiceType.toLowerCase().startsWith('http')) return portservice.getNextSequentialPair();
        else return Promise.resolve();
      }

      function createModel(pair) {
        if (pair) return Object.assign(getModel(), { ServiceName: config.ServiceName, OwningCluster: config.OwningCluster, Value: { GreenPort: pair.Green, BluePort: pair.Blue } });
        else return Object.assign(getModel(), { ServiceName: config.ServiceName, OwningCluster: config.OwningCluster, Value: {} })
      }
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
