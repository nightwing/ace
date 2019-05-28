

export const isDark = true;
export const cssClass = "ace-pastel-on-dark";
export const cssText = require("./pastel_on_dark.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
