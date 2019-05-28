

if (typeof process !== "undefined") {
    }
"use strict";

import { EditSession } from '../edit_session';
import { Mode as TextMode } from './text';
import assert from '../test/assertions';

export default {
    setUp : function() {
        this.mode = new TextMode();
    },

    "test: toggle comment lines should not do anything" : function() {
        var session = new EditSession(["  abc", "cde", "fg"]);

        this.mode.toggleCommentLines("start", session, 0, 1);
        assert.equal(["  abc", "cde", "fg"].join("\n"), session.toString());
    },


    "test: lines should be indented" : function() {
        assert.equal("   ", this.mode.getNextLineIndent("start", "   abc", "  "));
    }
};

if (typeof module !== "undefined" && module === require.main) {
    require("asyncjs").test.testcase(module.exports).exec();
}
