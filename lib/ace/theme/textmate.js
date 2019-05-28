
"use strict";

export const isDark = false;
export const cssClass = "ace-tm";
export const cssText = require("./textmate.css.js");
export const $id = "ace/theme/textmate";

import dom from '../lib/dom';
dom.importCssString(exports.cssText, exports.cssClass);
