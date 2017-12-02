import { Client, IClientOpts } from "irc";
import { Plugin, PluginConstructor, ICommandHandler, IJoinHandler, IMessageHandler, EventHandler, Helpers} from "./plugins/plugin";
import { Youtube } from "./plugins/youtube/youtube";
import { Austin } from "./plugins/austin/austin";
export class Bot {
    private plugins:Array<Plugin>;
    private commands: Map<string, ICommandHandler>;
    readonly client: Client;
    constructor(server:string, name:string, options?:IClientOpts, ...plugins: PluginConstructor[]) {
        this.client = new Client(server, name, options);
        this.plugins = new Array<Plugin>();
        this.commands = new Map<string, ICommandHandler>();
        this.client.addListener("message", (from:string, to:string, text:string, message:string) => {
            for(let p of this.plugins) {
                if(Helpers.isMessageHandler(p)) {
                    p.handleMessage(this.client, from, to, text);
                }
            }
            let parts = text.split(" ");
            if(parts.length > 0) {
                let cmd = parts[0];
                if(this.commands.has(cmd)) {
                    let handler = this.commands.get(cmd);
                    if(handler) {
                        parts.splice(0, 1);
                        handler.handleCommand(this.client, from, to, cmd, parts.join(" "));
                    }
                }
            }
        });
        this.client.addListener("join", (channel:string, nick:string, messsage:string) => {

        });
        this.client.addListener("error", (message:string) => {
            console.log('error: ', message);
        });
        for(let p of plugins) {
            this.loadPlugin(p);
        }
    }

    private registerCommand(cmd:string, handler:ICommandHandler):boolean {
        if(this.commands.has(cmd)) {
            return false;
        }
        this.commands.set(cmd, handler);
        return true;
    }

    private loadPlugin(ctor:PluginConstructor) {
        let plugin:Plugin = new ctor(this);
        this.plugins.push(plugin);
        if(Helpers.isCommandHandler(plugin)) {
            for(let cmd of plugin.commands) {
                this.registerCommand(cmd, plugin);
            }
        }
        plugin.init();
    }

    private unloadPlugin(plugin:Plugin) {
        let index = this.plugins.indexOf(plugin);
        if(index > -1) {
            this.plugins.splice(index, 1);
        }
        plugin.dispose();
    }

    // private reloadPlugin(pluginType:PluginConstructor) {
    //     let p = this.plugins.find(p => p instanceof pluginType);
    //     this.unloadPlugin(p);
    // }
}

let kawaiibot = new Bot("irc.memers.co", "GNU|Dad", {channels:["#flux"], autoConnect: true, autoRejoin: true}, 
    Youtube, Austin);