
"use strict";

import oop from '../../lib/oop';
import { FoldMode as MixedFoldMode } from './mixed';
import { FoldMode as XmlFoldMode } from './xml';
import { FoldMode as CStyleFoldMode } from './cstyle';

var FoldMode = exports.FoldMode = function(voidElements, optionalTags) {
    MixedFoldMode.call(this, new XmlFoldMode(voidElements, optionalTags), {
        "js-": new CStyleFoldMode(),
        "css-": new CStyleFoldMode()
    });
};

oop.inherits(FoldMode, MixedFoldMode);
