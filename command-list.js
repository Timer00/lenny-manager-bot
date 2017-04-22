function bindProps(self, props) {
    props.forEach(prop => self[prop] = self[prop].bind(self));
}

class CommandEvent {
    constructor(message) {
        if (!message) throw new Error("No message provided.");
        this.message = message;
        bindProps(this, ["findRole", "hasRole", "hasRoleId", "parameters"]);
    }

    findRole(name) {
        return this.message.guild.roles.find("name", name);
    }

    hasRole(role) {
        if (typeof role === "string") {
            role = this.findRole(role);
        }
        return this.message.member.roles.has(role.id);
    }

    hasRoleId(role) {
        if (typeof role.id === "string") {
            role = role.id;
        }
        return this.message.member.roles.has(role);
    }

    get parameters() {
        return this.message.content.split(" ");
    }
}

class CommandList {
    constructor(prefix) {
        this.prefix = prefix;
        this.commands = {};
    }

    add(command, handler) {
        this.commands[command] = handler;
    }

    run(message) {
        if (!message) throw new Error("No message provided.");
        if (!message.content.startsWith(this.prefix)) return;
        if (message.author.bot) return;

        const command = message.content.slice(
            this.prefix.length,
            message.content.indexOf(" ")
        );
        const handler = this.commands[command];
        if (handler) {
            handler(new CommandEvent(message));
        }
    }
}

module.exports = CommandList;
