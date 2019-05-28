

export const isDark = false;
export const cssClass = "ace-kuroir";
export const cssText = require("./kuroir.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
