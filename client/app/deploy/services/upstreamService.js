/* TODO: enable linting and fix resulting errors */
/* eslint-disable */
/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

(function () {
  angular
    .module('EnvironmentManager.deploy')
    .factory('clientUpstreamService', upstreamService);

  upstreamService.$inject = ['$http'];

  function upstreamService($http) {
    return {
      create
    };

    function create(environment, serviceName, blue, green) {
      return $http.get(`/api/v1/environments/${environment}/accountName`).then(function (account) {
        var upstreamSettings = {
          'AccountName': account.data,
          'key': `/${environment}_${environment}-${serviceName}/config`,
          'Value': {
            'EnvironmentName': environment,
            'Hosts': [
              {
                'DnsName': `${environment}-${serviceName}-blue`,
                'FailTimeout': '30s',
                'Port': blue,
                'State': 'up',
                'Weight': 1
              },
              {
                'DnsName': `${environment}-${serviceName}-green`,
                'FailTimeout': '30s',
                'Port': green,
                'State': 'up',
                'Weight': 1
              }
            ],
            'LoadBalancingMethod': 'least_conn',
            'MarkForDelete': false,
            'SchemaVersion': 1,
            'ServiceName': serviceName,
            'UpstreamName': `${environment}-${serviceName}`,
            'ZoneSize': '128k'
          }
        };
        return $http.post('/api/v1/config/upstreams', upstreamSettings);
      });
    }
  }
}());
