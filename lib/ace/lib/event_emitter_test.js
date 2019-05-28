

if (typeof process !== "undefined") {
    }
"use strict";

import oop from '../lib/oop.js';
import { EventEmitter } from './event_emitter.js';
import assert from '../test/assertions.js';

var Emitter = function() {};

oop.implement(Emitter.prototype, EventEmitter);

export default {
    "test: dispatch event with no data" : function() {
        var emitter = new Emitter();

        var called = false;
        emitter.addEventListener("juhu", function(e) {
           called = true;
           assert.equal(e.type, "juhu");
        });

        emitter._emit("juhu");
        assert.ok(called);
    }
};

if (typeof module !== "undefined" && module === require.main) {
    require("asyncjs").test.testcase(module.exports).exec();
}
