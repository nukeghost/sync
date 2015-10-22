var Promise = require('bluebird');
var assert = require('assert');

var RedisClusterClient = require('../../../lib/io/cluster/redisclusterclient');

describe('RedisClusterClient', function () {
    describe('#getSocketConfig', function () {
        var multiResult,
            redisClient,
            clusterClient,
            socketConfig;
        beforeEach(function () {
            multiResult = [null, null, null];
            socketConfig = {};
            redisClient = {
                multi: function () {
                    return {
                        hget: function () { return this; },
                        hgetall: function () { return this; },
                        execAsync: function () {
                            return Promise.resolve(multiResult);
                        }
                    };
                }
            };
            clusterClient = new RedisClusterClient(null, redisClient, {
                available: false
            });
        });

        it('returns the configuration for the active node for the channel', function () {
            var expected = { url: 'expected url', secure: true };
            multiResult = [
                JSON.stringify(expected),
                '{}',
                '{}'
            ];

            return clusterClient.getSocketConfig('test').then(function (config) {
                assert.deepEqual(config, expected);
            });
        });

        it('respects channel node affinity', function () {
            var expected = { url: 'expected url', secure: true };
            multiResult = [
                null,
                JSON.stringify(expected),
                '{}'
            ];

            return clusterClient.getSocketConfig('test').then(function (config) {
                assert.deepEqual(config, expected);
            });
        });

        it('picks a new node', function () {
            var expected = { url: 'expected url', secure: true };
            var availableMap = {
                'uuid1': JSON.stringify({ url: 'unexpected url', secure: false, uuid: 'uuid1' }),
                'uuid2': JSON.stringify({ url: 'expected url', secure: true, uuid: 'uuid2' })
            }
            multiResult = [
                null,
                null,
                availableMap
            ];
            redisClient.evalAsync = function (script, argCount, channel, config, uuid) {
                assert.equal(config, JSON.stringify(expected));
                assert.equal(uuid, 'uuid2');
                return Promise.resolve(1);
            };

            return clusterClient.getSocketConfig('test').then(function (config) {
                assert.deepEqual(config, expected);
            });
        });

        it('throws on race condition', function () {
            var availableMap = {
                'uuid1': JSON.stringify({ url: 'unexpected url', secure: false, uuid: 'uuid1' }),
                'uuid2': JSON.stringify({ url: 'expected url', secure: true, uuid: 'uuid2' })
            }
            multiResult = [
                null,
                null,
                availableMap
            ];
            redisClient.evalAsync = function () {
                return Promise.resolve(0);
            };

            return clusterClient.getSocketConfig('test').then(function (config) {
                assert(false, 'Expected exception due to race condition');
            }).catch(function (err) {
                assert.equal(err.message, 'Encountered socket config race condition for channel: "test"');
            });
        });
    });

    describe('#constructor', function () {
        it('does not call _setAvailable if the available opt is false', function () {
            var _setAvailable = RedisClusterClient.prototype._setAvailable;
            var error = false;
            RedisClusterClient.prototype._setAvailable = function () {
                error = true;
            };
            try {
                var clusterClient = new RedisClusterClient(null, null, {
                    available: false
                });
            } finally {
                RedisClusterClient.prototype._setAvailable = _setAvailable;
            }

            if (error) {
                throw new Error('Should not have called _setAvailable');
            }
        });

        it('publishes its configuration to the cluster', function () {
            var ioConfig = {
                getSocketConfig: function () {
                    return {
                        url: 'some url',
                        secure: false
                    };
                }
            };

            var actual;

            var redisClient = {
                hsetAsync: function (map, key, value) {
                    actual = [key, value];
                }
            };

            var clusterClient = new RedisClusterClient(ioConfig, redisClient);
            var expectedConfig = ioConfig.getSocketConfig();
            expectedConfig.uuid = clusterClient.uuid;
            var expected = [clusterClient.uuid, JSON.stringify(expectedConfig)];
            assert.deepEqual(actual, expected);
        });
    });
});
