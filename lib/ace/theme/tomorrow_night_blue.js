

export const isDark = true;
export const cssClass = "ace-tomorrow-night-blue";
export const cssText = require("./tomorrow_night_blue.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
