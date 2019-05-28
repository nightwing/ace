

import oop from '../lib/oop.js';
import { Mode as TextMode } from '../mode/text.js';
import { MysqlHighlightRules } from './mysql_highlight_rules.js';

var Mode = function() {
    this.HighlightRules = MysqlHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {       
    this.lineCommentStart = ["--", "#"]; // todo space
    this.blockComment = {start: "/*", end: "*/"};

    this.$id = "ace/mode/mysql";
}).call(Mode.prototype);

export { Mode };
