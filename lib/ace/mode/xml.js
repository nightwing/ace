
"use strict";

import oop from '../lib/oop.js';
import lang from '../lib/lang.js';
import { Mode as TextMode } from './text.js';
import { XmlHighlightRules } from './xml_highlight_rules.js';
import { XmlBehaviour } from './behaviour/xml.js';
import { FoldMode as XmlFoldMode } from './folding/xml.js';
import { WorkerClient } from '../worker/worker_client.js';

var Mode = function() {
   this.HighlightRules = XmlHighlightRules;
   this.$behaviour = new XmlBehaviour();
   this.foldingRules = new XmlFoldMode();
};

oop.inherits(Mode, TextMode);

(function() {

    this.voidElements = lang.arrayToMap([]);

    this.blockComment = {start: "<!--", end: "-->"};

    this.createWorker = function(session) {
        var worker = new WorkerClient(["ace"], "ace/mode/xml_worker", "Worker");
        worker.attachToDocument(session.getDocument());

        worker.on("error", function(e) {
            session.setAnnotations(e.data);
        });

        worker.on("terminate", function() {
            session.clearAnnotations();
        });

        return worker;
    };
    
    this.$id = "ace/mode/xml";
}).call(Mode.prototype);

export { Mode };
