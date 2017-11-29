/* Copyright (c) Trainline Limited, 2016-2017. All rights reserved. See LICENSE.txt in the project root for license information. */

'use strict';

require('should');
let sinon = require('sinon');
let inject = require('inject-loader!../../../modules/environment-state/deleteTargetState');

/**
 * We test the extent of keys found for deletion by inspecting getTargetState() calls.
 */
describe('deleteTargetState', () => {
  let deleteTargetState;
  let serviceTargetsMock;

  let keyValuePairs = [
    { key: 'key1', value: 'val1' },
    { key: 'key2', value: 'val2' }
  ];

  beforeEach(() => {
    serviceTargetsMock = {
      getTargetState: sinon.stub().returns(Promise.resolve(keyValuePairs)),
      removeTargetState: sinon.stub().returns(Promise.resolve([]))
    };

    deleteTargetState = inject({ '../service-targets': serviceTargetsMock });
  });

  describe('byEnvironment', () => {
    it('deletes target environment state', () => {
      let environmentName = 'test-env';

      return deleteTargetState.byEnvironment({ environmentName }).then(() => {
        sinon.assert.calledWith(serviceTargetsMock.getTargetState, environmentName, {
          key: 'environments/test-env/services/', recurse: true
        });

        sinon.assert.calledWith(serviceTargetsMock.removeTargetState, environmentName, { key: 'key1' });
        sinon.assert.calledWith(serviceTargetsMock.removeTargetState, environmentName, { key: 'key2' });
      });
    });
  });

  describe('byService', () => {
    it('deletes target service state', () => {
      let environmentName = 'test-env';
      let serviceName = 'test-service';

      return deleteTargetState.byService({ environmentName, serviceName }).then(() => {
        sinon.assert.calledWithExactly(serviceTargetsMock.getTargetState, environmentName, {
          key: 'environments/test-env/services/test-service/', recurse: true
        });

        sinon.assert.calledWithExactly(serviceTargetsMock.getTargetState, environmentName, {
          key: 'environments/test-env/roles/', recurse: true
        });
      });
    });
  });


  describe('byServiceVersion', () => {
    it('deletes target service state', () => {
      let environmentName = 'test-env';
      let serviceName = 'test-service';
      let serviceVersion = '012';

      return deleteTargetState.byServiceVersion({ environmentName, serviceName, serviceVersion }).then(() => {
        sinon.assert.calledWithExactly(serviceTargetsMock.getTargetState, environmentName, {
          key: 'environments/test-env/services/test-service/012/', recurse: true
        });

        sinon.assert.calledWithExactly(serviceTargetsMock.getTargetState, environmentName, {
          key: 'environments/test-env/roles/', recurse: true
        });
      });
    });
  });
});

