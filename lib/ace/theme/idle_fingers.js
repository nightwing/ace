

export const isDark = true;
export const cssClass = "ace-idle-fingers";
export const cssText = require("./idle_fingers.css.js");

import dom from '../lib/dom.js';
dom.importCssString(exports.cssText, exports.cssClass);
