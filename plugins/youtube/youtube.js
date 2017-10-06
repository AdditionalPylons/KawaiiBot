"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
let regex = /(?:youtu\.be\/|youtube.com\/(?:watch\?.*\bv=|embed\/|v\/))(.+?)(?:[^-_a-zA-Z0-9]|$)/;
let api = "AIzaSyCSVwv5oyMDnz83Vu1dN8oAl1IPVdRf_HQ" + "&part=snippet,contentDetails,statistics,status";
class Youtube {
    constructor(bot) {
        this.name = "Youtube";
        this.version = "1.0.0";
        this.description = "A youtube link parser";
    }
    init() {
    }
    dispose() {
    }
    handleMessage(irc, from, to, text) {
        let parseYoutubeLink = (word) => {
            let youtubeIds = word.match(regex);
            if (youtubeIds != null) {
                let youtubeId = youtubeIds[1];
                https.get("https://www.googleapis.com/youtube/v3/videos?id=" + youtubeId + "&key=" + api, (res) => {
                    let data = "";
                    res.on("data", (chunk) => {
                        data += chunk;
                    });
                    res.on("end", () => {
                        let obj = JSON.parse(data);
                        if (obj != null && obj.items != null && obj.items.length > 0) {
                            irc.say(to, "\x02YouTube:\x02 " + obj.items[0].snippet.title + " | \x02" + obj.items[0].statistics.viewCount + "\x02 views |\x02\x033 " + obj.items[0].statistics.likeCount
                                + "\x03\x02 likes |\x02\x034 " + obj.items[0].statistics.dislikeCount + "\x03\x02 dislikes");
                        }
                    });
                }).on('error', (err) => {
                    console.log("Got error: " + err.message);
                });
            }
        };
        let words = text.split(" ");
        for (let w of words) {
            parseYoutubeLink(w);
        }
    }
    static findYoutubeURLs(text) {
    }
}
exports.Youtube = Youtube;
//# sourceMappingURL=youtube.js.map