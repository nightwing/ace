

export const isDark = true;
export const cssClass = "ace-tomorrow-night";
export const cssText = require("./tomorrow_night.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
