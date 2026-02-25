"use strict";
var test = require("../test/run.js")(module.exports);

var EditSession = require("../edit_session").EditSession;
var TextMode = require("./text").Mode;
var assert = require("../test/assertions");


    test.beforeEach(function() {
        this.mode = new TextMode();
    });

    test("toggle comment lines should not do anything", function() {
        var session = new EditSession(["  abc", "cde", "fg"]);

        this.mode.toggleCommentLines("start", session, 0, 1);
        assert.equal(["  abc", "cde", "fg"].join("\n"), session.toString());
    });


    test("lines should be indented", function() {
        assert.equal("   ", this.mode.getNextLineIndent("start", "   abc", "  "));
    });




