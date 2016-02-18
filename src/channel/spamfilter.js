import Logger from '../logger';
import ChannelModule from './module';

const ONE_DAY = 1000 * 60 * 60 * 24;

function SpamFilterModule(channel) {
    ChannelModule.apply(this, arguments);
    this.spamThreshold = +Infinity;
    this.lastMessage = {};
    this.weights = {
        newAccount: 0,
        manyAliases: 0,
        duplicateMessage: 0
    };
    this.customRules = [];
}

SpamFilterModule.prototype = Object.create(ChannelModule.prototype);

SpamFilterModule.prototype.onUserPreChat = function onUserPreChat(user, data, callback) {
    var score;
    try {
        score = this.computeSpamScore(user, data);
    } catch (error) {
        Logger.errlog.log(`Error computing spam score: ${error.stack}`);
        score = 0;
    }

    if (score > this.spamThreshold) {
        this.channel.logger.log(`Kicking ${user.getName()}: spam filtered`);
        user.kick('[Autokick] Spam filtered.');
        process.nextTick(callback, null, ChannelModule.DENY);
    } else {
        process.nextTick(callback, null, ChannelModule.PASSTHROUGH);
    }

    this.lastMessage[user.getName()] = data.msg;
};

SpamFilterModule.prototype.onUserPart = function onUserPart(user) {
    try {
        delete this.lastMessage[user.getName()];
    } catch (error) {
        Logger.errlog.log(error.stack);
    }
};

SpamFilterModule.prototype.computeSpamScore = function computeSpamScore(user, data) {
    let score = 0;

    // Accounts less than a day old are suspect
    const isNewAccount = (Date.now() - user.registration.date) < ONE_DAY;
    if (isNewAccount) {
        score += this.weights.newAccount
    }

    // Accounts with 3+ aliases are rare (a recent query of the cytu.be
    // aliases table yielded an average of 1.10 aliases per IP.
    if (user.account.aliases.length >= 3) {
        score += this.weights.manyAliases;
    }

    // Duplicate messages are often an indicator of spam
    if (data.msg === this.lastMessage[user.getName()]) {
        score += this.weights.duplicateMessage;
    }

    // Run the chat message through user-defined regexes
    score += this.computeCustomRules(user, data);

    return score;
};

SpamFilterModule.prototype.computeCustomRules = function computeCustomRules(user, data) {
    let subscore = 0;

    this.customRules.forEach([regexp, ruleScore] => {
        const match = data.msg.match(regexp);
        if (match) {
            subscore += ruleScore * match.length;
        }
    });

    return subscore;
};

module.exports = SpamFilterModule;
