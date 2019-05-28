

/**
 * The main class required to set up an Ace instance in the browser.
 *
 * @class Ace
 **/

"use strict";

import './lib/fixoldbrowsers';
import dom from './lib/dom';
import event from './lib/event';
import { Range } from './range';
import { Editor } from './editor';
import { EditSession } from './edit_session';
import { UndoManager } from './undomanager';
import { VirtualRenderer as Renderer } from './virtual_renderer';

// The following require()s are for inclusion in the built ace file
import './worker/worker_client';

import './keyboard/hash_handler';
import './placeholder';
import './multi_select';
import './mode/folding/fold_mode';
import './theme/textmate';
import './ext/error_marker';

export const config = require("./config");

if (typeof define === "function")
    exports.define = define;

/**
 * Embeds the Ace editor into the DOM, at the element provided by `el`.
 * @param {String | DOMElement} el Either the id of an element, or the element itself
 * @param {Object } options Options for the editor
 *
 **/
export const edit = function(el, options) {
    if (typeof el == "string") {
        var _id = el;
        el = document.getElementById(_id);
        if (!el)
            throw new Error("ace.edit can't find div #" + _id);
    }

    if (el && el.env && el.env.editor instanceof Editor)
        return el.env.editor;

    var value = "";
    if (el && /input|textarea/i.test(el.tagName)) {
        var oldNode = el;
        value = oldNode.value;
        el = dom.createElement("pre");
        oldNode.parentNode.replaceChild(el, oldNode);
    } else if (el) {
        value = el.textContent;
        el.innerHTML = "";
    }

    var doc = createEditSession(value);

    var editor = new Editor(new Renderer(el), doc, options);

    var env = {
        document: doc,
        editor: editor,
        onResize: editor.resize.bind(editor, null)
    };
    if (oldNode) env.textarea = oldNode;
    event.addListener(window, "resize", env.onResize);
    editor.on("destroy", function() {
        event.removeListener(window, "resize", env.onResize);
        env.editor.container.env = null; // prevent memory leak on old ie
    });
    editor.container.env = editor.env = env;
    return editor;
};

/**
 * Creates a new [[EditSession]], and returns the associated [[Document]].
 * @param {Document | String} text {:textParam}
 * @param {TextMode} mode {:modeParam}
 *
 **/
export const createEditSession = function(text, mode) {
    var doc = new EditSession(text, mode);
    doc.setUndoManager(new UndoManager());
    return doc;
};

export { require, Range, Editor, EditSession, UndoManager };
export const VirtualRenderer = Renderer;
export const version = exports.config.version;
