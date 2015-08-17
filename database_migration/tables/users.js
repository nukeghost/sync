var Promise = require('bluebird');
var dbUtil = require('../../lib/database/util');
var canonicalizeName = dbUtil.canonicalizeName;
var ipToBinary = dbUtil.ipToBinary;

const EMPTY_IP = new Buffer(17);
EMPTY_IP.fill(0);

function nextSessionSalt() {
    var buffer = new Buffer(24);
    for (var i = 0; i < buffer.length; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
    }

    return buffer.toString('base64');
}

module.exports = function (oldKnex, db, logger) {
    function log(msg) {
        logger.log('[users] ' + msg);
    }

    var promises = [];
    var completed = 0;
    var errors = 0;
    var User = db.models.User;
    // Hack to prevent bookshelf from overwriting created_at for migrated rows
    User.prototype.hasTimestamps = false;

    log('INFO Migrating users');

    return oldKnex('users').select().stream(function (stream) {
        stream.on('readable', function () {
            var row = stream.read();
            if (row === null) {
                return;
            }

            if (row.password.length > 60) {
                log('WARN User ' + row.name + ' had a legacy sha256 password');
                row.password = '';
            }

            var profileImage = '';
            var profileText = '';
            try {
                var profile = JSON.parse(row.profile);
                if (profile.image.length > 255) {
                    log('WARN User ' + row.name + ' had too long profile_image');
                }
                if (profile.text.length > 255) {
                    log('WARN User ' + row.name + ' had too long profile_text');
                }
                profileImage = profile.image.substring(0, 255);
                profileText = profile.text.substring(0, 255);
            } catch (e) {
            }

            try {
                var userData = {
                    name: row.name,
                    canonical_name: canonicalizeName(row.name), // TODO handle conflict
                    password: row.password,
                    status: row.global_rank >= 255 ? 2 : 1,
                    session_salt: nextSessionSalt(),
                    email: row.email,
                    profile_image: profileImage,
                    profile_text: profileText,
                    register_ip: Boolean(row.ip) ? ipToBinary(row.ip) : EMPTY_IP,
                    created_at: new Date(row.time),
                    updated_at: new Date()
                };

                var promise = new User({ name: row.name }).fetch().then(function (res) {
                    if (res) {
                        log('WARN User ' + row.name + ' already exists on destination');
                        return res.set(userData).save();
                    } else {
                        return new User(userData).save();
                    }
                }).then(function () {
                    completed++;
                    if (completed % 100 === 0) {
                        log('INFO Progress: migrated ' + completed + ' users; ' +
                                errors + ' errors');
                    }
                }).catch(function (e) {
                    errors++;
                    log('ERROR When migrating row ' + JSON.stringify(row) +
                            ' : ' + e);
                });

                promises.push(promise);
            } catch (e) {
                errors++;
                log('ERROR When migrating row ' + JSON.stringify(row) +
                        ' : ' + e.stack);
            }
        });
    }).then(function () {
        log('INFO Finished preprocessing, waiting for migration to complete');
        return Promise.all(promises);
    }).then(function () {
        log('INFO Migration complete: migrated ' + completed + ' rows with ' +
                errors + ' errors');
    }).catch(function (e) {
        log('ERROR Unexpected error: ' + e.stack);
    });
};
