

export const isDark = true;
export const cssClass = "ace-kr-theme";
export const cssText = require("./kr_theme.css.js");

import dom from '../lib/dom';
dom.importCssString(exports.cssText, exports.cssClass);
