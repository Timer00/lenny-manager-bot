const bot = require("./bot-client");
const { roles, memberInfos } = require("./state");

function Member(name, id) {
    this.name = name;
    this.id = id;
    this.strikes = 0;
    this.firedStrike = false;
}

Member.prototype.mute = function(time) {
    const members = bot.guilds.get("278378411095883776").members;
    members.get(this.id).addRole(roles.muted).catch(console.error);
    setTimeout(() => {
        members.get(this.id).removeRole(roles.muted).catch(console.error);
    }, time);
};

Member.prototype.strike = function() {
    this.strikes++;
    if (this.strikes === 3) {
        this.mute(1000 * 60 * this.strikes * 4);
        roles.owner.members.first().user.send(`User (${this.name}, ${this.id}) muted on ${Date()}`);
    }
    if (this.strikes === 6) {
        this.mute(1000 * 60 * this.strikes * 4);
        roles.owner.members.first().user.send(`User (${this.name}, ${this.id}) muted on ${Date()}`);
    }
    if (this.strikes === 10) {
        this.mute(1000 * 60 * this.strikes * 4);
        roles.owner.members.first().user.send(`User (${this.name}, ${this.id}) muted on ${Date()}`);
    }
};

Member.prototype.fireStrike = function(user, reason) {
    if (user != undefined) {
        let tried = "";
        if (this.firedStrike) {
            tried = "tried to";
        }
        roles.owner.members.first().user.send(`The user (${this.name}, ${this.id}) ${tried} sent a report to the user (${user.username}, ${user.id})
            with the following reason: "${reason}" on ${Date()}`);
        if (!this.firedStrike) {
            memberInfos.find(x => x.id === user.id).strike();
        }
        this.firedStrike = true;
        setTimeout(() => {
            this.firedStrike = false;
        }, 1000 * 60 * 10);
    }
};

module.exports = Member;
