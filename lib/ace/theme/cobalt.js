

export const isDark = true;
export const cssClass = "ace-cobalt";
export const cssText = require("./cobalt.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
