

export const isDark = true;
export const cssClass = "ace-merbivore";
export const cssText = require("./merbivore.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
