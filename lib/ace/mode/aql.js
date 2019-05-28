
  "use strict";

  import oop from '../lib/oop';
  import { Mode as TextMode } from './text';
  import { AqlHighlightRules } from './aql_highlight_rules';

  var Mode = function() {
      this.HighlightRules = AqlHighlightRules;
      this.$behaviour = this.$defaultBehaviour;
  };
  oop.inherits(Mode, TextMode);

  (function() {

      this.lineCommentStart = "//";

      this.$id = "ace/mode/aql";
  }).call(Mode.prototype);

  export { Mode };
