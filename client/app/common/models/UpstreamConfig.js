/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

angular.module('EnvironmentManager.common').factory('UpstreamConfig',
  function ($q, $http) {
    var baseUrl = '/api/v1/config/upstreams';

    function UpstreamConfig(data) {
      _.assign(this, data);
    }

    UpstreamConfig.getByKey = function (key, account) {
      return $http.get('/api/v1/config/upstreams/' + encodeURIComponent(key), { params: { account: account } })
        .then(function (response) {
          return new UpstreamConfig(response.data);
        });
    };

    UpstreamConfig.createNew = function (environmentName) {
      // New Upstream, set defaults
      var data = {
        Value: {
          SchemaVersion: 1,
          EnvironmentName: environmentName,
          ZoneSize: '128k',
          LoadBalancingMethod: 'least_conn',
          Hosts: [],
        },
        Version: 0
      };
      return new UpstreamConfig(data);
    }

    _.assign(UpstreamConfig.prototype, {
      save: function (key) {
        return $http({
          method: 'put',
          url: baseUrl + '/' + encodeURIComponent(key),
          data: this.Value,
          headers: { 'expected-version': this.Version }
        });
      },

      saveNew: function (key) {
        return $http({
          method: 'put',
          url: baseUrl + '/' + encodeURIComponent(key),
          data: { Value: this.Value, key: key },
          headers: { 'expected-version': this.Version }
        });
      }
    });

    return UpstreamConfig;
  });