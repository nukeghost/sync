// @flow

import { LoggerFactory } from '@calzoneman/jsli';
import { ChannelAuditLogDB } from '../database/channel-audit-log';
import * as Metrics from 'cytube-common/lib/metrics/metrics';

const LOGGER = LoggerFactory.getLogger('ChannelAuditLogger');

class ChannelAuditLogger {
    db: ChannelAuditLogDB;

    constructor(db: ChannelAuditLogDB) {
        this.db = db;
    }

    log(channelId: number, user: string, eventName: string, eventData: Object = {}) {
        Metrics.incCounter('channelAuditLogger:log');
        return this.db.insertEvent(channelId, user, eventName, eventData).then(res => {
            LOGGER.debug('Recorded event "%s" for channel ID %d', eventName, channelId);
        }).catch(err => {
            Metrics.incCounter('channelAuditLogger:log:error');
            LOGGER.error('Failed to record event "%s" for channel ID %d: %s',
                         eventName,
                         channelId,
                         err.stack);
        });
    }
}

export { ChannelAuditLogger }
