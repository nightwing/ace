

export const isDark = true;
export const cssClass = "ace-dracula";
export const cssText = require("./dracula.css.js");
export const $selectionColorConflict = true;

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
