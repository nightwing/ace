"use strict";
var test = require("../test/run.js")(module.exports);

var oop = require("../lib/oop");
var EventEmitter = require("./event_emitter").EventEmitter;
var assert = require("../test/assertions");

var Emitter = function() {};

oop.implement(Emitter.prototype, EventEmitter);


    test("dispatch event with no data", function() {
        var emitter = new Emitter();

        var called = false;
        emitter.addEventListener("juhu", function(e) {
           called = true;
           assert.equal(e.type, "juhu");
        });

        emitter._emit("juhu");
        assert.ok(called);
    });




