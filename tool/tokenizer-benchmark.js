#!/usr/bin/env node

require("amd-loader")
var modeList = require("../src/ext/modelist")
var fs = require("fs");
const modelist = require("../src/ext/modelist");
const { stringRepeat } = require("../src/lib/lang");

var docs = fs.readdirSync(__dirname + "/../demo/kitchen-sink/docs").map(x => {
    return __dirname + "/../demo/kitchen-sink/docs/" + x
}).concat([
    __dirname + "/../src/virtual_renderer.js",
    __dirname + "/../src/editor.js",
    __dirname + "/../build/src/ace.js"
]);


var tokenize = function(testCase) {
    console.log(testCase.name)
    var lines = testCase.lines
    var tokenizer = testCase.tokenizer;
    var states = [];
    var tokens = [];
    for (var i = 0, l = lines.length; i < l; i++) {
        var data = tokenizer.getLineTokens(lines[i], data?.state);
        states.push(data.state);
        tokens.push(data.tokens);
    }
    return {tokens, states}
}

var testCases = docs.map(function(x) {
    var contetnts = fs.readFileSync(x, "utf-8").replace(/\r/g, "");
    var mode = modelist.getModeForPath(x)
    var Mode = require(
        (/jsoniq|xquery/.test(mode.name) ? "../lib/ace/mode/" : "../src/mode/")
         + mode.name).Mode
    var modeInstance = new Mode();
    return {
        name: mode.name,
        length: contetnts.length,
        mode: modeInstance,
        lines: contetnts.split(/\n/),
        tokenizer: modeInstance.getTokenizer(),
    };
}).filter(x => !/mask|luapage/.test(x.name))



testCases.forEach(function(testCase) {
    var start = performance.now()
    var proofs =[]
    for (var i = 0; i < 10; i++) {
        var proof = tokenize(testCase)
        proofs.push(proof);
    }
    var dt = performance.now() - start;
    testCase.dt = dt;
    testCase.proof = proofs[0].states.pop()
})



console.log(testCases.map(t => {
    return [t.name, t.lines.length, t.dt/t.length].join(" ")
}).join("\n"))