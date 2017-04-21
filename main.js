const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
const token = process.env["LENNY_TOKEN"];
const { parseTime, unindent } = require("./util");

bot.on("ready", () => {
    console.log("Ready to deploy lennies everywhere");
});

bot.on("error", e => {
    console.error(e);
});

bot.on("message", message => {
    const prefix = config.prefix;

    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;

    const parameters = message.content.split(" ");
    const command = message.content.split(" ")[0].slice(prefix.length);
    const mod = message.guild.roles.find("name", "Mod");
    const owner = message.guild.roles.find("name", "Owner");

    const lenny = "( ͡° ͜ʖ ͡°)";
    const lennylenny = "(͡ ͡° ͜ つ ͡͡°)";
    if (command === "lenny") {
        if (Math.ceil(Math.random() * 50) == 1) {
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
        message.channel.sendMessage(masterlenny);
    }

    function findRole(name){
        return message.guild.roles.find("name", name);
    }

    const matchmaking = message.guild.roles.find("name", "matchmaking");
    if (command == "role") {
        if (parameters[1].startsWith("@")){
            if (message.member.roles.has(owner.id)) {
                const user = message.mentions.users.first();
                user.addRole(findRole(parameters[2]));
            }
        }
        if (parameters[1] == "matchmaking") {
            message.member.addRole(matchmaking);
        }
    }
    if (command == "!role") {
        if (parameters[1].startsWith("@")){
            if (message.member.roles.has(owner.id)) {
                const user = message.mentions.users.first();
                user.removeRole(findRole(parameters[2]));
            }
        }
        if (parameters[1] == "matchmaking") {
            message.member.removeRole(matchmaking);
        }
    }

    if (message.member.roles.has(mod.id)) {
        if (command === "say") {
            message.delete();
            send(message.content.split(" ")[1]);
        }

        if (command == "mute") {
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

        if (command == "unmute") {
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
                    error !=
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
    if (role) {
        member.addRole(role);
    }
    // Welcome text
    const channel = member.guild.channels.find("name", "general");
    if (channel) {
        channel.sendMessage(
            unindent`Welcome, ${member}!
                |Please check #main-info, #faq and #updates for the latest info on how to get started playing Magicka: Wizard Wars!`
        );
    }
});

bot.login(token);
