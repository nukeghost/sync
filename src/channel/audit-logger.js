// @flow

import { LoggerFactory } from '@calzoneman/jsli';

const LOGGER = LoggerFactory.getLogger('ChannelAuditLogger');

class ChannelAuditLogger {
    log(channel: string, user: string, eventName: string, eventData: Object = {}) {
        LOGGER.info('event: channel=%s user=%s eventName=%s eventData=%j', channel, user, eventName, eventData);
    }
}

export { ChannelAuditLogger }
