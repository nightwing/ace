

export const isDark = true;
export const cssClass = "ace-gob";
export const cssText = require("./gob.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
