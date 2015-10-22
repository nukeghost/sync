import uuid from 'uuid';
import loadLuaScript from '../../redis/lualoader';
import {
    CHANNEL_AFFINITY,
    ACTIVE_CHANNELS,
    CHANNELS_FOR_NODE,
    AVAILABLE_NODES
} from '../../redis/constants';

const ASSIGN_CHANNEL_SCRIPT = loadLuaScript('assignChannelToNode.lua')

export default class RedisClusterClient {
    constructor(ioConfig, redisClient, options = { available: true }) {
        this.ioConfig = ioConfig;
        this.redisClient = redisClient;
        this.uuid = uuid.v4();

        if (options.available) {
            this._setAvailable();
        }
    }

    getSocketConfig(channel) {
        return this.redisClient.multi()
                .hget(ACTIVE_CHANNELS, channel)
                .hget(CHANNEL_AFFINITY, channel)
                .hgetall(AVAILABLE_NODES)
                .execAsync()
                .then(replies => {

            const [currentNode, affinity, allNodes] = replies;
            if (currentNode) {
                // Channel is already loaded on another node
                return JSON.parse(currentNode);
            } else if (affinity) {
                // Channel is sticky to a particular node
                return JSON.parse(affinity);
            } else {
                // Channel is not yet loaded, hash by name
                if (allNodes == null) {
                    throw new Error('No nodes available');
                }

                const keys = Object.keys(allNodes);
                if (keys.length === 0) {
                    throw new Error('No nodes available');
                }

                const hash = hashChannel(channel);
                const nodeData = allNodes[keys[hash % keys.length]];
                const node = JSON.parse(nodeData);
                const socketConfig = {
                    url: node.url,
                    secure: node.secure
                };

                return this.redisClient.evalAsync(ASSIGN_CHANNEL_SCRIPT, 3,
                        channel,
                        JSON.stringify(socketConfig),
                        node.uuid).then(success => {

                    if (success) {
                        return socketConfig;
                    } else {
                        throw new Error('Encountered socket config race condition ' +
                                `for channel: "${channel}"`);
                    }
                });
            }
        });
    }

    _setAvailable() {
        const socketConfig = this.ioConfig.getSocketConfig();
        const nodeConfig = JSON.stringify({
            url: socketConfig.url,
            secure: socketConfig.secure,
            uuid: this.uuid
        });
        return this.redisClient.hsetAsync(AVAILABLE_NODES, this.uuid, nodeConfig);
    }
}

function hashChannel(channel) {
    let hash = 1;
    for (let i = 0; i < channel.length; i++) {
        hash += 31 * channel.charCodeAt(i);
    }

    return hash;
}
