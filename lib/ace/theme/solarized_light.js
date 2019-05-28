

export const isDark = false;
export const cssClass = "ace-solarized-light";
export const cssText = require("./solarized_light.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
