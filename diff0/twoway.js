"use strict";

var oop = require("ace-code/src/lib/oop");
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

class DiffView {
    constructor(element, options) {
        this.onInput = this.onInput.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onChangeFold = this.onChangeFold.bind(this);
        this.onChangeTheme = this.onChangeTheme.bind(this);
        this.onSelect = this.onSelect.bind(this);

        dom.importCssString(css, "diffview.css");
        if (options.ignoreTrimWhitespace === undefined)
            options.ignoreTrimWhitespace = true;
        this.options = {
            ignoreTrimWhitespace: options.ignoreTrimWhitespace,
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
        this.left.session.addDynamicMarker(this.syncSelectionMarkerLeft);
        this.right.session.addDynamicMarker(this.syncSelectionMarkerRight);

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
            this.$detachEditorsEventHandlers();
        }
        this.session = session;
        if (this.session) {
            this.chunks = this.session.chunks;
            this.orig.setSession(session.orig);
            this.edit.setSession(session.edit);
            this.$attachEditorsEventHandlers();
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

        this.selectionSetBy = false;
        this.lefSelectionRange = null;
        this.righSelectionRange = null;

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
                return new AceDiff(new Range(originalStartLineNumber, 0, originalEndLineNumber, 0),
                    new Range(modifiedStartLineNumber, 0, modifiedEndLineNumber, 0), changes.innerChanges
                );
            });
        }
    }

    /*** scroll locking ***/
    align() {
        var diffView = this;

        function add(editor, w) {
            let lineWidget = editor.session.lineWidgets[w.row];
            if (lineWidget) {
                w.rowsAbove += lineWidget.rowsAbove > w.rowsAbove ? lineWidget.rowsAbove : w.rowsAbove;
                w.rowCount += lineWidget.rowCount;
            }
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
                    rowsAbove: ch.old.end.row === 0 ? diff2 : 0,
                    row: ch.old.end.row === 0 ? 0 : ch.old.end.row - 1
                });
            }
            else if (diff1 > diff2) {
                add(diffView.edit, {
                    rowCount: diff1 - diff2,
                    rowsAbove: ch.new.end.row === 0 ? diff1 : 0,
                    row: ch.new.end.row === 0 ? 0 : ch.new.end.row - 1
                });
            }
        });
        diffView.edit.session._emit("changeFold", {data: {start: {row: 0}}});
        diffView.orig.session._emit("changeFold", {data: {start: {row: 0}}});
    }

    onSelect(e, selection) {
        this.syncSelect(selection);
    }

    syncSelect(selection) {
        var left = this.left.session;
        var right = this.right.session;

        var selectionSession = selection.session;
        var isOrig = selectionSession === left;
        var selectionMarker = isOrig ? this.syncSelectionMarkerLeft : this.syncSelectionMarkerRight;
        var selectionRange = selection.getRange();

        var currSelectionRange = isOrig ? this.lefSelectionRange : this.righSelectionRange;
        if (currSelectionRange && selectionRange.isEqual(currSelectionRange))
            return;

        if (isOrig) {
            this.lefSelectionRange = selectionRange;
        } else {
            this.righSelectionRange = selectionRange;
        }

        this.updateSelectionMarker(selectionMarker, selection.session, selectionRange);

        if (this.selectionSetBy) {
            this.selectionSetBy = false;
            return;
        }

        setTimeout(() => {
            this.selectionSetBy = true;
            let newRange = this.transformRange(selectionRange, isOrig);
            (isOrig ? right : left).selection.setSelectionRange(newRange);
        }, 0);

    }

    updateSelectionMarker(marker, session, range) {
        marker.setRange(range);
        session._signal("changeBackMarker");
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
                    old: new Range(0, 0, 0, 0),
                    new: new Range(0, 0, 0, 0)
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

    $attachEditorsEventHandlers() {
        this.$attachEditorEventHandlers(this.left, this.markerLeft);
        this.$attachEditorEventHandlers(this.right, this.markerRight);
    }

    $attachEditorEventHandlers(editor, marker) {
        editor.session.on("changeScrollTop", this.onScroll);
        editor.session.on("changeFold", this.onChangeFold);
        editor.session.addDynamicMarker(marker);
        editor.selection.on("changeCursor", this.onSelect);
        editor.selection.on("changeSelection", this.onSelect);
    }

    $detachEditorsEventHandlers() {
        this.$detachEditorEventHandlers(this.left, this.markerLeft);
        this.$detachEditorEventHandlers(this.right, this.markerRight);
    }

    $detachEditorEventHandlers(editor, marker) {
        editor.session.off("changeScrollTop", this.onScroll);
        editor.session.off("changeFold", this.onChangeFold);
        editor.session.removeMarker(marker.id);
        editor.selection.off("changeCursor", this.onSelect);
        editor.selection.off("changeSelection", this.onSelect);
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


    /**
     * @param {Ace.Point} pos
     * @param {boolean} isOrig
     * @return {Ace.Point}
     */
    transformPosition(pos, isOrig) {
        var chunkIndex = findChunkIndex(this.chunks, pos.row, isOrig);
        var chunk = this.chunks[chunkIndex];

        var clonePos = this.left.session.doc.clonePos;
        var result = clonePos(pos);

        var [from, to] = isOrig ? ["old", "new"] : ["new", "old"];
        var deltaChar = 0;
        var ignoreIndent = false;

        if (chunk) {
            if (chunk[from].end.row <= pos.row) {
                result.row -= chunk[from].end.row - chunk[to].end.row;
            } else {
                if (chunk.charChanges) {
                    for (let i = 0; i < chunk.charChanges.length; i++) {
                        let change = chunk.charChanges[i];

                        let fromRange = change.getChangeRange(from);
                        let toRange = change.getChangeRange(to);

                        if (fromRange.end.row < pos.row)
                            continue;

                        if (fromRange.start.row > pos.row)
                            break;

                        if (fromRange.isMultiLine()) {
                            result.row = toRange.start.row + pos.row - fromRange.start.row;
                            var maxRow = toRange.end.row;
                            if (toRange.end.column === 0)
                                maxRow--;

                            if (result.row > maxRow) {
                                result.row = maxRow;
                                result.column = (isOrig ? this.right : this.left).session.getLine(maxRow).length;
                                ignoreIndent = true;
                            }
                            result.row = Math.min(result.row, maxRow);
                        } else {
                            result.row = toRange.start.row;
                            if (fromRange.start.column > pos.column)
                                break;
                            ignoreIndent = true;

                            if (!fromRange.isEmpty() && fromRange.contains(pos.row, pos.column)) {
                                result.column = toRange.start.column;
                                deltaChar = pos.column - fromRange.start.column;
                                deltaChar = Math.min(deltaChar, toRange.end.column - toRange.start.column)
                            } else {
                                result = clonePos(toRange.end);
                                deltaChar = pos.column - fromRange.end.column;
                            }
                        }
                    }
                }
            }
        }


        if (!ignoreIndent) {
            var [fromEditor, toEditor] = isOrig ? [this.left, this.right] : [this.right, this.left];
            deltaChar -= this.$getDeltaIndent(fromEditor, toEditor, pos.row, result.row);
        }

        result.column += deltaChar;
        return result;
    }

    $getDeltaIndent(fromEditor, toEditor, fromLine, toLine) {
        let origIndent = this.$getIndent(fromEditor, fromLine);
        let editIndent = this.$getIndent(toEditor, toLine);
        return origIndent - editIndent;
    }

    $getIndent(editor, line) {
        return editor.session.getLine(line).match(/^\s*/)[0].length
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
 * @param {boolean} isOrig
 * @return {number}
 */
function findChunkIndex(chunks, row, isOrig) {
    for (var i = 0; i < chunks.length; i++) {
        var ch = chunks[i];
        var chunk = isOrig ? ch.old : ch.new;
        if (chunk.end.row < row) continue;
        if (chunk.start.row > row) break;
    }

    return i - 1;
}

class SyncSelectionMarker {
    constructor() {
        this.type = "fullLine";
        this.clazz = "ace_diff selection";
    }

    update(html, markerLayer, session, config) {
    }

    /**
     * @param {Ace.Range} range
     */
    setRange(range) {//TODO
        var newRange = range.clone();
        newRange.end.column++;

        this.range = newRange;
    }

}

class DiffHighlight {
    /**
     * @param {DiffView} diffView
     * @param type
     */
    constructor(diffView, type) {
        this.diffView = diffView;
        this.type = type;
    }

    static MAX_RANGES = 500;

    update(html, markerLayer, session, config) {
        let side, dir, operation, opOperation;
        if (this.type === -1) {// original editor
            side = "left";
            dir = "old";
            operation = "delete";
            opOperation = "insert";
        }
        else { //modified editor
            side = "right";
            dir = "new";
            operation = "insert";
            opOperation = "delete";
        }

        var diffView = this.diffView;
        var ignoreTrimWhitespace = diffView.options.ignoreTrimWhitespace;
        var lineChanges = diffView.chunks;
        diffView[side].renderer.$scrollDecorator.zones = [];
        for (const lineChange of lineChanges) {
            let range = new Range(lineChange[dir].start.row, 0, lineChange[dir].end.row - 1, 1 << 30);
            diffView[side].renderer.$scrollDecorator.addZone(range.start.row, range.end.row, operation);
            range = range.toScreenRange(session);
            markerLayer.drawFullLineMarker(html, range, "ace_diff " + operation + " inline", config);

            if (lineChange.charChanges) {
                for (const charChange of lineChange.charChanges) {
                    if (ignoreTrimWhitespace) {
                        for (let lineNumber = charChange[dir].start.row;
                             lineNumber <= charChange[dir].end.row; lineNumber++) {
                            let startColumn;
                            let endColumn;
                            if (lineNumber === charChange[dir].start.row) {
                                startColumn = charChange[dir].start.column;
                            }
                            else {
                                startColumn = session.getLine(lineNumber).match(/^\s*/)[0].length;
                            }
                            if (lineNumber === charChange[dir].end.row) {
                                endColumn = charChange[dir].end.column;
                            }
                            else {
                                endColumn = session.getLine(lineNumber).length;
                            }
                            let range = new Range(lineNumber, startColumn, lineNumber, endColumn);
                            var screenRange = range.toScreenRange(session);

                            let cssClass = "inline " + operation;
                            if (range.isEmpty() && startColumn !== 0) {
                                cssClass = "inline " + opOperation + " empty";
                            }

                            markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff " + cssClass, config);
                        }
                    }
                    else {
                        let range = new Range(charChange[dir].start.row, charChange[dir].start.column,
                            charChange[dir].end.row, charChange[dir].end.column
                        );
                        var screenRange = range.toScreenRange(session);
                        let cssClass = "inline " + operation;
                        if (range.isEmpty() && charChange[dir].start.column !== 0) {
                            cssClass = "inline empty" + opOperation;
                        }

                        if (screenRange.isMultiLine()) {
                            markerLayer.drawTextMarker(html, range, "ace_diff " + cssClass, config);
                        }
                        else {
                            markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff " + cssClass, config);
                        }
                    }
                }
            }
        }
    }
}

class AceDiff {
    constructor(originalRange, modifiedRange, charChanges) {
        this.old = originalRange;
        this.new = modifiedRange;
        this.charChanges = charChanges && charChanges.map(m => new AceDiff(
            new Range(m.originalRange.startLineNumber - 1, m.originalRange.startColumn - 1,
                m.originalRange.endLineNumber - 1, m.originalRange.endColumn - 1
            ), new Range(m.modifiedRange.startLineNumber - 1, m.modifiedRange.startColumn - 1,
                m.modifiedRange.endLineNumber - 1, m.modifiedRange.endColumn - 1
            )));
    }

    /**
     *
     * @param {string} dir
     * @return {Range}
     */
    getChangeRange(dir) {
        return this[dir];
    }

    padCenter(str, length) {
        const totalPadding = length - str.length;
        const leftPadding = Math.floor(totalPadding / 2);
        const rightPadding = totalPadding - leftPadding;
        return ' '.repeat(leftPadding) + str + ' '.repeat(rightPadding);
    }

    rangeToString(range, columnWidths) {
        const startRow = this.padCenter(String(range.start.row), columnWidths[0]);
        const startColumn = this.padCenter(String(range.start.column), columnWidths[1]);
        const endRow = this.padCenter(String(range.end.row), columnWidths[2]);
        const endColumn = this.padCenter(String(range.end.column), columnWidths[3]);
        return `${startRow}${startColumn}${endRow}${endColumn}`;
    }

    toString() {
        const columnWidths = [12, 14, 12, 14];
        let result = "Original Range                                       | Modified Range\n";
        result += " Start Row    Start Column    End Row    End Column   | Start Row    Start Column    End Row    End Column\n";
        result += "-----------------------------------------------------|----------------------------------------------------\n";
        result += `${this.rangeToString(this.old, columnWidths)} | ${this.rangeToString(this.new, columnWidths)}\n`;

        if (this.charChanges) {
            result += "\nCharacter Changes:\n";
            result += " Start Row    Start Column    End Row    End Column   | Start Row    Start Column    End Row    End Column\n";
            result += "-----------------------------------------------------|----------------------------------------------------\n";
            for (const change of this.charChanges) {
                result += `${this.rangeToString(change.old, columnWidths)} | ${this.rangeToString(
                    change.new, columnWidths)}\n`;
            }
        }
        result += "-----------------------------------------------------|----------------------------------------------------\n";
        result += "\n\n";
        return result;
    }
}

exports.DiffView = DiffView;
