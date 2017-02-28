// @flow

import { LoggerFactory } from '@calzoneman/jsli';
import { ChannelAuditLogDB } from '../database/channel-audit-log';
import * as Metrics from 'cytube-common/lib/metrics/metrics';

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
        Metrics.incCounter('chanAuditLog:log');
        return this.db.insertEvent(channelId, user, eventCategory, eventName, eventData).then(res => {
            LOGGER.debug('Recorded event "%s" for channel ID %d', eventName, channelId);
        }).catch(err => {
            Metrics.incCounter('chanAuditLog:logerr');
            LOGGER.error('Failed to record event "%s" for channel ID %d: %s',
                         eventName,
                         channelId,
                         err.stack);
        });
    }
}

export { ChannelAuditLogger }
