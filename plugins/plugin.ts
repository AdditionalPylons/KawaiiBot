import { Bot } from "../bot";
import { Client } from "irc";

export interface IMessageHandler {
    readonly commands?:Array<string>
    handleMessage(irc:Client, from:string, to:string, text:string);
}

export interface IJoinHandler {
    handleJoin();
}

export interface IPlugin {
    readonly version:string;
    readonly name:string;
    readonly description?:string;
    init();
    dispose();
}

export type EventHandler = (IJoinHandler | IMessageHandler);
export type Plugin = IPlugin & EventHandler;

export interface PluginConstructor {
    new (bot:Bot) : Plugin & EventHandler
}

export namespace Helpers {
    export function isMessageHandler(plugin:EventHandler) : plugin is IMessageHandler {
        return (plugin as IMessageHandler).handleMessage !== undefined;
    }
    
    export function isJoinHandler(plugin:EventHandler) : plugin is IJoinHandler {
        return (plugin as IJoinHandler).handleJoin !== undefined;
    }
}