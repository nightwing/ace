

if (typeof process !== "undefined") {
    }
"use strict";

import { EditSession } from './../edit_session';
import { Editor } from './../editor';
import { MockRenderer } from './../test/mockrenderer';
import assert from './../test/assertions';
import { HashHandler } from './hash_handler';
import keys from '../lib/keys';

var editor;

function initEditor(docString) {
    var doc = new EditSession(docString.split("\n"));
    editor = new Editor(new MockRenderer(), doc);
}

export default {

    "test: adding a new keyboard handler does not remove the default handler": function() {
        initEditor('abc');
        var handler = new HashHandler({'del': 'f1'});
        editor.keyBinding.setKeyboardHandler(handler);
        editor.onCommandKey({}, 0, keys['f1']);
        assert.equal('bc', editor.getValue(), "binding of new handler");
        editor.onCommandKey({}, 0, keys['delete']);
        assert.equal('c', editor.getValue(), "bindings of the old handler should still work");
    }

};

if (typeof module !== "undefined" && module === require.main) {
    require("asyncjs").test.testcase(module.exports).exec();
}
