

export const isDark = false;
export const cssClass = "ace-chrome";
export const cssText = require("./chrome.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
