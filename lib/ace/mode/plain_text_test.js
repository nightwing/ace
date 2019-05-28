

if (typeof process !== "undefined") {
    }
"use strict";

import { EditSession } from '../edit_session';
import { Mode as PlainTextMode } from './plain_text';
import assert from '../test/assertions';

export default {
    setUp : function() {
        this.mode = new PlainTextMode();
    },

    "test: lines should not be indented" : function() {
        assert.equal("", this.mode.getNextLineIndent("start", "   abc", "  "));
    }
};

if (typeof module !== "undefined" && module === require.main) {
    require("asyncjs").test.testcase(module.exports).exec();
}
