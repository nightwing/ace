
export const isDark = false;
export const cssClass = "ace-dreamweaver";
export const cssText = require("./dreamweaver.css.js");

import dom from '../lib/dom';
dom.importCssString(exports.cssText, exports.cssClass);
