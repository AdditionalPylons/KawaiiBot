"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Helpers;
(function (Helpers) {
    function isMessageHandler(plugin) {
        return plugin.handleMessage !== undefined;
    }
    Helpers.isMessageHandler = isMessageHandler;
    function isJoinHandler(plugin) {
        return plugin.handleJoin !== undefined;
    }
    Helpers.isJoinHandler = isJoinHandler;
})(Helpers = exports.Helpers || (exports.Helpers = {}));
//# sourceMappingURL=plugin.js.map