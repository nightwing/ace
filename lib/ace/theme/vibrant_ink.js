

export const isDark = true;
export const cssClass = "ace-vibrant-ink";
export const cssText = require("./vibrant_ink.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
