
  "use strict";

  import oop from '../lib/oop';
  import { Mode as HtmlMode } from './html';
  import { SmartyHighlightRules } from './smarty_highlight_rules';

  var Mode = function() {
      HtmlMode.call(this);
      this.HighlightRules = SmartyHighlightRules;
  };

  oop.inherits(Mode, HtmlMode);

  (function() {
      
      this.$id = "ace/mode/smarty";
  }).call(Mode.prototype);

  export { Mode };
