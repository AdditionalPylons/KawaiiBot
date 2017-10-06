"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const irc_1 = require("irc");
const plugin_1 = require("./plugins/plugin");
const youtube_1 = require("./plugins/youtube/youtube");
class Bot {
    constructor(server, name, options, ...plugins) {
        this.client = new irc_1.Client(server, name, options);
        this.client.addListener("message", (from, to, text, message) => {
            for (let p of this.plugins) {
                if (plugin_1.Helpers.isMessageHandler(p)) {
                    p.handleMessage(this.client, from, to, text);
                }
            }
        });
        this.client.addListener("join", (channel, nick, messsage) => {
        });
        this.client.addListener("error", (message) => {
            console.log('error: ', message);
        });
        this.plugins = new Array();
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
let kawaiibot = new Bot("irc.memers.co", "KawaiiBot", { channels: ["#flux"], autoConnect: true, autoRejoin: true }, youtube_1.Youtube);
//# sourceMappingURL=bot.js.map