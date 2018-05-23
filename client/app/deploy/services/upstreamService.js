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

    function create(environment, serviceName, port) {
      return $http.get(`/api/v1/environments/${environment}/accountName`).then(function (account) {
        var upstreamSettings = {
          'AccountName': account.data,
          'key': `/${environment}_${environment}-${serviceName}/config`,
          'Value': {
            'EnvironmentName': environment,
            'Hosts': [
              {
                'DnsName': `${environment}-${serviceName}`,
                'FailTimeout': '30s',
                'Port': port,
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
