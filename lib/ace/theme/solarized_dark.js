

export const isDark = true;
export const cssClass = "ace-solarized-dark";
export const cssText = require("./solarized_dark.css.js");

import dom from '../lib/dom';
dom.importCssString(exports.cssText, exports.cssClass);
