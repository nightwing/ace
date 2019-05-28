

export const isDark = false;
export const cssClass = "ace-sqlserver";
export const cssText = require("./sqlserver.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
