import ChannelModule from './module';

function SpamFilterModule(channel) {
    ChannelModule.apply(this, arguments);
    this.spamThreshold = +Infinity;
}

SpamFilterModule.prototype = Object.create(ChannelModule.prototype);

SpamFilterModule.prototype.onUserPreChat = function onUserPreChat(user, data, callback) {
    const score = this.computeSpamScore(user, data);
    if (score >= this.spamThreshold) {
        this.channel.logger.log(`Kicking ${user.getName()}: spam filtered`);
        user.kick('[Autokick] Spam filtered.');
        callback(null, ChannelModule.DENY);
    } else {
        callback(null, ChannelModule.PASSTHROUGH);
    }
};

SpamFilterModule.prototype.computeSpamScore = function computeSpamScore(user, data) {
    return 0;
};

module.exports = SpamFilterModule;
