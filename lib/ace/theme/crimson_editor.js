
export const isDark = false;
export const cssText = require("./crimson_editor.css.js");
export const cssClass = "ace-crimson-editor";

import dom from '../lib/dom';
dom.importCssString(exports.cssText, exports.cssClass);
