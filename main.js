const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("./config.json");
const token = process.env["LENNY_TOKEN"];
//const token = require("./secret.json").token;
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
    const command = parameters[0].slice(prefix.length);

    const roles = {
        mod: findRole("Mod"),
        owner: findRole("Owner"),
        techSupport: findRole("TechSupport")
    };
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
    function hasRole(role){
        return message.member.roles.has(role);
    }

    const matchmaking = message.guild.roles.find("name", "matchmaking");
    if (command == "role") {
        if (parameters[1].startsWith("<@")){
            if (hasRole(roles.owner.id)) {
                const user = message.mentions.users.first();
                message.guild.members.get(user.id).addRole(findRole(parameters[2]));
            }
            if (hasRole(roles.techSupport.id)){
                const user = message.mentions.users.first();
                if (/*(parameters[2] == "newbie") ||*/ (parameters[2] == "TechSupport")) {
                    message.guild.members.get(user.id).addRole(findRole(parameters[2]));
                }
            }
        }
        if (parameters[1] == "matchmaking") {
            message.member.addRole(matchmaking);
        }
    }
    if (command == "!role") {
        if (parameters[1].startsWith("<@")){
            if (hasRole(roles.owner.id)) {
                const user = message.mentions.users.first();
                message.guild.members.get(user.id).removeRole(findRole(parameters[2]));
            }
            if (hasRole(roles.techSupport.id)){
                const user = message.mentions.users.first();
                if (/*(parameters[2] == "newbie") ||*/ (parameters[2] == "TechSupport")) {
                    message.guild.members.get(user.id).removeRole(findRole(parameters[2]));
                }
            }
        }
        if (parameters[1] == "matchmaking") {
            message.member.removeRole(matchmaking);
        }
    }

    if (hasRole(roles.mod.id)) {
        if (command === "say") {
            message.delete();
            send(parameters[1]);
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
    const newbie = member.guild.roles.find("name", "newbie");
    if (role) {
        member.addRole(role);
        member.addRole(newbie);
    }

    setTimeout(()=>{
       member.removeRole(newbie);
    },5*60000);

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
