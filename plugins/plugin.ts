import { Bot } from "../bot";
import { Client } from "irc";

export interface IMessageHandler {
    handleMessage(irc:Client, from:string, to:string, text:string);
}

export interface IJoinHandler {
    handleJoin(irc:Client, channel:string, nick:string);
}

export interface ICommandHandler {
    readonly commands:Array<string>;
    handleCommand(irc:Client, from:string, to:string, cmd:string, text:string);
}

export interface IPlugin {
    readonly version:string;
    readonly name:string;
    readonly description?:string;
    init();
    dispose();
}

export type EventHandler = (IJoinHandler | IMessageHandler | ICommandHandler);
export type Plugin = IPlugin & EventHandler;

export interface PluginConstructor {
    new (bot:Bot) : Plugin & EventHandler
}

export namespace Helpers {
    export function isMessageHandler(plugin:EventHandler) : plugin is IMessageHandler {
        return (plugin as IMessageHandler).handleMessage !== undefined;
    }

    export function isCommandHandler(plugin:EventHandler) : plugin is ICommandHandler {
        return (plugin as ICommandHandler).handleCommand !== undefined;
    }
    
    export function isJoinHandler(plugin:EventHandler) : plugin is IJoinHandler {
        return (plugin as IJoinHandler).handleJoin !== undefined;
    }
}