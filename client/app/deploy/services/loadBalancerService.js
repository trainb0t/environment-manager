/* TODO: enable linting and fix resulting errors */
/* eslint-disable */
/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

angular.module('EnvironmentManager.deploy').service('clientLoadBalancerService',
  function ($http) {
    var self = this;

    self.dnsSuffix = 'service.ttlnonprod.local';

    self.getUrl = function (deploymentMap, environment, serviceName) {
      deploymentMap.loadBalancerUrl = `https://${environment}-${serviceName}.${self.getDnsSuffix(environment)}`;
    };

    self.create = function (deploymentMap, environment, serviceName) {
      return $http.get(`/api/v1/environments/${environment}/accountName`).then(function (account) {
        var accountName = account.data;
        var loadBalancerSettings = {
          AccountName: accountName,
          EnvironmentName: environment,
          VHostName: `${environment}-${serviceName}.${self.getDnsSuffix(environment)}`,
          Value: {
            EnvironmentName: environment,
            VHostName: `${environment}-${serviceName}.${self.getDnsSuffix(environment)}`,
            FrontEnd: false,
            SchemaVersion: '1',
            ServerName: [
              `${environment}-${serviceName}.${self.getDnsSuffix(environment)}`
            ],
            Locations: [{
              Path: '/',
              ProxyPass: `${environment}-${serviceName}`
            }],
            Listen: [{
              Port: 443
            }]
          }
        };
        return $http.post(`/api/v1/config/lb-settings`, loadBalancerSettings);
      });
    };

    self.getDnsSuffix = function (environment) {
      if (environment === 'pr1') {
        return 'service.ttlprod.local';
      }
      return 'service.ttlnonprod.local';
    };
  });
