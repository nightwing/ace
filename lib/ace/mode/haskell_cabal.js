
/**
* Haskell Cabal files mode (https://www.haskell.org/cabal/users-guide/developing-packages.html)
**/

"use strict";

import oop from '../lib/oop';
import { Mode as TextMode } from './text';
import { CabalHighlightRules } from './haskell_cabal_highlight_rules';
import { FoldMode } from './folding/haskell_cabal';

var Mode = function() {
    this.HighlightRules = CabalHighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "--";
    this.blockComment = null;
    this.$id = "ace/mode/haskell_cabal";
}).call(Mode.prototype);

export { Mode };
