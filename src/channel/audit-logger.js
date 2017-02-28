// @flow

import { LoggerFactory } from '@calzoneman/jsli';
import { ChannelAuditLogDB } from '../database/channel-audit-log';
import * as Metrics from 'cytube-common/lib/metrics/metrics';
import Promise from 'bluebird';

const LOGGER = LoggerFactory.getLogger('ChannelAuditLogger');

export type EventCategory =
      'playlist'
    | 'kickban';

class ChannelAuditLogger {
    db: ChannelAuditLogDB;

    constructor(db: ChannelAuditLogDB) {
        this.db = db;
    }

    log(channelId: number, user: string, eventCategory: EventCategory, eventName: string, eventData: Object = {}) {
        if (channelId <= 0) {
            LOGGER.debug('Skipping event "%s":"%s" for unregistered channel.', eventCategory, eventName);
            Metrics.incCounter('chanAuditLog:lskip');
            return Promise.resolve();
        }

        Metrics.incCounter('chanAuditLog:log');
        return this.db.insertEvent(channelId, user, eventCategory, eventName, eventData).then(res => {
            LOGGER.debug('Recorded event "%s":"%s" for channel ID %d', eventCategory, eventName, channelId);
        }).catch(err => {
            Metrics.incCounter('chanAuditLog:logerr');
            LOGGER.error('Failed to record event "%s":"%s" for channel ID %d: %s',
                         eventCategory,
                         eventName,
                         channelId,
                         err.stack);
        });
    }
}

export { ChannelAuditLogger }
