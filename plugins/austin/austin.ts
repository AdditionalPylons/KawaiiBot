import { IPlugin, IMessageHandler, IJoinHandler, ICommandHandler } from '../plugin';
import { Bot } from '../../bot';
import { Client } from 'irc';

let austinRegex = /(Anni*|Austin)/i;
let regex = /((WHERE'S|(WHERE IS)|WHERES){1} (ANNI|AUTISM|AUSTIN|ANNIHILATES){1})+/i;

export class Austin implements IPlugin, ICommandHandler, IMessageHandler {
    name = "Austin";
    version = "1.0.0";
    description = "Where is Austin?";

    constructor(bot:Bot) {

    }

    init() {}
    dispose() {}
    
    haandleJoin(irc:Client, channel:string, nick:string) {
        if(austinRegex.test(nick)) {
            irc.say(channel, "Summoning complete");
        }
    }

    handleMessage(irc:Client, from:string, to:string, text:string) {
        if(regex.test(text)) {
            irc.say(to, "WHERE'S AUSTIN?");
        }
    }

    readonly commands = [".summon"];
    handleCommand(irc:Client, from:string, to:string, cmd:string, text:string ) {
        irc.say(to, "WHERE's AUSTIN?");
    }
}