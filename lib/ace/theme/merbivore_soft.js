

export const isDark = true;
export const cssClass = "ace-merbivore-soft";
export const cssText = require("./merbivore_soft.css.js");

import dom from '../lib/dom';
dom.importCssString(exports.cssText, exports.cssClass);
