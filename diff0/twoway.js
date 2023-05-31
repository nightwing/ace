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
    };

    getSession() {
        return this.session;
    };
    
    setTheme(theme) {
        this.left.setTheme(theme);
    };

    getTheme() {
        return this.left.getTheme();
    };

    onChangeTheme() {
        this.right.setTheme(this.left.getTheme());
        var theme = this.right.renderer.theme;
    };

    resize() {
        this.edit.resize();
        this.orig.resize();
    };

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
    };

    $diffLines(val1, val2) {
        var chunks = computeDiff(val1, val2, {
            ignoreTrimWhitespace: this.options.ignoreTrimWhitespace,
            maxComputationTimeMs: this.options.maxComputationTimeMs
        });
        console.log(chunks);
        return chunks;
    };

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
            var diff1 = ch.origEnd - ch.origStart;
            var diff2 = ch.editEnd - ch.editStart;

            if (diff1 < diff2) {
                add(diffView.orig, {
                    rowCount: diff2 - diff1,
                    row: ch.origEnd === 0 ? 0 : ch.origEnd - 1
                });
            }
            else if (diff1 > diff2) {
                add(diffView.edit, {
                    rowCount: diff1 - diff2,
                    row: ch.editEnd === 0 ? 0 : ch.editEnd - 1
                });
            }
        });
        diffView.edit.session._emit("changeFold", {data: {start: {row: 0}}});
        diffView.orig.session._emit("changeFold", {data: {start: {row: 0}}});
    };

    onSelect(e, selection) {
        console.log("selection");
        this.syncSelect(selection);
    };

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
    };

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
            var ch = chunks[i];

            if (!ch) {
                ch = {
                    editStart: 0,
                    editEnd: 0,
                    origStart: 0,
                    origEnd: 0
                };
            }
            if (mid >= (isOrig ? ch.origEnd : ch.editEnd)) {
                var next = chunks[i + 1] || {
                    editStart: r2.session.getLength(),
                    editEnd: r2.session.getLength(),
                    origStart: r1.session.getLength(),
                    origEnd: r1.session.getLength()
                };
                ch = {
                    origStart: ch.origEnd,
                    origEnd: next.origStart,
                    editStart: ch.editEnd,
                    editEnd: next.editStart
                };
            }
            if (r == r1) {
                var start = ch.origStart;
                var end = ch.origEnd;
                var otherStart = ch.editStart;
                var otherEnd = ch.editEnd;
            }
            else {
                otherStart = ch.origStart;
                otherEnd = ch.origEnd;
                start = ch.editStart;
                end = ch.editEnd;
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
    };

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
    };

    onChangeFold(ev, session) {
        if (ev.action == "remove") {
            var other = session == this.orig.session ? this.edit.session : this.orig.session;
            var fold = ev.data;
            if (fold && fold.other) {
                fold.other.other = null;
                other.removeFold(fold.other);
            }
        }
    };

    $attachSessionEventHandlers() {
        this.left.session.on("changeScrollTop", this.onScroll);
        this.right.session.on("changeScrollTop", this.onScroll);
        this.left.session.on("changeFold", this.onChangeFold);
        this.right.session.on("changeFold", this.onChangeFold);
        this.left.session.addDynamicMarker(this.markerLeft);
        this.right.session.addDynamicMarker(this.markerRight);
        this.left.selection.on("changeSelection", this.onSelect);
        this.right.selection.on("changeSelection", this.onSelect);
    };

    $detachSessionEventHandlers() {
        this.left.session.off("changeScrollTop", this.onScroll);
        this.right.session.off("changeScrollTop", this.onScroll);
        this.left.session.off("changeFold", this.onChangeFold);
        this.right.session.off("changeFold", this.onChangeFold);
        this.left.session.removeMarker(this.markerLeft.id);
        this.right.session.removeMarker(this.markerRight.id);
    };

    $attachEventHandlers() {
        this.left.renderer.on("themeLoaded", this.onChangeTheme);

        this.left.on("mousewheel", this.onMouseWheel);
        this.right.on("mousewheel", this.onMouseWheel);

        this.left.on("input", this.onInput);
        this.right.on("input", this.onInput);
    };

    /*** other ***/
    destroy() {
        this.left.destroy();
        this.right.destroy();
    };

    gotoNext(dir) {
        var orig = false;
        var ace = orig ? this.orig : this.edit;
        var row = ace.selection.lead.row;
        var i = findChunkIndex(this.chunks, row, orig);
        var chunk = this.chunks[i + dir] || this.chunks[i];

        var scrollTop = ace.session.getScrollTop();
        if (chunk) {
            var line = Math.max(chunk.editStart, chunk.editEnd - 1);
            ace.selection.setRange(new Range(line, 0, line, 0));
        }
        ace.renderer.scrollSelectionIntoView(ace.selection.lead, ace.selection.anchor, 0.5);
        ace.renderer.animateScrolling(scrollTop);
    };

    transformRange(range, orig) {
        return Range.fromPoints(this.transformPosition(range.start, orig), this.transformPosition(range.end, orig));
    };

    transformPosition(pos, isOrig) {
        var chunkIndex = findChunkIndex(this.chunks, pos.row, isOrig);
        var chunk = this.chunks[chunkIndex];

        var result = {
            row: pos.row,
            column: pos.column
        };
        if (isOrig) { //TODO: calculate line widgets
            let origIndent = this.left.session.getLine(pos.row).match(/^\s*/)[0].length;
            let editIndent = this.right.session.getLine(result.row).match(/^\s*/)[0].length;
            let deltaChar = origIndent - editIndent;
            if (chunk.origEnd <= pos.row) {
                result.row = pos.row - chunk.origEnd + chunk.editEnd;
                result.column = pos.column - deltaChar;
            }
            else {
                var deltaLine = pos.row - chunk.origStart;
                result.row = deltaLine + chunk.editStart;


                if (chunk.charChanges) {
                    for (let i = 0; i < chunk.charChanges.length; i++) {
                        let charChange = chunk.charChanges[i];
                        if (charChange.originalStartLineNumber == pos.row) {
                            if (pos.column > charChange.originalStartColumn && pos.column
                                < charChange.originalEndColumn) {
                                result.column = charChange.modifiedStartColumn;
                                return result;
                            }
                            else if (pos.column > charChange.originalEndColumn) {
                                deltaChar += charChange.originalEndColumn - charChange.originalStartColumn;
                            }
                        }
                    }
                }
                result.column = result.column - deltaChar;
            }
        }
        else {
            if (chunk.editEnd <= pos.row) {
                result.row = pos.row - chunk.editEnd + chunk.origEnd;
            }
            else {
                var deltaLine = pos.row - chunk.editStart;
                result.row = deltaLine + chunk.origStart;
            }
        }

        return result;
    };
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

function findChunkIndex(chunks, row, orig) {
    if (orig) {
        for (var i = 0; i < chunks.length; i++) {
            var ch = chunks[i];
            if (ch.origEnd < row) continue;
            if (ch.origStart > row) break;
        }
    }
    else {
        for (var i = 0; i < chunks.length; i++) {
            var ch = chunks[i];
            if (ch.editEnd < row) continue;
            if (ch.editStart > row) break;
        }
    }
    return i - 1;
}

function isCharChangeOrInsert(charChange) {
    if (charChange.modifiedStartLineNumber === charChange.modifiedEndLineNumber) {
        return charChange.modifiedEndColumn - charChange.modifiedStartColumn > -1;
    }
    return charChange.modifiedEndLineNumber - charChange.modifiedStartLineNumber > -1;
}

function isCharChangeOrDelete(charChange) {
    if (charChange.originalStartLineNumber === charChange.originalEndLineNumber) {
        return charChange.originalEndColumn - charChange.originalStartColumn > -1;
    }
    return charChange.originalEndLineNumber - charChange.originalStartLineNumber > -1;
}

class SyncSelectionMarker {
    constructor() {
        this.type = "fullLine";
        this.clazz = "ace_diff selection";
    };

    update(html, markerLayer, session, config) {
    };

    setRange(range) {
        this.range = range;
    }

}

class DiffHighlight {
    constructor(diffView, type) {
        this.diffView = diffView;
        this.type = type;
    };

    static MAX_RANGES = 500;

    update(html, markerLayer, session, config) {
        if (this.type === -1) {
            this.updateOriginalEditor(html, markerLayer, session, config);
        }
        else {
            this.updateModifiedEditor(html, markerLayer, session, config);
        }
    };

    updateOriginalEditor(html, markerLayer, session, config) {
        var diffView = this.diffView;
        const ignoreTrimWhitespace = diffView.options.ignoreTrimWhitespace;
        var lineChanges = diffView.chunks;
        diffView.left.renderer.$scrollDecorator.zones = [];

        for (const lineChange of lineChanges) {

            if (isChangeOrDelete(lineChange)) {
                let range = new Range(lineChange.origStart, 0, lineChange.origEnd - 1, 1 << 30);
                diffView.left.renderer.$scrollDecorator.addZone(range.start.row, range.end.row, "remove");
                range = range.toScreenRange(session);
                markerLayer.drawFullLineMarker(html, range, "ace_diff " + "delete inline", config);

                if (lineChange.charChanges) {
                    for (const charChange of lineChange.charChanges) {
                        if (isCharChangeOrDelete(charChange)) {
                            if (ignoreTrimWhitespace) {
                                for (let lineNumber = charChange.originalStartLineNumber; lineNumber
                                <= charChange.originalEndLineNumber; lineNumber++) {
                                    let startColumn;
                                    let endColumn;
                                    if (lineNumber === charChange.originalStartLineNumber) {
                                        startColumn = charChange.originalStartColumn;
                                    }
                                    else {
                                        startColumn = session.getLine(lineNumber).match(/^\s*/)[0];
                                    }
                                    if (lineNumber === charChange.originalEndLineNumber) {
                                        endColumn = charChange.originalEndColumn;
                                    }
                                    else {
                                        endColumn = session.getLine(lineNumber).match(/^\s*/)[0];
                                    }
                                    let range = new Range(lineNumber, startColumn, lineNumber, endColumn);
                                    var screenRange = range.toScreenRange(session);
                                    markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff inline delete",
                                        config
                                    );
                                }
                            }
                            else {
                                let range = new Range(charChange.originalStartLineNumber,
                                    charChange.originalStartColumn, charChange.originalEndLineNumber,
                                    charChange.originalEndColumn
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
                let range = new Range(lineChange.editStart, 0, lineChange.editEnd - 1, 1 << 30);
                diffView.right.renderer.$scrollDecorator.addZone(lineChange.editStart, lineChange.editEnd - 1, "add");

                range = range.toScreenRange(session);
                markerLayer.drawFullLineMarker(html, range, "ace_diff " + "insert inline", config);

                if (lineChange.charChanges) {
                    for (const charChange of lineChange.charChanges) {
                        if (isCharChangeOrInsert(charChange)) {
                            if (ignoreTrimWhitespace) {
                                for (let lineNumber = charChange.modifiedStartLineNumber; lineNumber
                                <= charChange.modifiedEndLineNumber; lineNumber++) {
                                    let startColumn;
                                    let endColumn;
                                    if (lineNumber === charChange.modifiedStartLineNumber) {
                                        startColumn = charChange.modifiedStartColumn;
                                    }
                                    else {
                                        startColumn = session.getLine(lineNumber).match(/^\s*/)[0];
                                    }
                                    if (lineNumber === charChange.modifiedEndLineNumber) {
                                        endColumn = charChange.modifiedEndColumn;
                                    }
                                    else {
                                        endColumn = session.getLine(lineNumber).match(/^\s*/)[0];
                                    }
                                    let range = new Range(lineNumber, startColumn, lineNumber, endColumn);
                                    var screenRange = range.toScreenRange(session);
                                    markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff inline insert",
                                        config
                                    );
                                }
                            }
                            else {
                                let range = new Range(charChange.modifiedStartLineNumber,
                                    charChange.modifiedStartColumn, charChange.modifiedEndLineNumber,
                                    charChange.modifiedEndColumn
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

function isChangeOrInsert(lineChange) {
    return lineChange.editEnd > -1;
}

function isChangeOrDelete(lineChange) {
    return lineChange.origEnd > -1;
}

exports.DiffView = DiffView;
