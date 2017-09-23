const bot = require("./bot-client");
const moment = require('moment');
const token = process.env["LENNY_TOKEN"];
//const token = require("./secret.json").token;
const MemberInfo = require("./member-info");
const state = require("./state");
const {parseTime, unindent, toLowerInitial} = require("./util");
const roles = state.roles;

data = {
    base: {},
    channel: 0,
    message: "",
    update: false
};

function findRole(name) {
    return bot.guilds.get("278378411095883776").roles.find("name", name);
}

function text(array, index) {
    let x = array.splice(-(array.length - index));
    return x.join(" ");
}

bot.on("ready", () => {
    console.log("Ready to deploy lennies everywhere");

    [
        "Mod",
        "Owner",
        "TechSupport",
        "muted",
        "newbie",
        "Fan",
        "Collaborator",
        "Tournament"
    ].forEach(roleName => {
        roles[toLowerInitial(roleName)] = findRole(roleName);
    });

    bot.guilds.get("278378411095883776").members.forEach(member => {
        [roles.muted, roles.newbie].forEach(role => {
            if (member.roles.has(role.id)) {
                member.removeRole(role);
            }
        });
        state.memberInfos.push(new MemberInfo(member.displayName, member.user.id));
    });

    data.channel = bot.guilds.get("278378411095883776").channels.find("name", "database");
    data.channel.fetchMessage(data.channel.lastMessageID).then(message => {
        data.message = message;
        data.base = JSON.parse(data.message.content);
    });
});

bot.on("error", e => {
    console.error(e);
});

bot.on("message", message => {
    const prefix = data.base.bot.prefix;

    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;

    // make sure we have some message history loaded
    // TODO: this is async, so will not be available for this request
    if (message.channel.messages.size < 20) {
        message.channel.fetchMessages({limit: 20});
    }

    const caseParameters = message.content.split(" ");
    const parameters = message.content.split(" ").map(x=>x.toLowerCase());
    const command = parameters[0].slice(prefix.length).toLowerCase();

    const lenny = "( ͡° ͜ʖ ͡°)";
    const lennylenny = "(͡ ͡° ͜ つ ͡͡°)";
    if (command === "lenny") {
        if (Math.ceil(Math.random() * 50) === 1) {
            send(lennylenny);
        } else {
            send(lenny);
        }
        return
    }

    const masterlenny =
        "＜￣｀ヽ、　　　　　　　／￣>\n" +
        "　ゝ、　　＼　／⌒ヽ,ノ 　/´\n" +
        "　　　ゝ、　`（ ( ͡° ͜ʖ ͡°) ／\n" +
        "　　 　　>　 　 　,ノ\n" +
        "　　　　　∠_,,,/´”";
    if (command === "masterlenny") {
        message.delete();
        send(masterlenny);
    }

    function hasRole(role) {
        return message.member.roles.has(role);
    }

    function send(m) {
        message.channel.send(m);
    }

    const matchmaking = message.guild.roles.find("name", "matchmaking");
    if (command === "role") {
        if (parameters[1].startsWith("<@")) {
            if (typeof parameters[2] === "undefined"){
                if (message.author.id === "106581917842841600"){//Fractal ID 106581917842841600
                    const user = message.mentions.users.first();
                    message.guild.members.get(user.id).addRole(roles["tournament"]);
                }
                return;
            }
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
        if (parameters[1].startsWith("<@")) {
            if (typeof parameters[2] === "undefined"){
                if (message.author.id === "106581917842841600"){
                    const user = message.mentions.users.first();
                    message.guild.members.get(user.id).removeRole(roles["tournament"]);
                }
                return;
            }
            if (hasRole(roles.owner.id)) {
                const user = message.mentions.users.first();
                message.guild.members.get(user.id).removeRole(findRole(parameters[2]));
            }
            if (hasRole(roles.techSupport.id)) {
                const user = message.mentions.users.first();
                if (parameters[2] === "TechSupport") {
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
        state.memberInfos.find(x => x.id === author.id).fireStrike(user, text(caseParameters, 2));
    }

    if (command === "timetoevent"){
        let event = moment(data.base.event.date);
        let days = event.diff(moment())/1000/60/60/24;
        let hours = days*24-Math.floor(days)*24;
        let minutes = hours*60-Math.floor(hours)*60;
        let seconds = minutes*60-Math.floor(minutes)*60;
        send(`${Math.floor(days)} days, ${Math.floor(hours)} hours, ${Math.floor(minutes)} minutes and ${Math.floor(seconds)} seconds until the event!`);
    }

    if (command === "serverstatus") {
        if (hasRole(roles.collaborator.id)) {
            if (parameters[1] !== undefined) {
                data.base.server.status = text(caseParameters, 1);
                data.update = true;
            } else {
                send(data.base.server.status);
            }
        } else {
            send(data.base.server.status);
        }
    }

    if (hasRole(roles.mod.id)) {
        if (command === "say") {
            message.delete();
            send(text(caseParameters, 1));
        }

        if (command === "mute") {
            const timeArg = message.content.slice(5).split(" ")[2];
            if (!timeArg) {
                return;
            }
            const time = parseTime(timeArg);
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

        if (command === "cleanup") {
            const users = message.mentions.users;
            const cutoff = Date.now() - parseTime(arguments[2]);
            const messages = message.channel.messages.filter(m =>
                users.has(m.author.id) && m.createdTimestamp >= cutoff
            );
            if (messages.size > 0) {
                message.channel.bulkDelete(messages);
            }
        }

        if (command === "objectives") {
            send(data.base.mods.objectives);
        }
        if (command === "commands") {
            send(data.base.mods.commands);
        }
        if (hasRole(roles.owner.id)) {
            if (command=== "edit") {
                if (parameters[1] === "objectives") {
                    if (parameters[2] === "new") {
                        data.base.mods.objectives.push(text(caseParameters, 3));
                        data.update = true;
                    }
                    if (parameters[2] === "del") {
                        data.base.mods.objectives.splice(Number(parameters[3]), 1);
                        data.update = true;
                    }
                }
                if (parameters[1] === "commands") {
                    if (parameters[2] === "new") {
                        data.base.mods.commands.push(text(caseParameters, 3));
                        data.update = true;
                    }
                    if (parameters[2] === "del") {
                        data.base.mods.commands.splice(Number(parameters[3]), 1);
                        data.update = true;
                    }
                }
            }
        }
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
                    send(error);
                }
            }
        }
    }

    if (data.update){
        data.message.delete();
        data.channel.send(JSON.stringify(data.base));
        data.update = false;
    }

});

bot.on("guildMemberAdd", member => {
    // Add Fan role
    const role = member.guild.roles.find("name", "Fan");
    const newbie = member.guild.roles.find("name", "newbie");
    if (role) {
        member.addRole(role);
        //member.addRole(newbie);
    }
    state.memberInfos.push(new MemberInfo(member.displayName, member.user.id));

    /*setTimeout(() => {
        member.removeRole(newbie);
    }, 5 * 60000);*/

    // Welcome text
    const channel = member.guild.channels.find("name", "lenny");
    const infoc = member.guild.channels.find("name", "information");
    const helpc = member.guild.channels.find("name", "help");
    const updc = member.guild.channels.find("name", "updates");
    const faqc = member.guild.channels.find("name", "faq");
    if (channel) {
        channel.send(
            unindent`Welcome, ${member}!
                |Please read ${infoc} , ${faqc} and ${updc} to better understand the project and it's current situation. The english installation instructions are located here: 
http://steamcommunity.com/sharedfiles/filedetails/?id=904845972
 If you need any help feel free to use the ${helpc} channel.`
        );
    }
    //You will be muted for 5 minutes on all channels except #help, feel free to ask questions there, please use this time to read #information , #faq and #updates . The english installation instructions are located here: http://steamcommunity.com/sharedfiles/filedetails/?id=904845972 - More languages are avaliable at #information.`
});

bot.login(token);

//Bot Evil Sneak Plan
// bot.guilds.find(x=>x.name ==="DevChat").id;