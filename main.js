const Discord = require("discord.js");
const config = require("./config.json");
const CommandList = require("./command-list");
const { parseTime, unindent } = require("./util");
const token = process.env["LENNY_TOKEN"];
//const token = require("./secret.json").token;
const bot = new Discord.Client();
const commands = new CommandList(config.prefix);

bot.on("ready", () => {
    console.log("Ready to deploy lennies everywhere");
});

bot.on("error", e => {
    console.error(e);
});

bot.on("message", message => commands.run(message));

commands.add("lenny", ({ message }) => {
    if (Math.ceil(Math.random() * 50) == 1) {
        message.channel.sendMessage("(͡ ͡° ͜ つ ͡͡°)");
    } else {
        message.channel.sendMessage("( ͡° ͜ʖ ͡°)");
    }
});

commands.add("masterLenny", ({ message }) => {
    message.channel.sendMessage(
        "＜￣｀ヽ、　　　　　　　／￣>\n" +
            "　ゝ、　　＼　／⌒ヽ,ノ 　/´\n" +
            "　　　ゝ、　`（ ( ͡° ͜ʖ ͡°) ／\n" +
            "　　 　　>　 　 　,ノ\n" +
            "　　　　　∠_,,,/´”"
    );
});

commands.add("role", ({ message, parameters, hasRole, findRole }) => {
    if (parameters[1].startsWith("<@")) {
        if (hasRole("Owner")) {
            const user = message.mentions.users.first();
            message.guild.members.get(user.id).addRole(findRole(parameters[2]));
        }
        if (hasRole("TechSupport")) {
            const user = message.mentions.users.first();
            if (parameters[2] == "TechSupport") {
                message.guild.members
                    .get(user.id)
                    .addRole(findRole(parameters[2]));
            }
        }
    }
    if (parameters[1] == "matchmaking") {
        message.member.addRole("matchmaking");
    }
});

commands.add("!role", ({ message, parameters, hasRole, findRole }) => {
    if (parameters[1].startsWith("<@")) {
        if (hasRole("Owner")) {
            const user = message.mentions.users.first();
            message.guild.members
                .get(user.id)
                .removeRole(findRole(parameters[2]));
        }
        if (hasRole("TechSupport")) {
            const user = message.mentions.users.first();
            if (parameters[2] == "TechSupport") {
                message.guild.members
                    .get(user.id)
                    .removeRole(findRole(parameters[2]));
            }
        }
    }
    if (parameters[1] == "matchmaking") {
        message.member.removeRole("matchmaking");
    }
});

commands.add("say", ({ message, parameters, hasRole }) => {
    if (hasRole("Mod")) {
        message.delete();
        message.channel.sendMessage(parameters[1]);
    }
});

commands.add("mute", ({ message, hasRole }) => {
    if (hasRole("Mod")) {
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
});

commands.add("unmute", ({ message, hasRole }) => {
    if (hasRole("Mod")) {
        const user = message.mentions.users.first();
        message.channel.overwritePermissions(user, {
            SEND_MESSAGES: true
        });
    }
});

commands.add("eval", ({ message }) => {
    const send = m => message.channel.sendMessage(m);
    if (message.author.id === "192283538110808064") {
        try {
            const code = message.content.slice(5);
            const result = eval(code);
            if (result.catch) {
                result.catch(err => send(err));
            }
        } catch (error) {
            send(error);
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
