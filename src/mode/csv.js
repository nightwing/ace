"use strict";

const { get } = require("../config");
var oop = require("../lib/oop");
var TextMode = require("./text").Mode;

var Mode = function(options) {
};
oop.inherits(Mode, TextMode);

(function() {
    this.getTokenizer = function() {
        if (!this.$tokenizer) {
            this.$tokenizer = {
                getLineTokens: function(line, state, row) {
                    return tokenezeCsv(line, state, this.options);
                },
            };
            this.$tokenizer.options = {
                separatorRegex: /(,|")/,
                spliter: ","
            };
        }
        return this.$tokenizer;
    };

    this.$id = "ace/mode/csv";
}).call(Mode.prototype);

exports.Mode = Mode;


var classNames = ["keyword", "text", "string", "string.regex", "variable", "constant.numeric"];

function tokenezeCsv(line, state, options) {
    var result = []
    var parts = line.split(options.separatorRegex)
    var spliter = options.spliter;
    var quote = options.quote || '"';
    var stateParts = (state||"start").split("-")
    var column = parseInt(stateParts[1]) || 0;
    var inString = stateParts[0] == 'string';
    var atColumnStart = !inString;
    for (var i = 0; i < parts.length; i++) {
        var value = parts[i];
        if (value) {
            if (value == spliter && !inString) {
                column++;
                atColumnStart = true;
            } 
            else if (value == quote) {
                if (atColumnStart) {
                    inString = true;
                    atColumnStart = false;
                } else if (inString) {
                    if (parts[i + 1] == '' && parts[i + 2] == quote) {
                        value = quote + quote;
                        i += 2;
                    } else {
                        inString = false;
                    }
                }
            }
            else {
                atColumnStart = false;
            }

            result.push(
                {
                    value: value,
                    type: classNames[column % classNames.length] + ".csv_" + column
                }
            )
        }
    }
    return { tokens: result, state: inString ? "string-" + column : "start" };

}