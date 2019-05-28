
"use strict";

import oop from '../../lib/oop.js';
import { FoldMode as MixedFoldMode } from './mixed.js';
import { FoldMode as XmlFoldMode } from './xml.js';
import { FoldMode as CStyleFoldMode } from './cstyle.js';

var FoldMode = exports.FoldMode = function(voidElements, optionalTags) {
    MixedFoldMode.call(this, new XmlFoldMode(voidElements, optionalTags), {
        "js-": new CStyleFoldMode(),
        "css-": new CStyleFoldMode()
    });
};

oop.inherits(FoldMode, MixedFoldMode);
