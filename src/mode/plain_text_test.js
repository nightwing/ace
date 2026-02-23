"use strict";
var test = require("../test/run.js")(module.exports);

var EditSession = require("../edit_session").EditSession;
var PlainTextMode = require("./plain_text").Mode;
var assert = require("../test/assertions");


    test.beforeEach(function() {
        this.mode = new PlainTextMode();
    });

    test("lines should not be indented", function() {
        assert.equal("", this.mode.getNextLineIndent("start", "   abc", "  "));
    });




