"use strict";
var test = require("../test/run.js")(module.exports);

var EditSession = require("../edit_session").EditSession;
var AdaMode = require("./ada").Mode;
var assert = require("../test/assertions");


    test.beforeEach(function() {
        this.mode = new AdaMode();
    });

    test("auto outdent after 'begin' and 'end'", function() {
        assert.ok(this.mode.checkOutdent("start", "        begi", "n"));
        assert.ok(this.mode.checkOutdent("start", "        en", "d"));
    });

    test("auto outdent", function() {
        var session = new EditSession([
            "procedure Pouet is",
            "    begin"
        ]);
        this.mode.autoOutdent("start", session, 1);
        assert.equal("begin", session.getLine(1));
    });




