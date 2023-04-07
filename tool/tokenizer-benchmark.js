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
docs = []
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

var contetnts = fs.readFileSync(__dirname + "/../Readme.md", "utf-8").replace(/\r/g, "");
testCases = [{
    lines: contetnts.split(/\n/),
    name: "old",
    tokenizer: new (require("../src/mode/markdown_old.js").Mode)().getTokenizer(),
},{
    lines: contetnts.split(/\n/),
    name: "new",
    tokenizer: new (require("../src/mode/markdown.js").Mode)().getTokenizer(),
},{
    lines: contetnts.split(/\n/),
    name: "old",
    tokenizer: new (require("../src/mode/markdown_old.js").Mode)().getTokenizer(),
},{
    lines: contetnts.split(/\n/),
    name: "new",
    tokenizer: new (require("../src/mode/markdown.js").Mode)().getTokenizer(),
},
]

0 && testCases.forEach(function(testCase) {
    var start = performance.now()
    var proofs =[]
    for (var i = 0; i < 100; i++) {
        var proof = tokenize(testCase)
        proofs.push(proof);
    }
    var dt = performance.now() - start;
    testCase.dt = dt;
    testCase.proof = proofs[0].states.pop()
})



console.log(testCases.map(t => {
    return [t.name, t.lines.length, t.dt].join(" ")
}).join("\n"))



class StringInput {
    constructor(string) {this.string = string}
  
    get length() { return this.string.length }
  
    chunk(from) { return this.string.slice(from) }
  
    get lineChunks() { return false }
  
    read(from, to) { return this.string.slice(from, to) }

    lineAfter(pos) {
        var end = this.string.indexOf('\n', pos);
        return this.string.slice(pos, end);
    }
  }

  var r = require("lezer-markdown").parser.startParse(new StringInput("#hello"))

  console.log(r)