import { Client, IClientOpts } from "irc";
import { Plugin, PluginConstructor, IJoinHandler, IMessageHandler, EventHandler, Helpers} from "./plugins/plugin";
import { Youtube } from "./plugins/youtube/youtube";
export class Bot {
    private plugins:Array<Plugin>;
    readonly client: Client;
    constructor(server:string, name:string, options?:IClientOpts, ...plugins: PluginConstructor[]) {
        this.client = new Client(server, name, options);
        this.client.addListener("message", (from:string, to:string, text:string, message:string) => {
            for(let p of this.plugins) {
                if(Helpers.isMessageHandler(p)) {
                    p.handleMessage(this.client, from, to, text);
                }
            }
        });
        this.client.addListener("join", (channel:string, nick:string, messsage:string) => {

        });
        this.client.addListener("error", (message:string) => {
            console.log('error: ', message);
        });
        this.plugins = new Array<Plugin>();
        for(let p of plugins) {
            this.loadPlugin(p);
        }
    }
    private commands: Map<string, IMessageHandler>;
    private registerCommand(cmd:string, handler:IMessageHandler):boolean {
        if(this.commands.has(cmd)) {
            return false;
        }
        this.commands.set(cmd, handler);
        return true;
    }

    private loadPlugin(ctor:PluginConstructor) {
        let plugin:Plugin = new ctor(this);
        this.plugins.push(plugin);
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

let kawaiibot = new Bot("irc.memers.co", "KawaiiBot", {channels:["#flux"], autoConnect: true, autoRejoin: true}, Youtube);