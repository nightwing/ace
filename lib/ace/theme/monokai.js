

export const isDark = true;
export const cssClass = "ace-monokai";
export const cssText = require("./monokai.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
