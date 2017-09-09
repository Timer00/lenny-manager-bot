const bot = require("./bot-client");
const dataPath = "./data.json";
const data = require(dataPath);
const fileSystem = require('fs');
const token = process.env["LENNY_TOKEN"];
//const token = require("./secret.json").token;
const MemberInfo = require("./member-info");
const state = require("./state");
const {parseTime, unindent, toLowerInitial} = require("./util");
const roles = state.roles;
let serverStatus = "Offline";

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
        "Collaborator"
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
});

bot.on("error", e => {
    console.error(e);
});

bot.on("message", message => {
    const prefix = data.prefix;

    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;

    // make sure we have some message history loaded
    // TODO: this is async, so will not be available for this request
    if (message.channel.messages.size < 20) {
        message.channel.fetchMessages({limit: 20});
    }

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
        state.memberInfos.find(x => x.id === author.id).fireStrike(user, text(parameters, 2));
    }

    if (command.toLowerCase() === "serverstatus") {
        if (hasRole(roles.collaborator.id)) {
            if (parameters[1] !== undefined) {
                data.serverStatus = text(parameters, 1);
                fileSystem.writeFile(dataPath, JSON.stringify(data, null, 2), function (error) {
                    if (error) return console.log(error);
                });
            } else {
                send(data.serverStatus);
            }
        } else {
            send(data.serverStatus);
        }
    }


    if (hasRole(roles.mod.id)) {
        if (command === "say") {
            message.delete();
            send(text(parameters, 1));
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
            const cutoff = Date.now() - parseTime("3m");
            const messages = message.channel.messages.filter(m =>
                users.has(m.author.id) && m.createdTimestamp >= cutoff
            );
            if (messages.size > 0) {
                message.channel.bulkDelete(messages);
            }
        }

        if (command.toLowerCase() === "objectives") {
            send(data.mods.objectives);
        }
        if (command.toLowerCase() === "commands") {
            send(data.mods.commands);
        }
        if (hasRole(roles.owner.id)) {
            if (command.toLowerCase() === "edit") {
                if (parameters[1].toLowerCase() === "objectives") {
                    if (parameters[2].toLowerCase() === "new") {
                        data.mods.objectives.push(parameters[3]);
                        fileSystem.writeFile(dataPath, JSON.stringify(data, null, 2), function (error) {
                            if (error) return console.log(error);
                        });
                    }
                    if (parameters[2].toLowerCase() === "del") {
                        data.mods.objectives.splice(Number(parameters[3]), 1);
                        fileSystem.writeFile(dataPath, JSON.stringify(data, null, 2), function (error) {
                            if (error) return console.log(error);
                        });
                    }
                }
                if (parameters[1].toLowerCase() === "commands") {
                    if (parameters[2].toLowerCase() === "new") {
                        data.mods.commands.push(parameters[3]);
                        fileSystem.writeFile(dataPath, JSON.stringify(data, null, 2), function (error) {
                            if (error) return console.log(error);
                        });
                    }
                    if (parameters[2].toLowerCase() === "del") {
                        data.mods.commands.splice(Number(parameters[3]), 1);
                        fileSystem.writeFile(dataPath, JSON.stringify(data, null, 2), function (error) {
                            if (error) return console.log(error);
                        });
                    }
                }
            }
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
        channel.sendMessage(
            unindent`Welcome, ${member}!
                |Please read ${infoc} , ${faqc} and ${updc} to better understand the project and it's current situation. The english installation instructions are located here: 
http://steamcommunity.com/sharedfiles/filedetails/?id=904845972
 If you need any help feel free to use the ${helpc} channel.`
        );
    }
    //You will be muted for 5 minutes on all channels except #help, feel free to ask questions there, please use this time to read #information , #faq and #updates . The english installation instructions are located here: http://steamcommunity.com/sharedfiles/filedetails/?id=904845972 - More languages are avaliable at #information.`
});

bot.login(token);
