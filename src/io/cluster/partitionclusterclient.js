import Promise from 'bluebird';

class PartitionClusterClient {
    constructor(partitionMap) {
        this.partitionMap = partitionMap;
    }

    getSocketConfig(channel) {
        var server;
        if (this.partitionMap.overrides.hasOwnProperty(channel)) {
            server = this.partitionMap.overrides[channel];
        } else {
            server = this.partitionMap.pool[this.hash(channel)];
        }

        return Promise.resolve({
            servers: this.partitionMap.partitions[server]
        });
    }

    hash(channel) {
        const bin = new Buffer(channel, 'ascii');
        var hash = 1;
        for (var i = 0; i < bin.length; i++) {
            hash = (31 * hash + bin[i]) % 2147483648;
        }

        return hash % this.partitionMap.pool.length;
    }
}

export { PartitionClusterClient };
