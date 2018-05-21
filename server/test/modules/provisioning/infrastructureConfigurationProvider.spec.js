/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

let sinon = require('sinon');
let proxyquire = require('proxyquire');
let DynamoItemNotFoundError = require('../../../modules/errors/DynamoItemNotFoundError.class');

describe('infrastructureConfigurationProvider:', () => {
  const input = {
    environmentName: 'st1',
    serviceName: 'AService',
    serverRoleName: 'ServerRoleName'
  };
  let serverRole;
  let depsResults;
  let deps;

  describe('Getting the configuration for a service on an environment', () => {
    beforeEach(() => {
      setupDependencies();
    });

    it('Should return configuration error when no service is found', () => {
      const expectedError = 'An error has occurred retrieving "AService" service: Service "AService" not found.';
      const nullService = null;
      deps.servicesDbMock.get = sinon.stub().returns(Promise.resolve(nullService));

      const promise = getInstance();

      return promise.catch((configurationError) => {
        configurationError.should.have.property('message', expectedError);
      });
    });

    it('Should throw error when server role doesn\'t have owning cluster', () => {
      const expectedError = `An error has occurred retrieving the serverRole, no owning cluster found "${JSON.stringify(serverRole)}".`;
      delete serverRole.OwningCluster;
      const promise = getInstance();

      return promise.catch((error) => {
        error.should.have.property('message', expectedError);
      });
    });

    it('Should throw error when no environment type is found', () => {
      const exception = 'Bang!!!';
      deps.environmentTypeMock.getByName = sinon.stub().returns(Promise.reject(exception));
      const expectedError = `An error has occurred retrieving environment "${input.environmentName}" environment type.`;

      const promise = getInstance();

      return promise.catch((error) => {
        error.should.have.property('message', expectedError);
        error.should.have.property('innerError', exception);
      });
    });

    it('Should throw error when cluster can\'t be found on dynamo', () => {
      deps.clustersMock.get = sinon.stub().returns(Promise.reject(new DynamoItemNotFoundError('', '')));
      const expectedError = 'Cluster "Ransom" not found.';

      const promise = getInstance();

      return promise.catch((error) => {
        error.should.have.property('message', expectedError);
      });
    });

    it('Should throw error when can\'t get cluster from dynamo', () => {
      deps.clustersMock.get = sinon.stub().returns(Promise.reject({
        message: 'Bang!'
      }));
      const expectedError = `An error has occurred retrieving "Ransom" cluster: ${'Bang!'}`;

      const promise = getInstance();

      return promise.catch((error) => {
        error.should.have.property('message', expectedError);
      });
    });

    it('Should return a configuration object', () => {
      const promise = getInstance();

      return promise.then((config) => {
        config.should.have.property('environmentTypeName', depsResults.environment.EnvironmentType);
        config.should.have.property('environmentName', input.environmentName);
        config.should.have.property('serviceName', input.serviceName);
        config.should.have.property('environmentType', depsResults.environmentType);
        config.should.have.property('environment', depsResults.environment);
        config.should.have.property('serverRole', serverRole);
        config.should.have.property('service', deps.service);
        config.should.have.property('cluster', {
          Name: depsResults.cluster.ClusterName,
          ShortName: depsResults.cluster.Value.ShortName,
          KeyPair: depsResults.cluster.Value.KeyPair
        });
        config.should.have.property('image', depsResults.image);
      });
    });
  });

  function setupDependencyResults() {
    serverRole = {
      ServerRoleName: input.serverRoleName,
      OwningCluster: 'Ransom',
      AMI: 'TheAmi'
    };
    depsResults = {
      environment: {
        getDeploymentMap() {
          return {
            DeploymentTarget: [serverRole]
          };
        },
        EnvironmentType: 'EnvironmentType'
      },
      service: {},
      environmentType: {},
      cluster: {
        ClusterName: 'Ransom',
        Value: {
          ShortName: 'rm',
          KeyPair: 'something'
        }
      },
      image: {}
    };
  }

  function setupDependencies() {
    setupDependencyResults();
    deps = {
      environmentMock: {
        getByName: sinon.stub().returns(Promise.resolve(depsResults.environment))
      },
      servicesDbMock: {
        get: sinon.stub().returns(Promise.resolve(depsResults.service))
      },
      environmentTypeMock: {
        getByName: sinon.stub().returns(Promise.resolve(depsResults.environmentType))
      },
      clustersMock: {
        get: sinon.stub().returns(Promise.resolve(depsResults.cluster))
      },
      imageProviderMock: {
        get: sinon.stub().returns(Promise.resolve(depsResults.image))
      }
    };
  }

  function getInstance() {
    let mapStubs = {};
    mapStubs['./launchConfiguration/imageProvider'] = deps.imageProviderMock;
    mapStubs['../../models/Environment'] = deps.environmentMock;
    mapStubs['../../models/EnvironmentType'] = deps.environmentTypeMock;
    mapStubs['../data-access/clusters'] = deps.clustersMock;
    mapStubs['../data-access/services'] = deps.servicesDbMock;
    let infrastructureConfigurationProvider =
      proxyquire('../../../modules/provisioning/infrastructureConfigurationProvider', mapStubs);
    let target = infrastructureConfigurationProvider;
    return target.get(input.environmentName, input.serviceName, input.serverRoleName);
  }
});
