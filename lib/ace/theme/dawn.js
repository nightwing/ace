

export const isDark = false;
export const cssClass = "ace-dawn";
export const cssText = require("./dawn.css.js");

import dom from '../lib/dom';
dom.importCssString(exports.cssText, exports.cssClass);
