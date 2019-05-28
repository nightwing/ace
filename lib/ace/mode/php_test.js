

if (typeof process !== "undefined") {
    }
"use strict";

import { EditSession } from '../edit_session.js';
import { Tokenizer } from '../tokenizer.js';
import { Mode } from './php.js';
import assert from '../test/assertions.js';

export default {
    "test: inline mode" : function() {
        var mode = new Mode();
        var tokenizer = mode.getTokenizer();
        var tokens = tokenizer.getLineTokens("'juhu kinners' ?> html  <? 'php'", "start").tokens;
        assert.equal("string", tokens[tokens.length - 1].type);
        assert.notEqual("string", tokens[0].type);
        assert.equal(tokens.length, 4);
        
        mode = new Mode({inline: true});
        tokenizer = mode.getTokenizer();
        tokens = tokenizer.getLineTokens("'juhu kinners' ?> html  <? 'php'", "start").tokens;
        assert.equal("string", tokens[0].type);
        assert.equal("string", tokens[tokens.length - 1].type);
        assert.equal(tokens.length, 9);
    }
};

if (typeof module !== "undefined" && module === require.main) {
    require("asyncjs").test.testcase(module.exports).exec();
}
