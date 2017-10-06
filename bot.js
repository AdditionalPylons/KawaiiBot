"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const irc_1 = require("irc");
const plugin_1 = require("./plugins/plugin");
const youtube_1 = require("./plugins/youtube/youtube");
const austin_1 = require("./plugins/austin/austin");
class Bot {
    constructor(server, name, options, ...plugins) {
        this.client = new irc_1.Client(server, name, options);
        this.plugins = new Array();
        this.commands = new Map();
        this.client.addListener("message", (from, to, text, message) => {
            for (let p of this.plugins) {
                if (plugin_1.Helpers.isMessageHandler(p)) {
                    p.handleMessage(this.client, from, to, text);
                }
            }
            let parts = text.split(" ");
            if (parts.length > 0) {
                let cmd = parts[0];
                if (this.commands.has(cmd)) {
                    let handler = this.commands.get(cmd);
                    if (handler) {
                        parts.splice(0, 1);
                        handler.handleCommand(this.client, from, to, cmd, parts.join(" "));
                    }
                }
            }
        });
        this.client.addListener("join", (channel, nick, messsage) => {
        });
        this.client.addListener("error", (message) => {
            console.log('error: ', message);
        });
        for (let p of plugins) {
            this.loadPlugin(p);
        }
    }
    registerCommand(cmd, handler) {
        if (this.commands.has(cmd)) {
            return false;
        }
        this.commands.set(cmd, handler);
        return true;
    }
    loadPlugin(ctor) {
        let plugin = new ctor(this);
        this.plugins.push(plugin);
        if (plugin_1.Helpers.isCommandHandler(plugin)) {
            for (let cmd of plugin.commands) {
                this.registerCommand(cmd, plugin);
            }
        }
        plugin.init();
    }
    unloadPlugin(plugin) {
        let index = this.plugins.indexOf(plugin);
        if (index > -1) {
            this.plugins.splice(index, 1);
        }
        plugin.dispose();
    }
}
exports.Bot = Bot;
let kawaiibot = new Bot("irc.memers.co", "GNU|Dad", { channels: ["#flux"], autoConnect: true, autoRejoin: true }, youtube_1.Youtube, austin_1.Austin);
//# sourceMappingURL=bot.js.map