import { PartitionClusterClient } from './io/cluster/partitionclusterclient';
import Config from './config';
import IOConfiguration from './configuration/ioconfig';
import YAML from 'yamljs';
import path from 'path';
import Logger from './logger';

class PartitionModule {
    getIOConfig() {
        if (!this.ioConfig) {
            this.ioConfig = IOConfiguration.fromOldConfig(Config);
        }

        return this.ioConfig;
    }

    getClusterClient() {
        if (!this.clusterClient) {
            try {
                const partitionMap = YAML.load(
                        path.resolve(__dirname, '..', Config.get('partition-map')));
                this.clusterClient = new PartitionClusterClient(partitionMap);
            } catch (error) {
                Logger.errlog.log('Failed to load partition map: ' + error.stack);
                process.exit(1);
            }
        }
        return this.clusterClient;
    }

    onReady() {

    }
}

export { PartitionModule };
