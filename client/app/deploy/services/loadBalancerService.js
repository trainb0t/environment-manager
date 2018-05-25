/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

angular.module('EnvironmentManager.deploy').service('clientLoadBalancerService',
    function ($http) {
        var self = this;
        self.dnsSuffix = 'service.ttlnonprod.local';

        self.getUrl = function (deploymentMap, environment, serviceName, dnsSuffix) {
            deploymentMap.loadBalancerUrl = `https://${environment}-${serviceName}.${dnsSuffix || self.dnsSuffix}`;
        }

        self.create = function (deploymentMap, environment, serviceName, dnsSuffix) {
            return $http.get(`/api/v1/environments/${environment}/accountName`).then(function (account) {
                var accountName = account.data;
                var loadBalancerSettings = {
                    'AccountName': accountName,
                    'EnvironmentName': environment,
                    'VHostName': `${environment}-${serviceName}.${dnsSuffix || self.dnsSuffix}`,
                    Value: {
                        'EnvironmentName': environment,
                        'VHostName': `${environment}-${serviceName}.${dnsSuffix || self.dnsSuffix}`,
                        'FrontEnd': false,
                        'SchemaVersion': '1',
                        'ServerName': [
                            `${environment}-${serviceName}.${dnsSuffix || self.dnsSuffix}`
                        ],
                        'Locations': [{
                            'Path': '/',
                            'ProxyPass': `${environment}-${serviceName}`
                        }],
                        'Listen': [{
                            'Port': 443
                        }]
                    }
                };
                return $http.post(`/api/v1/config/lb-settings`, loadBalancerSettings);
            });
        };
    });