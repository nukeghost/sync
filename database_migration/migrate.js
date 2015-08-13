var Config = require('../lib/config');
Config.load('config.yaml');
var Database = require('../lib/database');
var Logger = require('../lib/logger');
var path = require('path');

var oldKnex = require('knex')({
    client: 'mysql',
    connection: {
        host: Config.get('mysql.server'),
        database: Config.get('mysql.database'),
        user: Config.get('mysql.user'),
        password: Config.get('mysql.password')
    }
});

var newDb = new Database({
    client: 'pg',
    connection: {
        user: 'cytube',
        password: 'test',
        host: 'localhost',
        port: 5432,
        database: 'cytube3',
        filename: 'migrated.db'
    },
    tablePrefix: 'migrated_'
});

var logger = new Logger.Logger(path.join(__dirname, '..', 'migration.log'));
var _log = logger.log;
logger.log = function () {
    console.log.apply(console, arguments);
    _log.apply(logger, arguments);
};

newDb.on('ready', function () {
    require('./tables/users')(oldKnex, newDb, logger).then(function () {
        process.exit(0);
    });
});
