

export const isDark = true;
export const cssClass = "ace-terminal-theme";
export const cssText = require("./terminal.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
