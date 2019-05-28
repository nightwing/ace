

export const isDark = true;
export const cssClass = "ace-twilight";
export const cssText = require("./twilight.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
