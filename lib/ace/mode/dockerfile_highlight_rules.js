
"use strict";

import oop from '../lib/oop.js';
import { ShHighlightRules } from './sh_highlight_rules.js';

var DockerfileHighlightRules = function() {
    ShHighlightRules.call(this);

    var startRules = this.$rules.start;
    for (var i = 0; i < startRules.length; i++) {
        if (startRules[i].token == "variable.language") {
            startRules.splice(i, 0, {
                token: "constant.language",
                regex: "(?:^(?:FROM|MAINTAINER|RUN|CMD|EXPOSE|ENV|ADD|ENTRYPOINT|VOLUME|USER|WORKDIR|ONBUILD|COPY|LABEL)\\b)",
                caseInsensitive: true
            });
            break;
        }
    }
    
};

oop.inherits(DockerfileHighlightRules, ShHighlightRules);

export { DockerfileHighlightRules };
