const Discord = require("discord.js");
bot = new Discord.Client();
const config = require("./config.json");
//const token = process.env["LENNY_TOKEN"];
const token = require("./secret.json").token;
const {parseTime, unindent} = require("./util");

bot.on("ready", () => {
    console.log("Ready to deploy lennies everywhere");

    findRole = function (name) {
        return bot.guilds.get("278378411095883776").roles.find("name", name);
    };

    roles = {
        mod: findRole("Mod"),
        owner: findRole("Owner"),
        techSupport: findRole("TechSupport"),
        muted: findRole("muted"),
        newbie: findRole("newbie"),
        fan: findRole("Fan")
    };

    Member = function (name, id) {
        this.name = name;
        this.id = id;
        this.strikes = 0;
        this.firedStrike = false;
    };

    Member.prototype.mute = function(time) {
        members.find(x => x.user.id === this.id).removeRole(roles.muted).catch(console.error);
        members.find(x => x.user.id === this.id).addRole(roles.muted).catch(console.error);
        setTimeout(() => {
            members.find(x => x.user.id === this.id).removeRole(roles.muted).catch(console.error);
        }, time);
    }
    Member.prototype.strike = function () {
        this.strikes++;
        if (this.strikes === 3) {
            this.mute(1000 * 60 * this.strikes * 4);
            roles.owner.members.array()[0].user.send(`User (${this.name}, ${this.id}) muted on ${Date()}`);
        }
        if (this.strikes === 6) {
            this.mute(1000 * 60 * this.strikes * 4);
            roles.owner.members.array()[0].user.send(`User (${this.name}, ${this.id}) muted on ${Date()}`);
        }
        if (this.strikes === 10) {
            this.mute(1000 * 60 * this.strikes * 4);
            roles.owner.members.array()[0].user.send(`User (${this.name}, ${this.id}) muted on ${Date()}`);
        }
    };
    Member.prototype.fireStrike = function (user, reason) {
        if (user != undefined) {
            let tried = "";
            if (this.firedStrike) {
                tried = "tried to";
            }
            roles.owner.members.array()[0].user.send(`The user (${this.name}, ${this.id}) ${tried} sent a report to the user (${user.username}, ${user.id})
            with the following reason: "${reason}" on ${Date()}`);
            if (!this.firedStrike) {
                memberz.find(x => x.id === user.id).strike();
            }
            this.firedStrike = true;
            setTimeout(() => {
                this.firedStrike = false;
            }, 1000 * 60 * 10);
        }
    }

    let x = new Member("lel", 123);
    memberz = [];
    members = bot.guilds.get("278378411095883776").members.array();
    for (let i in members) {
        let m = members[i];
        for (let r of m.roles.array()) {
            if (r == roles.muted) {
                m.removeRole(roles.muted);
            }
            if (r == roles.newbie) {
                m.removeRole(roles.newbie);
            }
        }
        memberz[i] = new Member(m.displayName, m.user.id);
    }
});

bot.on("error", e => {
    console.error(e);
});

bot.on("message", message => {
    const prefix = config.prefix;

    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;

    const parameters = message.content.split(" ");
    const command = parameters[0].slice(prefix.length);

    const lenny = "( ͡° ͜ʖ ͡°)";
    const lennylenny = "(͡ ͡° ͜ つ ͡͡°)";
    if (command === "lenny") {
        if (Math.ceil(Math.random() * 50) === 1) {
            message.channel.sendMessage(lennylenny);
        } else {
            message.channel.sendMessage(lenny);
        }
    }

    const masterlenny =
        "＜￣｀ヽ、　　　　　　　／￣>\n" +
        "　ゝ、　　＼　／⌒ヽ,ノ 　/´\n" +
        "　　　ゝ、　`（ ( ͡° ͜ʖ ͡°) ／\n" +
        "　　 　　>　 　 　,ノ\n" +
        "　　　　　∠_,,,/´”";
    if (command === "masterLenny") {
        message.delete();
        message.channel.sendMessage(masterlenny);
    }

    function hasRole(role) {
        return message.member.roles.has(role);
    }

    const matchmaking = message.guild.roles.find("name", "matchmaking");
    if (command === "role") {
        if (parameters[1].startsWith("<@")) {
            if (hasRole(roles.owner.id)) {
                const user = message.mentions.users.first();
                message.guild.members.get(user.id).addRole(findRole(parameters[2]));
            }
            if (hasRole(roles.techSupport.id)) {
                const user = message.mentions.users.first();
                if ((parameters[2] === "TechSupport")) {
                    message.guild.members.get(user.id).addRole(findRole(parameters[2]));
                }
            }
        }
        if (parameters[1] === "matchmaking") {
            message.member.addRole(matchmaking);
        }
    }
    if (command === "!role") {
        if (parameters[1].startsWith("@")) {
            if (hasRole(roles.owner.id)) {
                const user = message.mentions.users.first();
                message.guild.members.get(user.id).removeRole(findRole(parameters[2]));
            }
            if (hasRole(roles.techSupport.id)) {
                const user = message.mentions.users.first();
                if (/*(parameters[2] == "newbie") ||*/ (parameters[2] === "TechSupport")) {
                    message.guild.members.get(user.id).removeRole(findRole(parameters[2]));
                }
            }
        }
        if (parameters[1] === "matchmaking") {
            message.member.removeRole(matchmaking);
        }
    }

    if (command === "report") {
        const user = message.mentions.users.first();
        const author = message.author;
        memberz.find(x => x.id === author.id).fireStrike(user, parameters[2]);
    }

    if (hasRole(roles.mod.id)) {
        if (command === "say") {
            message.delete();
            send(parameters[1]);
        }

        if (command === "mute") {
            const time = parseTime(message.content.slice(5).split(" ")[2]);
            const user = message.mentions.users.first();
            message.channel.overwritePermissions(user, {
                SEND_MESSAGES: false
            });
            setTimeout(() => {
                message.channel.overwritePermissions(user, {
                    SEND_MESSAGES: true
                });
            }, time);
        }

        if (command === "unmute") {
            const user = message.mentions.users.first();
            message.channel.overwritePermissions(user, {
                SEND_MESSAGES: true
            });
        }
    }

    function send(m) {
        message.channel.sendMessage(m);
    }

    if (command === "eval") {
        if (message.author.id === "192283538110808064") {
            try {
                const code = message.content.slice(5);
                eval(code).catch(console.error);
            } catch (error) {
                if (
                    error !==
                    "TypeError: Cannot read property 'catch' of undefined"
                ) {
                    message.channel.sendMessage(error);
                }
            }
        }
    }
});

bot.on("guildMemberAdd", member => {
    // Add Fan role
    const role = member.guild.roles.find("name", "Fan");
    const newbie = member.guild.roles.find("name", "newbie");
    if (role) {
        member.addRole(role);
        member.addRole(newbie);
    }
    //memberz.push(new Member(member.displayName, member.user.id));

    setTimeout(() => {
        member.removeRole(newbie);
    }, 5 * 60000);

    // Welcome text
    const channel = member.guild.channels.find("name", "general");
    if (channel) {
        channel.sendMessage(
            unindent`Welcome, ${member}!
                |You will be muted for 5 minutes on all channels except #help, feel free to ask questions there, please use this time to read #information , #faq and #updates .`
        );
    }
});

bot.login(token);
