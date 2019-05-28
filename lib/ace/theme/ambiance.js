

export const isDark = true;
export const cssClass = "ace-ambiance";
export const cssText = require("./ambiance.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
