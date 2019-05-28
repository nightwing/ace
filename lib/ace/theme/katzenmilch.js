

export const isDark = false;
export const cssClass = "ace-katzenmilch";
export const cssText = require("./katzenmilch.css.js");

import dom from '../lib/dom';
dom.importCssString(exports.cssText, exports.cssClass);
