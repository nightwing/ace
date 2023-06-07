"use strict";

var oop = require("ace-code/src/lib/oop");
var event = require("ace-code/src/lib/event");
var Range = require("ace-code/src/range").Range;
var dom = require("ace-code/src/lib/dom");
var config = require("ace-code/src/config");

var LineWidgets = require("ace-code/src/line_widgets").LineWidgets;
var css = require("text!./styles.css");
var computeDiff = require("./vscode-diff/bundle.vscode_diff").computeDiff;

var Editor = require("ace-code/src/editor").Editor;
var Renderer = require("ace-code/src/virtual_renderer").VirtualRenderer;
var UndoManager = require("ace-code/src/undomanager").UndoManager;
require("ace-code/src/theme/textmate");
// enable multiselect
require("ace-code/src/multi_select");

function createEditor() {
    var editor = new Editor(new Renderer(), null, {
        customScrollbar: true,
        vScrollBarAlwaysVisible: true
    });
    editor.session.setUndoManager(new UndoManager());
    editor.renderer.setOption("decoratorType", "diff");
    return editor;
}

/**
 * @typedef {{old: Range, new: Range, charChanges?: Array<{old: Range, new: Range}>}} AceDiff
 */

class DiffView {
    constructor(element, options) {
        this.onInput = this.onInput.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onChangeFold = this.onChangeFold.bind(this);
        this.onChangeTheme = this.onChangeTheme.bind(this);
        this.onSelect = this.onSelect.bind(this);

        dom.importCssString(css, "diffview.css");
        this.options = {
            ignoreTrimWhitespace: options.ignoreTrimWhitespace || true,
            maxComputationTimeMs: options.maxComputationTimeMs || 0 // time in milliseconds, 0 => no computation limit.
        };
        this.container = element;
        
        oop.mixin(this.options, {
            showDiffs: true,
            maxDiffs: 5000
        }, options);

        this.orig = this.left = createEditor();
        this.edit = this.right = createEditor();

        element.appendChild(this.left.container);
        element.appendChild(this.right.container);

        this.left.setOption("scrollPastEnd", 0.5);
        this.right.setOption("scrollPastEnd", 0.5);
        this.left.setOption("highlightActiveLine", false);
        this.right.setOption("highlightActiveLine", false);
        this.left.setOption("highlightGutterLine", false);
        this.right.setOption("highlightGutterLine", false);
        this.left.setOption("animatedScroll", true);
        this.right.setOption("animatedScroll", true);

        this.markerLeft = new DiffHighlight(this, -1);
        this.markerRight = new DiffHighlight(this, 1);
        this.syncSelectionMarkerLeft = new SyncSelectionMarker();
        this.syncSelectionMarkerRight = new SyncSelectionMarker();
        this.setSession({
            orig: this.orig.session,
            edit: this.edit.session,
            chunks: []
        });
        this.onChangeTheme();

        this.$attachEventHandlers();

        config.resetOptions(this);
        config._signal("diffView", this);
    }

    /**
     * @type AceDiff[]
     */
    chunks;

    /*** theme/session ***/
    setSession(session) {
        if (this.session) {
            this.$detachSessionEventHandlers();
        }
        this.session = session;
        if (this.session) {
            this.chunks = this.session.chunks;
            this.orig.setSession(session.orig);
            this.edit.setSession(session.edit);
            this.$attachSessionEventHandlers();
        }
    }

    getSession() {
        return this.session;
    }
    
    setTheme(theme) {
        this.left.setTheme(theme);
    }

    getTheme() {
        return this.left.getTheme();
    }

    onChangeTheme() {
        this.right.setTheme(this.left.getTheme());
        var theme = this.right.renderer.theme;
    }

    resize() {
        this.edit.resize();
        this.orig.resize();
    }

    onInput() {
        var val1 = this.left.session.doc.getAllLines();
        var val2 = this.right.session.doc.getAllLines();

        var chunks = this.$diffLines(val1, val2);

        this.session.chunks = this.chunks = chunks;
        // if we"re dealing with too many chunks, fail silently
        if (this.chunks.length > this.options.maxDiffs) {
            return;
        }

        if (this.$alignDiffs) this.align();

        this.left.renderer.updateBackMarkers();
        this.right.renderer.updateBackMarkers();
    }

    $diffLines(val1, val2) {
        var chunks = computeDiff(val1, val2, {
            ignoreTrimWhitespace: this.options.ignoreTrimWhitespace,
            maxComputationTimeMs: this.options.maxComputationTimeMs
        });
        if (chunks.changes) {
            return chunks.changes.map((changes) => {
                let originalStartLineNumber = changes.originalRange.startLineNumber - 1;
                let originalEndLineNumber = changes.originalRange.endLineNumberExclusive - 1;
                let modifiedStartLineNumber = changes.modifiedRange.startLineNumber - 1;
                let modifiedEndLineNumber = changes.modifiedRange.endLineNumberExclusive - 1;
                return {
                    old: new Range(originalStartLineNumber, 0, originalEndLineNumber, 0),
                    new: new Range(modifiedStartLineNumber, 0, modifiedEndLineNumber, 0),
                    charChanges: changes.innerChanges && changes.innerChanges.map(m => ({
                        old: new Range(
                            m.originalRange.startLineNumber - 1, m.originalRange.startColumn - 1,
                            m.originalRange.endLineNumber - 1, m.originalRange.endColumn - 1
                        ),
                        new: new Range(m.modifiedRange.startLineNumber - 1, m.modifiedRange.startColumn - 1,
                            m.modifiedRange.endLineNumber - 1, m.modifiedRange.endColumn - 1
                        )
                    }))
                };
            });
        }
    }

    /*** scroll locking ***/
    align() {
        var diffView = this;

        function add(editor, w) {
            editor.session.lineWidgets[w.row] = w;
            editor.session.widgetManager.lineWidgets[w.row] = w;
        }

        function init(editor) {
            var session = editor.session;
            if (!session.widgetManager) {
                session.widgetManager = new LineWidgets(session);
                session.widgetManager.attach(editor);
            }
            editor.session.lineWidgets = [];
            editor.session.widgetManager.lineWidgets = [];
        }

        init(diffView.edit);
        init(diffView.orig);
        diffView.chunks.forEach(function (ch) {
            var diff1 = ch.old.end.row - ch.old.start.row;
            var diff2 = ch.new.end.row - ch.new.start.row;
            if (diff1 < diff2) {
                add(diffView.orig, {
                    rowCount: diff2 - diff1,
                    row: ch.old.end.row === 0 ? 0 : ch.old.end.row - 1
                });
            }
            else if (diff1 > diff2) {
                add(diffView.edit, {
                    rowCount: diff1 - diff2,
                    row: ch.new.end.row === 0 ? 0 : ch.new.end.row - 1
                });
            }
        });
        diffView.edit.session._emit("changeFold", {data: {start: {row: 0}}});
        diffView.orig.session._emit("changeFold", {data: {start: {row: 0}}});
    }

    onSelect(e, selection) {
        console.log("selection");
        this.syncSelect(selection);
    }

    syncSelect(selection) {
        var now = Date.now();
        var left = this.left.session;
        var right = this.right.session;
        var isOrig = selection.session == left;
        
        if (this.selectionSetBy != selection.session && now - this.selectionSetAt < 500) return;
        let selectionRange = selection.getRange();
        let newRange = this.transformRange(selectionRange, isOrig);
        if (isOrig) {
            this.updateSelectionMarker(this.syncSelectionMarkerLeft, left, selectionRange);
            this.updateSelectionMarker(this.syncSelectionMarkerRight, right, newRange);
            right.selection.setSelectionRange(newRange);
            this.selectionSetBy = left;
        }
        else {
            this.updateSelectionMarker(this.syncSelectionMarkerLeft, left, newRange);
            this.updateSelectionMarker(this.syncSelectionMarkerRight, right, selectionRange);
            this.selectionSetBy = right;
        }

        this.selectionSetAt = now;
    }

    updateSelectionMarker(marker, session, range) {
        marker.setRange(range);
        session.removeMarker(marker.id);
        session.addDynamicMarker(marker);
    }

    onScroll(e, session) {
        this.syncScroll(this.left.session === session ? this.left.renderer : this.right.renderer);
    }

    syncScroll(renderer) {
        if (this.$syncScroll == false) return;

        var r1 = this.left.renderer;
        var r2 = this.right.renderer;
        var isOrig = renderer == r1;
        if (r1.$scrollAnimation && r2.$scrollAnimation) return;

        var now = Date.now();
        if (this.scrollSetBy != renderer && now - this.scrollSetAt < 500) return;

        var r = isOrig ? r1 : r2;
        if (this.scrollSetBy != renderer) {
            if (isOrig && this.scrollOrig == r.session.getScrollTop()) return; else if (!isOrig && this.scrollEdit
                == r.session.getScrollTop()) return;
        }
        var rOther = isOrig ? r2 : r1;

        if (this.$alignDiffs) {
            targetPos = r.session.getScrollTop();
        }
        else {
            var layerConfig = r.layerConfig;
            var chunks = this.chunks;
            var halfScreen = 0.4 * r.$size.scrollerHeight;

            var lc = layerConfig;
            var midY = halfScreen + r.scrollTop;
            var mid = r.session.screenToDocumentRow(midY / lc.lineHeight, 0);

            var i = findChunkIndex(chunks, mid, isOrig);
            /**
             * 
             * @type {AceDiff}
             */
            var ch = chunks[i];

            if (!ch) {
                ch = {
                    old: new Range(0,0,0,0),
                    new: new Range(0,0,0,0)
                };
            }
            if (mid >= (isOrig ? ch.old.end.row : ch.new.end.row)) {
                var next = chunks[i + 1] || {
                    old: new Range(r1.session.getLength(), 0, r1.session.getLength(), 0),
                    new: new Range(r2.session.getLength(), 0, r2.session.getLength(), 0)
                };
                ch = {
                    old: new Range(ch.old.end.row, 0, next.old.start.row, 0),
                    new: new Range(ch.new.end.row, 0, next.new.start.row, 0)
                };
            }
            if (r == r1) {
                var start = ch.old.start.row;
                var end = ch.old.end.row;
                var otherStart = ch.new.start.row;
                var otherEnd = ch.new.end.row;
            }
            else {
                otherStart = ch.old.start.row;
                otherEnd = ch.old.end.row;
                start = ch.new.start.row;
                end = ch.new.end.row;
            }

            var offOtherTop = rOther.session.documentToScreenRow(otherStart, 0) * lc.lineHeight;
            var offOtherBot = rOther.session.documentToScreenRow(otherEnd, 0) * lc.lineHeight;

            var offTop = r.session.documentToScreenRow(start, 0) * lc.lineHeight;
            var offBot = r.session.documentToScreenRow(end, 0) * lc.lineHeight;

            var ratio = (midY - offTop) / (offBot - offTop || offOtherBot - offOtherTop);
            var targetPos = offOtherTop - halfScreen + ratio * (offOtherBot - offOtherTop);
            targetPos = Math.max(0, targetPos);
        }

        this.$syncScroll = false;

        if (isOrig) {
            this.scrollOrig = r.session.getScrollTop();
            this.scrollEdit = targetPos;
        }
        else {
            this.scrollOrig = targetPos;
            this.scrollEdit = r.session.getScrollTop();
        }
        this.scrollSetBy = renderer;
        rOther.session.setScrollTop(targetPos);
        this.$syncScroll = true;
        this.scrollSetAt = now;
    }

    onMouseWheel(ev) {
        if (ev.getAccelKey()) return;
        if (ev.getShiftKey() && ev.wheelY && !ev.wheelX) {
            ev.wheelX = ev.wheelY;
            ev.wheelY = 0;
        }

        var editor = ev.editor;
        var isScrolable = editor.renderer.isScrollableBy(ev.wheelX * ev.speed, ev.wheelY * ev.speed);
        if (!isScrolable) {
            var other = editor == this.left ? this.right : this.left;
            if (other.renderer.isScrollableBy(ev.wheelX * ev.speed, ev.wheelY * ev.speed)) other.renderer.scrollBy(
                ev.wheelX * ev.speed, ev.wheelY * ev.speed);
            return ev.stop();
        }
    }

    onChangeFold(ev, session) {
        if (ev.action == "remove") {
            var other = session == this.orig.session ? this.edit.session : this.orig.session;
            var fold = ev.data;
            if (fold && fold.other) {
                fold.other.other = null;
                other.removeFold(fold.other);
            }
        }
    }

    $attachSessionEventHandlers() {
        this.left.session.on("changeScrollTop", this.onScroll);
        this.right.session.on("changeScrollTop", this.onScroll);
        this.left.session.on("changeFold", this.onChangeFold);
        this.right.session.on("changeFold", this.onChangeFold);
        this.left.session.addDynamicMarker(this.markerLeft);
        this.right.session.addDynamicMarker(this.markerRight);
        this.left.selection.on("changeSelection", this.onSelect);
        this.right.selection.on("changeSelection", this.onSelect);
    }

    $detachSessionEventHandlers() {
        this.left.session.off("changeScrollTop", this.onScroll);
        this.right.session.off("changeScrollTop", this.onScroll);
        this.left.session.off("changeFold", this.onChangeFold);
        this.right.session.off("changeFold", this.onChangeFold);
        this.left.session.removeMarker(this.markerLeft.id);
        this.right.session.removeMarker(this.markerRight.id);
    }

    $attachEventHandlers() {
        this.left.renderer.on("themeLoaded", this.onChangeTheme);

        this.left.on("mousewheel", this.onMouseWheel);
        this.right.on("mousewheel", this.onMouseWheel);

        this.left.on("input", this.onInput);
        this.right.on("input", this.onInput);
    }

    /*** other ***/
    destroy() {
        this.left.destroy();
        this.right.destroy();
    }

    gotoNext(dir) {
        var orig = false;
        var ace = orig ? this.orig : this.edit;
        var row = ace.selection.lead.row;
        var i = findChunkIndex(this.chunks, row, orig);
        var chunk = this.chunks[i + dir] || this.chunks[i];

        var scrollTop = ace.session.getScrollTop();
        if (chunk) {
            var line = Math.max(chunk.new.start.row, chunk.new.end.row - 1);
            ace.selection.setRange(new Range(line, 0, line, 0));
        }
        ace.renderer.scrollSelectionIntoView(ace.selection.lead, ace.selection.anchor, 0.5);
        ace.renderer.animateScrolling(scrollTop);
    }

    transformRange(range, orig) {
        return Range.fromPoints(this.transformPosition(range.start, orig), this.transformPosition(range.end, orig));
    }

    transformPosition(pos, isOrig) {
        var chunkIndex = findChunkIndex(this.chunks, pos.row, isOrig);
        var chunk = this.chunks[chunkIndex];

        var result = {
            row: pos.row,
            column: pos.column
        };
        if (isOrig) { //TODO: calculate line widgets
            if (chunk.old.end.row <= pos.row) {
                result.row = pos.row - chunk.old.end.row + chunk.new.end.row;
                result.column = pos.column - this.$getDeltaIndent(pos.row, result.row);
            }
            else {
                var deltaLine = pos.row - chunk.old.start.row;
                result.row = deltaLine + chunk.new.start.row;
                let deltaChar = this.$getDeltaIndent(pos.row, result.row);

                if (chunk.charChanges) {
                    for (let i = 0; i < chunk.charChanges.length; i++) {
                        let change = chunk.charChanges[i];
                        /*if (change.modifiedStartLineNumber != change.modifiedEndLineNumber)
                            continue;*/
                        if (isCharChangeOrDelete(change)) {
                            if (change.old.start.row == pos.row) {
                                if (pos.column > change.old.start.column && pos.column < change.old.end.column) {
                                    result.column = change.new.start.column;
                                    return result;
                                }
                                else if (pos.column >= change.old.end.column) {
                                    deltaChar += change.old.end.column - change.old.start.column
                                        - (change.new.end.column - change.new.start.column);
                                }
                            } 
                        }
                        
                    }
                }
                result.column = result.column - deltaChar;
            }
        }
        else {
            if (chunk.new.end.row <= pos.row) {
                result.row = pos.row - chunk.new.end.row + chunk.old.end.row;
            }
            else {
                var deltaLine = pos.row - chunk.new.start.row;
                result.row = deltaLine + chunk.old.start.row;
            }
        }

        return result;
    }
    
    $getDeltaIndent(origLine, editLine) {
        let origIndent = this.left.session.getLine(origLine).match(/^\s*/)[0].length;
        let editIndent = this.right.session.getLine(editLine).match(/^\s*/)[0].length;
        return origIndent - editIndent;
    }
}

/*** options ***/
config.defineOptions(DiffView.prototype, "editor", {
    alignDiffs: {
        set: function (val) {
            if (val) this.align();
        },
        initialValue: true
    }
});

/**
 * 
 * @param {AceDiff[]} chunks
 * @param {number} row
 * @param {boolean} orig
 * @return {number}
 */
function findChunkIndex(chunks, row, orig) {
    if (orig) {
        for (var i = 0; i < chunks.length; i++) {
            var ch = chunks[i];
            if (ch.old.end.row < row) continue;
            if (ch.old.start.row > row) break;
        }
    }
    else {
        for (var i = 0; i < chunks.length; i++) {
            var ch = chunks[i];
            if (ch.new.end.row < row) continue;
            if (ch.new.start.row > row) break;
        }
    }
    return i - 1;
}

/**
 * 
 * @param {AceDiff["charChanges"][0]} charChange
 * @return {boolean}
 */
function isCharChangeOrInsert(charChange) {
    if (charChange.new.start.row === charChange.new.end.row) {
        return charChange.new.end.column - charChange.new.start.column > -1;
    }
    return charChange.new.end.row - charChange.new.start.row > -1;
}

/**
 *
 * @param {AceDiff["charChanges"][0]} charChange
 * @return {boolean}
 */
function isCharChangeOrDelete(charChange) {
    if (charChange.old.start.row === charChange.old.end.row) {
        return charChange.old.end.column - charChange.old.start.column > -1;
    }
    return charChange.old.end.row - charChange.old.start.row > -1;
}

class SyncSelectionMarker {
    constructor() {
        this.type = "fullLine";
        this.clazz = "ace_diff selection";
    }

    update(html, markerLayer, session, config) {
    }

    setRange(range) {
        this.range = range;
    }

}

class DiffHighlight {
    /**
     * 
     * @param {DiffView} diffView
     * @param type
     */
    constructor(diffView, type) {
        this.diffView = diffView;
        this.type = type;
    }

    static MAX_RANGES = 500;

    update(html, markerLayer, session, config) {
        if (this.type === -1) {
            this.updateOriginalEditor(html, markerLayer, session, config);
        }
        else {
            this.updateModifiedEditor(html, markerLayer, session, config);
        }
    }

    updateOriginalEditor(html, markerLayer, session, config) {
        var diffView = this.diffView;
        const ignoreTrimWhitespace = diffView.options.ignoreTrimWhitespace;
        var lineChanges = diffView.chunks;
        diffView.left.renderer.$scrollDecorator.zones = [];

        for (const lineChange of lineChanges) {

            if (isChangeOrDelete(lineChange)) {
                let range = new Range(lineChange.old.start.row, 0, lineChange.old.end.row - 1, 1 << 30);
                diffView.left.renderer.$scrollDecorator.addZone(range.start.row, range.end.row, "remove");
                range = range.toScreenRange(session);
                markerLayer.drawFullLineMarker(html, range, "ace_diff " + "delete inline", config);

                if (lineChange.charChanges) {
                    for (const charChange of lineChange.charChanges) {
                        if (isCharChangeOrDelete(charChange)) {
                            if (ignoreTrimWhitespace) {
                                for (let lineNumber = charChange.old.start.row; lineNumber
                                <= charChange.old.end.row; lineNumber++) {
                                    let startColumn;
                                    let endColumn;
                                    if (lineNumber === charChange.old.start.row) {
                                        startColumn = charChange.old.start.column;
                                    }
                                    else {
                                        startColumn = session.getLine(lineNumber).match(/^\s*/)[0].length;
                                    }
                                    if (lineNumber === charChange.old.end.row) {
                                        endColumn = charChange.old.end.column;
                                    }
                                    else {
                                        endColumn = session.getLine(lineNumber).length;
                                    }
                                    let range = new Range(lineNumber, startColumn, lineNumber, endColumn);
                                    var screenRange = range.toScreenRange(session);
                                    markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff inline delete",
                                        config
                                    );
                                }
                            }
                            else {
                                let range = new Range(charChange.old.start.row,
                                    charChange.old.start.column, charChange.old.end.row,
                                    charChange.old.end.column
                                );
                                var screenRange = range.toScreenRange(session);
                                if (screenRange.isMultiLine()) {
                                    markerLayer.drawTextMarker(html, range, "ace_diff inline delete", config);
                                }
                                else {
                                    markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff inline delete",
                                        config
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    updateModifiedEditor(html, markerLayer, session, config) {
        var diffView = this.diffView;
        var ignoreTrimWhitespace = diffView.options.ignoreTrimWhitespace;
        var lineChanges = diffView.chunks;
        diffView.right.renderer.$scrollDecorator.zones = [];

        for (var lineChange of lineChanges) {
            if (isChangeOrInsert(lineChange)) {
                let range = new Range(lineChange.new.start.row, 0, lineChange.new.end.row - 1, 1 << 30);
                diffView.right.renderer.$scrollDecorator.addZone(lineChange.new.start.row, lineChange.new.end.row - 1, "add");

                range = range.toScreenRange(session);
                markerLayer.drawFullLineMarker(html, range, "ace_diff " + "insert inline", config);

                if (lineChange.charChanges) {
                    for (const charChange of lineChange.charChanges) {
                        if (isCharChangeOrInsert(charChange)) {
                            if (ignoreTrimWhitespace) {
                                for (let lineNumber = charChange.new.start.row; lineNumber
                                <= charChange.new.end.row; lineNumber++) {
                                    let startColumn;
                                    let endColumn;
                                    if (lineNumber === charChange.new.start.row) {
                                        startColumn = charChange.new.start.column;
                                    }
                                    else {
                                        startColumn = session.getLine(lineNumber).match(/^\s*/)[0].length;
                                    }
                                    if (lineNumber === charChange.new.end.row) {
                                        endColumn = charChange.new.end.column;
                                    }
                                    else {
                                        endColumn = session.getLine(lineNumber).length;
                                    }
                                    let range = new Range(lineNumber, startColumn, lineNumber, endColumn);
                                    var screenRange = range.toScreenRange(session);
                                    markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff inline insert",
                                        config
                                    );
                                }
                            }
                            else {
                                let range = new Range(charChange.new.start.row,
                                    charChange.new.start.column, charChange.new.end.row,
                                    charChange.new.end.column
                                );
                                var screenRange = range.toScreenRange(session);
                                if (screenRange.isMultiLine()) {
                                    markerLayer.drawTextMarker(html, range, "ace_diff inline insert", config);
                                }
                                else {
                                    markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff inline insert",
                                        config
                                    );
                                }
                            }
                        }
                    }
                }

            }
        }
    }
}

/**
 * 
 * @param {AceDiff} lineChange
 * @return {boolean}
 */
function isChangeOrInsert(lineChange) {
    return lineChange.new.end.row > -1;
}

/**
 *
 * @param {AceDiff} lineChange
 * @return {boolean}
 */
function isChangeOrDelete(lineChange) {
    return lineChange.old.end.row > -1;
}

exports.DiffView = DiffView;
