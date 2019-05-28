

/*
 * Extremely simplified version of the requireJS text plugin
 */
 
(function() {

var globalRequire = typeof require != "undefined" && require;
if (typeof define !== "function" || (!define.amd && typeof XMLHttpRequest == "undefined")) {
    // running in webpack
    export default globalRequire("./text_loader_webpack");
}
define(function (require, exports, module) {
    "use strict";
    if (globalRequire && globalRequire.nodeRequire) {
        export default globalRequire.nodeRequire(require.toUrl("./text_build"));
    } else {
        export const load = function(name, req, onLoad, config) {
            require("../lib/net").get(req.toUrl(name), onLoad);
        };
    }
});

})();
