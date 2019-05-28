

export const isDark = false;
export const cssClass = "ace-tomorrow";
export const cssText = require("./tomorrow.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
