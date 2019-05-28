

export const isDark = true;
export const cssClass = "ace-tomorrow-night-eighties";
export const cssText = require("./tomorrow_night_eighties.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
