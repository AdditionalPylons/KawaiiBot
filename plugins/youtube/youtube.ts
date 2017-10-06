import { PluginConstructor, IPlugin, IMessageHandler } from "../plugin";
import { Client } from "irc";
import { Bot } from "../../bot";
import * as https from "https";

let regex = /(?:youtu\.be\/|youtube.com\/(?:watch\?.*\bv=|embed\/|v\/))(.+?)(?:[^-_a-zA-Z0-9]|$)/;
let api = "AIzaSyCSVwv5oyMDnz83Vu1dN8oAl1IPVdRf_HQ" + "&part=snippet,contentDetails,statistics,status";

export class Youtube implements IPlugin, IMessageHandler {
    name = "Youtube";
    version = "1.0.0";
    description = "A youtube link parser";

    constructor(bot:Bot) {
        
    }

    init() {

    }

    dispose() {

    }

    handleMessage(irc:Client, from:string, to:string, text:string) {
        let parseYoutubeLink = (word:string) => {
            let youtubeIds = word.match(regex);
            if(youtubeIds != null) {
                let youtubeId = youtubeIds[1];
                https.get("https://www.googleapis.com/youtube/v3/videos?id=" + youtubeId + "&key=" + api, (res:https.IncomingMessage) => {
                    let data = "";
                    res.on("data", (chunk:string) => {
                        data += chunk;
                    });
                    res.on("end", () => {
                        let obj = JSON.parse(data);
                        if(obj != null && obj.items != null && obj.items.length > 0) {
                            irc.say(to, "\x02YouTube:\x02 " + obj.items[0].snippet.title + " | \x02" + obj.items[0].statistics.viewCount + "\x02 views |\x02\x033 " + obj.items[0].statistics.likeCount 
                            + "\x03\x02 likes |\x02\x034 " + obj.items[0].statistics.dislikeCount + "\x03\x02 dislikes");
                        }
                    })
                }).on('error', (err:Error) => {
                    console.log("Got error: " + err.message);
                });
            }
        }
        let words = text.split(" ");
        for(let w of words) {
            parseYoutubeLink(w);
        }
    }

    static findYoutubeURLs(text:string) {
       
    }
}