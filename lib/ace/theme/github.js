

export const isDark = false;
export const cssClass = "ace-github";
export const cssText = require("./github.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
