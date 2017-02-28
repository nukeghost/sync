const assert = require('assert');
const Promise = require('bluebird');
const ChannelAuditLogger = require('../../lib/channel/audit-logger').ChannelAuditLogger;

describe('ChannelAuditLogDB', () => {
    var auditLogger;
    var dummyDB;
    beforeEach(() => {
        dummyDB = {
            insertEvent(channelId, user, eventCategory, eventName, eventData) {
                return Promise.resolve();
            }
        };

        auditLogger = new ChannelAuditLogger(dummyDB);
    });

    describe('#log', () => {
        var channelId;
        var user;
        var eventCategory;
        var eventName;
        var eventPayload;

        beforeEach(() => {
            channelId = 1234;
            user = 'anonymous';
            eventCategory = 'food';
            eventName = 'someEvent';
            eventPayload = { pizza: 'cheese' };
        });

        it('logs an event', () => {
            dummyDB.insertEvent = function insertEvent(channelId_, user_, eventCategory_, eventName_, eventData_) {
                try {
                    assert.strictEqual(channelId_, channelId);
                    assert.strictEqual(user_, user);
                    assert.strictEqual(eventCategory_, eventCategory);
                    assert.strictEqual(event_, eventName);
                    assert.deepStrictEqual(eventPayload_, eventPayload);
                    return Promise.resolve();
                } catch (error) {
                    return Promise.reject(error);
                }
            };

            return auditLogger.log(channelId, user, eventCategory, eventName, eventPayload);
        });

        it('fails open', () => {
            dummyDB.insertEvent = function insertEvent(channelId_, user_, eventCategory_, eventName_, eventData_) {
                return Promise.reject(new Error('Oh no!'));
            };

            return auditLogger.log(channelId, user, eventCategory, eventName, eventPayload);
        });

        it("doesn't log an event for an unregistered channel (id <= 0)", () => {
            dummyDB.insertEvent = function insertEvent(channelId_, user_, eventCategory_, eventName_, eventData_) {
                throw new Error('DB should not be called for unregistered channel');
            };

            return auditLogger.log(0, user, eventCategory, eventName, eventPayload).then(() => {
                return auditLogger.log(-1, user, eventCategory, eventName, eventPayload);
            });
        });
    });
});
