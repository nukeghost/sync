const assert = require('assert');
const Promise = require('bluebird');
const ChannelAuditLogDB = require('../../lib/database/channel-audit-log').ChannelAuditLogDB;

describe('ChannelAuditLogDB', () => {
    var dummyDB;
    var db;
    beforeEach(() => {
        dummyDB = {
            queryAsync(query, substitutions) {
                return Promise.resolve();
            }
        };

        db = new ChannelAuditLogDB(dummyDB);
    });

    describe('#insertEvent', () => {
        var channelId;
        var user;
        var eventName;
        var eventPayload;

        beforeEach(() => {
            channelId = 1234;
            user = 'anonymous';
            eventName = 'someEvent';
            eventPayload = { pizza: 'cheese' };
        });

        it('inserts an event', () => {
            dummyDB.queryAsync = function queryAsync(query, substitutions) {
                try {
                    assert.strictEqual(substitutions[0], channelId);
                    assert.strictEqual(substitutions[1], user);
                    assert.strictEqual(substitutions[2], eventName);
                    assert.strictEqual(substitutions[3], JSON.stringify(eventPayload));
                    assert.ok(Math.abs(Date.now() - substitutions[4].getTime()) < 100, 'Timestamp was wrong');
                    return Promise.resolve();
                } catch (error) {
                    return Promise.reject(error);
                }
            };
            return db.insertEvent(channelId, user, eventName, eventPayload);
        });

        it('accepts a null username', () => {
            user = null;
            dummyDB.queryAsync = function queryAsync(query, substitutions) {
                try {
                    assert.strictEqual(substitutions[0], channelId);
                    assert.strictEqual(substitutions[1], user);
                    assert.strictEqual(substitutions[2], eventName);
                    assert.strictEqual(substitutions[3], JSON.stringify(eventPayload));
                    assert.ok(Math.abs(Date.now() - substitutions[4].getTime()) < 100, 'Timestamp was wrong');
                    return Promise.resolve();
                } catch (error) {
                    return Promise.reject(error);
                }
            };
            return db.insertEvent(channelId, user, eventName, eventPayload);
        });
    });
});
