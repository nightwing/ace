
"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { CssHighlightRules } from './css_highlight_rules';
import { MatchingBraceOutdent } from './matching_brace_outdent';
import { WorkerClient } from '../worker/worker_client';
import { CssCompletions } from './css_completions';
import { CssBehaviour } from './behaviour/css';
import { FoldMode as CStyleFoldMode } from './folding/cstyle';

var Mode = function() {
    this.HighlightRules = CssHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CssBehaviour();
    this.$completer = new CssCompletions();
    this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.foldingRules = "cStyle";
    this.blockComment = {start: "/*", end: "*/"};

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        // ignore braces in comments
        var tokens = this.getTokenizer().getLineTokens(line, state).tokens;
        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        var match = line.match(/^.*\{\s*$/);
        if (match) {
            indent += tab;
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    this.getCompletions = function(state, session, pos, prefix) {
        return this.$completer.getCompletions(state, session, pos, prefix);
    };

    this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], "ace/mode/css_worker", "Worker");
        worker.attachToDocument(session.getDocument());

        worker.on("annotate", function(e) {
            session.setAnnotations(e.data);
        });

        worker.on("terminate", function() {
            session.clearAnnotations();
        });

        return worker;
    };

    this.$id = "ace/mode/css";
}).call(Mode.prototype);

export { Mode };
