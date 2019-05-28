
"use strict";

export const isDark = false;
export const cssText = require("./eclipse.css.js");
export const cssClass = "ace-eclipse";

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
