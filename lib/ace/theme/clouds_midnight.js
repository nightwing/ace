

export const isDark = true;
export const cssClass = "ace-clouds-midnight";
export const cssText = require("./clouds_midnight.css.js");

import dom from '../lib/dom';
dom.importCssString(exports.cssText, exports.cssClass);
