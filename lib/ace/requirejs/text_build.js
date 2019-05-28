

/*
 * used by r.js during build
 */

"use strict";
export const buildMap = Object.create(null);

export const load = function(name, req, onLoad, config) {
    var buildMap = exports.buildMap;
    buildMap[name] = require('fs').readFileSync(req.toUrl(name), 'utf8');
    onLoad(buildMap[name]);
};

export const write = function(pluginName, moduleName, write, config) {
    if (exports.buildMap[moduleName]) {
        var content = jsEscape(exports.buildMap[moduleName]);
        write.asModule(pluginName + "!" + moduleName,
           "define(function () { return '" +
               content +
           "';});\n");
    }
};

export const jsEscape = function(content) {
    return content.replace(/(['\\])/g, '\\$1')
        .replace(/[\f]/g, "\\f")
        .replace(/[\b]/g, "\\b")
        .replace(/[\n]/g, "\\n")
        .replace(/[\t]/g, "\\t")
        .replace(/[\r]/g, "\\r")
        .replace(/[\u2028]/g, "\\u2028")
        .replace(/[\u2029]/g, "\\u2029");
};
