// @flow

import Promise from 'bluebird';

const Q_INSERT_EVENT = `
INSERT INTO channel_audit_log (
    channel_id,
    username,
    event_name,
    event_payload,
    event_timestamp
) VALUES (
    ?,
    ?,
    ?,
    ?,
    ?
);`;

class ChannelAuditLogDB {
    db: any;

    constructor(db: any) {
        this.db = db;
    }

    insertEvent(channelId: number, user: string, eventName: string, eventData: Object) {
        return this.db.queryAsync(Q_INSERT_EVENT, [
                channelId,
                user,
                eventName,
                JSON.stringify(eventData),
                new Date()
            ]);
    }
}

export { ChannelAuditLogDB };
