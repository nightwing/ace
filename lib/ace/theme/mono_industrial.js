

export const isDark = true;
export const cssClass = "ace-mono-industrial";
export const cssText = require("./mono_industrial.css.js");

import dom from '../lib/dom';
dom.importCssString(exports.cssText, exports.cssClass);
