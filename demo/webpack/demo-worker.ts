"use strict";


importScripts(require("file-loader?esModule=false!ace-builds/src-noconflict/worker-json.js"));




import {ExprParser} from "./parsers/expression-parser/ExprParser"
import {ExprLexer} from "./parsers/expression-parser/ExprLexer"




var tokens = new ExprLexer("true ? x : false").tokenize()
new ExprParser(tokens).parse()


import {CVUParser} from "./parsers/cvu-parser/CVUParser"
import {CVULexer} from "./parsers/cvu-parser/CVULexer"
import {CVUSerializer} from "./parsers/cvu-parser/CVUToString";


import {parseCVU} from "./parsers/editor/cvu";
import {getCompletions} from "./parsers/editor/completions";


var validate = function(input, doc) { 
    var annotations = []
    var resultArray = []
    try {
        
        var lexer = new CVULexer(input)
        var tokens = lexer.tokenize()
        let parser = new CVUParser(tokens)
        resultArray = parser.parse()
    } catch(e) {
        if (!e.CVUToken) e.CVUToken = {};
        annotations.push({
            type: "error",
            row: e.CVUToken.row,
            column: e.CVUToken.col,
            text: JSON.stringify(e, null, 4)
        })
    }
    
    var cvuString = new CVUSerializer().valueToString(resultArray, 0, "    ");
    
    return {
        annotations,
        cvuString,
        tokens,
    };
};


ace.define('ace/worker/my-worker',[], function(require, exports, module) {
    "use strict";

    var oop = require("ace/lib/oop");
    var {Mirror} = require("ace/worker/mirror");
    var {Document} = require("ace/document");

    var MyWorker = function(sender) {
        Mirror.call(this, sender);
        this.setTimeout(200);
        this.doc.on("change", () => {
            this.ast = null
        })
    };

    oop.inherits(MyWorker, Mirror);

    (function() {
        this.getAst = function() {
            if (!this.ast) this.ast = parseCVU(this.doc.getValue());
            return this.ast;
        }
        this.onUpdate = function() {
            var value = this.doc.getValue();
            var {annotations, cvuString, tokens} = validate(value, this.doc);
            this.sender.emit("annotate", annotations);
            
            this.data = {
                cvuString,
                tokens
            };
        };
        this.complete = function(pos, callbackId) {
            var ast = this.getAst();
            var result = getCompletions(ast, pos, this.doc);
            this.sender.callback(result, callbackId);
        };
        this.getData = function(name, callbackId) {
            var result = "";
            if (name == "cvu") {
                result = this.data.cvuString
            } else if (name == "ast") {
                result = this.getAst().toPrettyString()
            } else if (name == "tokens") {
                result = JSON.stringify(this.data.tokens, null, 4)
            }
            this.sender.callback(result, callbackId);
        };
        this.split = function(value, callbackId) {
            try {
                var lexer = new CVULexer(value)
                var tokens = lexer.tokenize()
                let parser = new CVUParser(tokens)
            } catch(e) {
                return this.sender.callback({error: e}, callbackId);
            }
            var ast = parseCVU(value);
            var doc = new Document(value);
            var start = {row: 0, column: 0};
            var parts = []
            for (var i =0; i < ast.length; i++) {
                var astPos = ast[i].getPos()
                var end = {row: astPos.el, column: astPos.ec};
                parts.push(doc.getTextRange({start, end}))
                start = end
            }
            this.sender.callback({parts}, callbackId);
        };
    }).call(MyWorker.prototype);

    exports.MyWorker = MyWorker;
});

window.onmessage({
    data: {
        init : true,
        module: 'ace/worker/my-worker',
        classname : "MyWorker"
    }
});





 