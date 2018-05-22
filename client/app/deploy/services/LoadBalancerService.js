/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

angular.module('EnvironmentManager.deploy').service('clientLoadBalancerService',
    function ($http) {
        var self = this;

        self.dnsSuffix = 'service.ttlnonprod.local';
        self.resource = '/api/v1/config/lb-settings/ENVIRONMENT/ENVIRONMENT-SERVICENAME';

        self.loadBalancerSettings = {
            'VHostName': 'ENVIRONMENT-SERVICENAME.DNSSUFFIX',
            'FrontEnd': false,
            'SchemaVersion': '1',
            'EnvironmentName': 'ENVIRONMENT',
            'ServerName': [
                'ENVIRONMENT-SERVICENAME.DNSSUFFIX'
            ],
            'Locations': [{
                'Path': '/',
                'ProxyPass': 'https://ENVIRONMENT-SERVICENAME'
            }],
            'Listen': [{
                'Port': 443
            }]
        };

        self.create = function (environment, serviceName, dnsSuffix) {
            var loadBalancerSettings = getLoadBalancerSettings(environment, serviceName, dnsSuffix);
            var url = replaceTokens(self.resource, environment, serviceName, dnsSuffix);
            return $http.post(url, loadBalancerSettings);
        };

        function getLoadBalancerSettings(environment, serviceName, dnsSuffix) {
            var loadBalancerSettings = angular.copy(self.loadBalancerSettings);
            loadBalancerSettings.EnvironmentName = environment;
            loadBalancerSettings.VHostName = replaceTokens(loadBalancerSettings.VHostName, environment, serviceName, dnsSuffix);
            loadBalancerSettings.ServerName = replaceTokens(loadBalancerSettings.ServerName, environment, serviceName, dnsSuffix);
            loadBalancerSettings.Locations[0].ProxyPass = replaceTokens(loadBalancerSettings.Locations[0].ProxyPass, environment, serviceName, dnsSuffix);
            return loadBalancerSettings;
        }

        function replaceTokens(template, environment, serviceName, dnsSuffix) {
            var result = template.toString().replace(new RegExp('ENVIRONMENT', 'g'), environment);
            result = result.replace(new RegExp('SERVICENAME', 'g'), serviceName);
            result = result.replace(new RegExp('DNSSUFFIX', 'g'), (dnsSuffix || self.dnsSuffix));
            return result;
        }
    });