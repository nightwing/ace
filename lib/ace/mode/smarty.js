
  "use strict";

  import oop from '../lib/oop.js';
  import { Mode as HtmlMode } from './html.js';
  import { SmartyHighlightRules } from './smarty_highlight_rules.js';

  var Mode = function() {
      HtmlMode.call(this);
      this.HighlightRules = SmartyHighlightRules;
  };

  oop.inherits(Mode, HtmlMode);

  (function() {
      
      this.$id = "ace/mode/smarty";
  }).call(Mode.prototype);

  export { Mode };
