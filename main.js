const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');
const secret = require('./secret.json');
const token = process.env["LENNY_TOKEN"];

bot.on('ready', () => {
    console.log(`Ready to deploy lennies everywhere`);
});

bot.on('error', e => {
    console.error(e);
});

bot.on('message', message => {
    const prefix = config.prefix;

    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;

    const command = message.content.split(" ")[0].slice(prefix.length);
    const mod = message.guild.roles.find("name", "Mod");

    const lenny = "( ͡° ͜ʖ ͡°)";
    const lennylenny = "(͡ ͡° ͜ つ ͡͡°)";
    if (command === 'lenny') {
        if (Math.ceil(Math.random()*50) == 1){
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
    if (command === 'masterLenny') {
        message.channel.sendMessage(masterlenny);
    }

    if (message.member.roles.has(mod.id)){
        if (command === "say") {
            message.delete();
            message.channel.sendMessage(message.content.slice(4));
        }

        if (command == "mute"){
            const time = message.content.slice(5).split(" ")[2];
            const user = message.mentions.users.first();
            message.channel.overwritePermissions(user, {
                SEND_MESSAGES: false
            });
            setTimeout(()=>{
                message.channel.overwritePermissions(user, {
                    SEND_MESSAGES: true
                });
            },time)
        }

        if (command == "unmute"){
            const time = message.content.slice(5).split(" ")[2];
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
                if (error != "TypeError: Cannot read property 'catch' of undefined") {
                    message.channel.sendMessage(error);
                }
            }
        }
    }
});

bot.on('guildMemberAdd', member => {
    const role = member.guild.roles.find('name', 'Fan');
    if (role) {
        member.addRole(role);
    }
});

bot.login(token);
