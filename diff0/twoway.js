"use strict";

var oop = require("ace-code/src/lib/oop");
var event = require("ace-code/src/lib/event");
var Range = require("ace-code/src/range").Range;
var dom = require("ace-code/src/lib/dom");
var config = require("ace-code/src/config");

var LineWidgets = require("ace-code/src/line_widgets").LineWidgets;
var css = require("text!./styles.css");
var computeDiff = require("./vscode-diff/bundle.vscode_diff").computeDiff;

var SVG_NS = "http://www.w3.org/2000/svg";

var Editor = require("ace-code/src/editor").Editor;
var Renderer = require("ace-code/src/virtual_renderer").VirtualRenderer;
var UndoManager = require("ace-code/src/undomanager").UndoManager;
var EditSession = require("ace-code/src/edit_session").EditSession;
require("ace-code/src/theme/textmate");
// enable multiselect
require("ace-code/src/multi_select");

function createEditor() {
    var editor = new Editor(new Renderer(), null, {
        customScrollbar: true
    });
    editor.session.setUndoManager(new UndoManager());
    return editor;
}

class DiffView {
    constructor(element, options) {
        this.onInput = this.onInput.bind(this);
        this.onConnectorScroll = this.onConnectorScroll.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onChangeFold = this.onChangeFold.bind(this);
        this.onChangeTheme = this.onChangeTheme.bind(this);

        dom.importCssString(css, "diffview.css");
        this.options = {};
        this.container = element;

        oop.mixin(this.options, {
            showDiffs: true,
            maxDiffs: 5000
        }, options);

        this.orig = this.left = createEditor();
        this.edit = this.right = createEditor();
        this.gutterEl = document.createElement("div");

        element.appendChild(this.left.container);
        element.appendChild(this.gutterEl);
        element.appendChild(this.right.container);

        this.left.setOption("scrollPastEnd", 0.5);
        this.right.setOption("scrollPastEnd", 0.5);
        this.left.setOption("highlightActiveLine", false);
        this.right.setOption("highlightActiveLine", false);
        this.left.setOption("highlightGutterLine", false);
        this.right.setOption("highlightGutterLine", false);
        this.left.setOption("animatedScroll", true);
        this.right.setOption("animatedScroll", true);

        this.markerLeft = new ModifiedDiffHighlight(this, -1);
        this.markerRight = new ModifiedDiffHighlight(this, 1);
        this.setSession({
            orig: this.orig.session,
            edit: this.edit.session,
            chunks: []
        });
        //TODO: Connector
        /*this.connector = new Connector(this);
        this.connector.createGutter();*/
        this.onChangeTheme();

        this.$initArrow();

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

    createSession() {
        var session = new EditSession("");
        session.setUndoManager(new UndoManager());
        return session;
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
        this.gutterEl.className = "ace_diff-gutter " + theme.cssClass;
        dom.setCssClass(this.gutterEl, "ace_dark", theme.isDark);
    };

    resize() {
        this.edit.resize();
        this.orig.resize();
    };

    //this.computeDiff TODO
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
        //TODO:
        let options = {
            ignoreTrimWhitespace: true,
            maxComputationTimeMs: 0 // time in milliseconds, 0 => no computation limit.
        };
        return computeDiff(val1, val2, options);
    };
    
    /*** scroll locking ***/
    align() {
        var diffView = this;

        function add(editor, w) {
            editor.session.lineWidgets[w.row] = w;
           /* w.el = dom.createElement("div");
            w.el.className = "test";
            w.fixedWidth = true;
            w.el.style.height = editor.renderer.layerConfig.lineHeight * w.rowCount + "px";
            w.el.style.background = "#8080802e";
            editor.session.widgetManager.addLineWidget(w);*/
            editor.session.widgetManager.lineWidgets.push(w);
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

    onScroll(e, session) {
        this.syncScroll(this.left.session == session ? this.left.renderer : this.right.renderer);
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

    onConnectorScroll(ev) {
        var dir = ev.wheelY > 0 ? 1 : -1;
        var r1 = this.left.renderer;
        var r2 = this.right.renderer;
        if (r1.$scrollAnimation && r2.$scrollAnimation) return;

        var minAmount = ev.wheelY * 2;

        var r = r1.session.getLength() > r2.session.getLength() ? r1 : r2;
        var layerConfig = r.layerConfig;
        var chunks = this.chunks;
        var halfScreen = 0.5 * r.$size.scrollerHeight;
        var lc = layerConfig;
        var isOrig = r == r1;
        var midY = halfScreen + r.scrollTop;
        var mid = r.session.screenToDocumentRow(midY / lc.lineHeight, 0);
        var i = findChunkIndex(chunks, mid, isOrig);
        var ch = chunks[i];

        if (dir < 0) {
            if (!ch) ch = {
                editStart: 0,
                editEnd: 0,
                origStart: 0,
                origEnd: 0
            }; else if (mid < (isOrig ? ch.origEnd : ch.editEnd)) ch = chunks[i - 1] || ch; else ch = chunks[i];
        }
        else {
            ch = chunks[i + 1] || {
                editStart: r2.session.getLength(),
                editEnd: r2.session.getLength(),
                origStart: r1.session.getLength(),
                origEnd: r1.session.getLength()
            };
        }

        var scrollTop1 = r1.session.getScrollTop();
        var scrollTop2 = r2.session.getScrollTop();
        this.$syncScroll = false;
        r1.scrollToLine(ch.origStart, true, true);
        r2.scrollToLine(ch.editStart, true, true);
        this.$syncScroll = true;
        if (Math.abs(scrollTop1 - r1.session.getScrollTop()) <= 1 && Math.abs(scrollTop2 - r2.session.getScrollTop())
            <= 1) {
            if (r1.isScrollableBy(0, minAmount)) r1.scrollBy(0, minAmount);
        }
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
        var _self = this;
        this.left.renderer.on("themeLoaded", this.onChangeTheme);
        //TODO: Connector
        /*this.right.renderer.on("afterRender", function() {
            if (!_self.left.renderer.$loop.changes) _self.connector.decorate();
        });
        this.left.renderer.on("afterRender", function() {
            if (!_self.right.renderer.$loop.changes) _self.connector.decorate();
        });*/

        event.addMouseWheelListener(this.gutterEl, this.onConnectorScroll);

        this.left.on("mousewheel", this.onMouseWheel);
        this.right.on("mousewheel", this.onMouseWheel);

        this.left.on("input", this.onInput);
        this.right.on("input", this.onInput);
    };

    $initArrow() {
        var arrow = document.createElement("div");
        this.gutterEl.appendChild(arrow);

        var region = 0;
        var diffView = this;
        arrow.addEventListener("click", function (e) {
            if (region && region.chunk) {
                var range = diffView.useChunk(region.chunk, region.side == 1);
                var editor = region.side == 1 ? diffView.orig : diffView.edit;
                editor.selection.moveToPosition(range.start);
                editor.focus();
            }
            hide();
        });
        this.gutterEl.addEventListener("mousemove", function (e) {
            var rect = e.currentTarget.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY; // - rect.top;

            if (!region) {
                arrow.style.display = "";
                region = {};
            }

            if (x < rect.width / 2) {
                if (region.side != -1) arrow.className = "diff-arrow diff-arrow-left";
                region.side = -1;
            }
            else {
                if (region.side != 1) arrow.className = "diff-arrow diff-arrow-right";
                region.side = 1;
            }
            var editor = region.side == 1 ? diffView.edit : diffView.orig;
            var other = editor == diffView.edit ? diffView.orig : diffView.edit;
            var renderer = editor.renderer;

            if (other.getReadOnly()) return hide();

            var p = renderer.screenToTextCoordinates(x, y);
            var row = p.row;
            if (row == renderer.session.getLength() - 1) row++;
            var chunks = diffView.chunks;
            var i = findChunkIndex(chunks, row, region.side == -1);
            if (i == -1) i = 0;
            var ch = chunks[i] || chunks[chunks.length - 1];
            var next = chunks[i + 1];

            var side = region.side == -1 ? "orig" : "edit";
            if (next && ch) {
                if (ch[side + "End"] + next[side + "Start"] < 2 * row) ch = next;
            }
            region.chunk = ch;
            if (!ch) return hide();
            if (renderer.layerConfig.firstRow > ch[side + "End"]) return hide();
            if (renderer.layerConfig.lastRow < ch[side + "Start"] - 1) return hide();

            var screenPos = renderer.$cursorLayer.getPixelPosition({
                row: ch[side + "Start"],
                column: 0
            }, true).top;
            if (screenPos < renderer.layerConfig.offset) screenPos = renderer.layerConfig.offset;
            arrow.style.top = screenPos - renderer.layerConfig.offset + "px";
            if (region.side == -1) {
                arrow.style.left = "2px";
                arrow.style.right = "";
            }
            else {
                arrow.style.left = "";
                arrow.style.right = "2px";
            }
        }.bind(this));
        this.gutterEl.addEventListener("mouseout", function (e) {
            hide();
        });
        event.addMouseWheelListener(this.gutterEl, hide);

        function hide() {
            if (region) {
                region = null;
                arrow.style.display = "none";
            }
        }
    };

    /*** other ***/
    destroy() {
        this.left.destroy();
        this.right.destroy();
    };

    foldUnchanged() {
        this.edit.session.unfold();
        this.orig.session.unfold();

        var chunks = this.chunks;
        var sep = "---";
        var prev = {
            editEnd: 0,
            origEnd: 0
        };
        for (var i = 0; i < chunks.length + 1; i++) {
            var ch = chunks[i] || {
                editStart: this.edit.session.getLength(),
                origStart: this.orig.session.getLength()
            };
            var l = ch.editStart - prev.editEnd - 5;
            if (l > 2) {
                var s = prev.origEnd + 2;
                var f1 = this.orig.session.addFold(sep, new Range(s, 0, s + l, Number.MAX_VALUE));
                s = prev.editEnd + 2;
                var f2 = this.edit.session.addFold(sep, new Range(s, 0, s + l, Number.MAX_VALUE));
                f1.other = f2;
                f2.other = f1;
            }
            prev = ch;
        }
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

    transformPosition(pos, orig) {
        var chunkIndex = findChunkIndex(this.chunks, pos.row, orig);
        var chunk = this.chunks[chunkIndex];

        var result = {
            row: pos.row,
            column: pos.column
        };
        if (orig) {
            if (chunk.origEnd <= pos.row) {
                result.row = pos.row - chunk.origEnd + chunk.editEnd;
            }
            else {
                console.log("======================================");
                var d = pos.row - chunk.origStart;
                var c = pos.column;
                var r1 = 0, c1 = 0, r2 = 0, c2 = 0;
                var inlineChanges = chunk.inlineChanges;
                for (var i = 0; i < inlineChanges.length; i++) {
                    var diff = inlineChanges[i];
                    if (diff[1]) {
                        if (diff[0] == 0) {
                            r1 += diff[1];
                            r2 += diff[1];
                            if (r1 == d) c2 = c1 = diff[2];
                        }
                        else if (diff[0] == 1) {
                            r2 += diff[1];
                            if (r1 == d) c2 = diff[2];
                        }
                        else if (diff[0] == -1) {
                            r1 += diff[1];
                            if (r1 == d) c1 = diff[2];
                        }
                    }
                    else if (r1 == d) {
                        if (diff[0] == 0) {
                            c1 += diff[2];
                            c2 += diff[2];
                        }
                        else if (diff[0] == 1) {
                            c2 += diff[2];
                        }
                        else if (diff[0] == -1) {
                            c1 += diff[2];
                        }
                    }
                    console.log(diff + "", r1, c1, r2, c2, d, c);
                    if (r1 > d || (r1 == d && c1 >= c)) {
                        break;
                    }
                }

                if (r1 > d) {
                    r2 -= r1 - d;
                }
                if (c1 != c) {
                    c2 -= c1 - c;
                }
                result.row = r2 + chunk.editStart;
                result.column = c2;
            }
        }

        return result;
    };

    useChunk(chunk, toOrig) {
        var origRange = new Range(chunk.origStart, 0, chunk.origEnd, 0);
        var editRange = new Range(chunk.editStart, 0, chunk.editEnd, 0);

        var srcEditor = toOrig ? this.edit : this.orig;
        var destEditor = toOrig ? this.orig : this.edit;
        var destRange = toOrig ? origRange : editRange;
        var srcRange = toOrig ? editRange : origRange;

        var value = srcEditor.session.getTextRange(srcRange);
        // missing eol at the end of document
        if (srcRange.isEmpty() && !destRange.isEmpty()) {
            if (destRange.end.row == destEditor.session.getLength()) {
                destRange.start.row--;
                destRange.start.column = Number.MAX_VALUE;
            }
        }
        else if (destRange.isEmpty() && !srcRange.isEmpty()) {
            if (srcRange.end.row == srcEditor.session.getLength()) {
                value = "\n" + value;
            }
        }
        destRange.end = destEditor.session.replace(destRange, value);
        return destRange;
    };

    transformRange(range, orig) {
        return Range.fromPoints(this.transformPosition(range.start, orig), this.transformPosition(range.end, orig));
    };

    findChunkIndex(row, orig) {
        return findChunkIndex(this.chunks, row, orig);
    };

    /*** patch ***/
    createPatch(options) {
        var chunks = this.chunks;
        var editLines = this.edit.session.doc.getAllLines();
        var origLines = this.orig.session.doc.getAllLines();
        var path1 = options.path1 || options.path || "_";
        var path2 = options.path2 || path1;
        var patch = [
            "diff --git a/" + path1 + " b/" + path2, "--- a/" + path1, "+++ b/" + path2
        ].join("\n");

        if (!chunks.length) {
            chunks = [
                {
                    origStart: 0,
                    origEnd: 0,
                    editStart: 0,
                    editEnd: 0
                }
            ];
        }

        function header(s1, c1, s2, c2) {
            return ("@@ -" + (c1 ? s1 + 1 : s1) + "," + c1 + " +" + (c2 ? s2 + 1 : s2) + "," + c2 + " @@");
        }

        var context = options.context || 0;
        // changed newline at the end of file
        var editEOF = !editLines[editLines.length - 1];
        var origEOF = !origLines[origLines.length - 1];
        if (editEOF) editLines.pop();
        if (origEOF) origLines.pop();
        if (editEOF != origEOF) {
            chunks = chunks.slice();
            var last = chunks.pop();
            chunks.push((last = {
                origStart: Math.min(last.origStart, origLines.length - 1),
                origEnd: Math.min(last.origEnd, origLines.length),
                editStart: Math.min(last.editStart, editLines.length - 1),
                editEnd: Math.min(last.editEnd, editLines.length)
            }));
        }

        var hunk = "";
        var start1 = 0;
        var start2 = 0;
        var end1 = 0;
        var end2 = 0;
        var length1 = 0;
        var length2 = 0;
        var mergeWithNext = false;
        for (var i = 0; i < chunks.length; i++) {
            var ch = chunks[i];
            var s1 = ch.origStart;
            var e1 = ch.origEnd;
            var s2 = ch.editStart;
            var e2 = ch.editEnd;
            var next = chunks[i + 1];

            start1 = Math.max(s1 - context, end1);
            start2 = Math.max(s2 - context, end2);
            end1 = Math.min(e1 + context, origLines.length);
            end2 = Math.min(e2 + context, editLines.length);

            mergeWithNext = false;
            if (next) {
                if (end1 >= next.origStart - context) {
                    end1 = next.origStart;
                    end2 = next.editStart;
                    mergeWithNext = true;
                }
            }

            for (var j = start1; j < s1; j++) hunk += "\n " + origLines[j];
            for (var j = s1; j < e1; j++) hunk += "\n-" + origLines[j];
            if (ch == last && editEOF) hunk += "\n\\ No newline at end of file";
            for (var j = s2; j < e2; j++) hunk += "\n+" + editLines[j];
            if (ch == last && origEOF) hunk += "\n\\ No newline at end of file";
            for (var j = e1; j < end1; j++) hunk += "\n " + origLines[j];

            length1 += end1 - start1;
            length2 += end2 - start2;
            if (mergeWithNext) continue;

            patch += "\n" + header(end1 - length1, length1, end2 - length2, length2) + hunk;
            length2 = length1 = 0;
            hunk = "";
        }

        if (!editEOF && !origEOF && end1 == origLines.length) {
            patch += "\n\\ No newline at end of file";
        }

        return patch;
    };

    setValueFromFullPatch(fullUniDiff) {
        var lines = fullUniDiff.split("\n");
        var missingEOF = "";
        var oldLines = [];
        var newLines = [];
        var i = 0;
        while (i < lines.length && !/^@@/.test(lines[i])) i++;

        while (++i < lines.length) {
            var tag = lines[i][0];
            var line = lines[i].substr(1);
            if (tag === "+") {
                newLines.push(line);
            }
            else if (tag === "-") {
                oldLines.push(line);
            }
            else if (tag === " ") {
                newLines.push(line);
                oldLines.push(line);
            }
            else if (tag === "\\") {
                missingEOF = lines[i - 1][0];
            }
        }

        if (missingEOF === "+") {
            oldLines.push("");
        }
        else if (missingEOF === "-") {
            newLines.push("");
        }
        else if (missingEOF === "") {
            newLines.push("");
            oldLines.push("");
        }

        this.orig.session.setValue(oldLines.join("\n"));
        this.edit.session.setValue(newLines.join("\n"));
    };

    applyPatch(oldStr, uniDiff) {
        var lines = uniDiff.split("\n");
        var hunks = [];
        var i = 0;
        var EOFChanged = 0;

        // Skip to the first change hunk
        while (i < lines.length && !/^@@/.test(lines[i])) {
            i++;
        }

        // Parse the unified diff
        for (; i < lines.length; i++) {
            var tag = lines[i][0];
            var line = lines[i].substr(1);
            if (tag === "@") {
                var chunkHeader = /@@ -(\d+)(?:,(\d*))? \+(\d+)(?:,(\d*)) @@/.exec(line);
                hunks.unshift({
                    start: +chunkHeader[1],
                    oldlength: +chunkHeader[2] || 1,
                    removed: [],
                    added: []
                });
            }
            else if (tag === "+") {
                hunks[0].added.push(line);
            }
            else if (tag === "-") {
                hunks[0].removed.push(line);
            }
            else if (tag === " ") {
                hunks[0].added.push(line);
                hunks[0].removed.push(line);
            }
            else if (tag === "\\") {
                if (lines[i - 1][0] === "+") EOFChanged = 1; else if (lines[i - 1][0] === "-") EOFChanged = -1;
            }
        }

        // Apply the diff to the input
        lines = oldStr.split("\n");
        for (i = hunks.length - 1; i >= 0; i--) {
            var hunk = hunks[i];
            // Sanity check the input string. Bail if we don't match.
            for (var j = 0; j < hunk.oldlength; j++) {
                if (lines[hunk.start - 1 + j] !== hunk.removed[j]) {
                    return false;
                }
            }
            lines.splice.apply(lines, [hunk.start - 1, hunk.oldlength].concat(hunk.added));
        }

        // Handle EOFNL insertion/removal
        if (EOFChanged == -1) {
            while (!lines[lines.length - 1]) {
                lines.pop();
            }
        }
        else if (EOFChanged == 1) {
            lines.push("");
        }
        return lines.join("\n");
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

var diff_linesToChars_ = function (text1, text2) {
    var lineHash = Object.create(null);
    var lineCount = 1;

    function diff_linesToCharsMunge_(lines) {
        var chars = "";
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (typeof lineHash[line] === "number") {
                chars += String.fromCharCode(lineHash[line]);
            }
            else {
                chars += String.fromCharCode(lineCount);
                lineHash[line] = lineCount++;
            }
        }
        return chars;
    }

    var chars1 = diff_linesToCharsMunge_(text1);
    var chars2 = diff_linesToCharsMunge_(text2);
    return {
        chars1: chars1,
        chars2: chars2
    };
};

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

/*
var Connector = function(diffView) {
    this.diffView = diffView;
};
(function() {
    this.addConnector = function(diffView, origStart, origEnd, editStart, editEnd, type) {
        origStart = Math.ceil(origStart);
        origEnd = Math.ceil(origEnd);
        editStart = Math.ceil(editStart);
        editEnd = Math.ceil(editEnd);

        //  p1   p2
        //
        //  p3   p4
        var p1_x = -1;
        var p1_y = origStart + 0.5;
        var p2_x = diffView.gutterWidth + 1;
        var p2_y = editStart + 0.5;
        var p3_x = -1;
        var p3_y = origEnd === origStart ? origEnd + 0.5 : origEnd + 1.5;
        var p4_x = diffView.gutterWidth + 1;
        var p4_y = editEnd === editStart ? editEnd + 0.5 : editEnd + 1.5;
        var curve1 = this.getCurve(p1_x, p1_y, p2_x, p2_y);
        var curve2 = this.getCurve(p4_x, p4_y, p3_x, p3_y);

        var verticalLine1 = "L" + p2_x + "," + p2_y + " " + p4_x + "," + p4_y;
        var verticalLine2 = "L" + p3_x + "," + p3_y + " " + p1_x + "," + p1_y;
        var d = curve1 + " " + verticalLine1 + " " + curve2 + " " + verticalLine2;

        var el = document.createElementNS(SVG_NS, "path");
        el.setAttribute("d", d);
        el.setAttribute(
            "class",
            "ace_diff-connector" + (type == 1 ? " insert" : type == -1 ? " delete" : "")
        );
        diffView.gutterSVG.appendChild(el);
    };
    // generates a Bezier curve in SVG format
    this.getCurve = function(startX, startY, endX, endY) {
        var w = endX - startX;
        var halfWidth = startX + w * 0.5;

        // position it at the initial x,y coords
        var curve =
            "M " +
            startX +
            "," +
            startY +
            // now create the curve. This is of the form "C M,N O,P Q,R" where C is a directive for SVG ("curveto"),
            // M,N are the first curve control point, O,P the second control point and Q,R are the final coords
            " C " +
            halfWidth +
            "," +
            startY +
            " " +
            halfWidth +
            "," +
            endY +
            " " +
            endX +
            "," +
            endY;

        return curve;
    };

    this.createGutter = function() {
        var diffView = this.diffView;
        diffView.gutterWidth = diffView.gutterEl.clientWidth;

        var leftHeight = diffView.left.renderer.$size.height;
        var rightHeight = diffView.right.renderer.$size.height;
        var height = Math.max(leftHeight, rightHeight);

        diffView.gutterSVG = document.createElementNS(SVG_NS, "svg");
        diffView.gutterSVG.setAttribute("width", diffView.gutterWidth);
        diffView.gutterSVG.setAttribute("height", height);

        diffView.gutterEl.appendChild(diffView.gutterSVG);
    };

    this.clearGutter = function(diffView) {
        var gutterEl = diffView.gutterEl;
        gutterEl.removeChild(diffView.gutterSVG);

        this.createGutter();
    };

    this.decorate = function() {
        var diffView = this.diffView;
        if (diffView.$alignDiffs) return;

        this.clearGutter(diffView);

        var orig = diffView.left;
        var edit = diffView.right;
        var chunks = diffView.chunks;
        var c1 = orig.renderer.layerConfig;
        var c2 = edit.renderer.layerConfig;

        // var existing =
        for (var i = 0; i < chunks.length; i++) {
            var ch = chunks[i];
            if (ch.origEnd < c1.firstRow && ch.editEnd < c2.firstRow) continue;

            if (ch.origStart > c1.lastRow && ch.editStart > c2.lastRow) break;

            var origStart =
                orig.renderer.$cursorLayer.getPixelPosition(
                    {
                        row: ch.origStart,
                        column: 0,
                    },
                    true
                ).top - c1.offset;
            var origEnd =
                orig.renderer.$cursorLayer.getPixelPosition(
                    {
                        row: ch.origEnd,
                        column: 0,
                    },
                    true
                ).top - c1.offset;
            var editStart =
                edit.renderer.$cursorLayer.getPixelPosition(
                    {
                        row: ch.editStart,
                        column: 0,
                    },
                    true
                ).top - c2.offset;
            var editEnd =
                edit.renderer.$cursorLayer.getPixelPosition(
                    {
                        row: ch.editEnd,
                        column: 0,
                    },
                    true
                ).top - c2.offset;

            if (i == chunks.length - 1) {
                if (ch.origEnd >= orig.session.getLength()) origEnd += c1.lineHeight;
                if (ch.origStart >= orig.session.getLength()) origStart += c1.lineHeight;
                if (ch.editEnd >= edit.session.getLength()) editEnd += c1.lineHeight;
                if (ch.editStart >= edit.session.getLength()) editStart += c1.lineHeight;
            }

            this.addConnector(diffView, origStart, origEnd, editStart, editEnd, ch.type);
        }
    };
}.call(Connector.prototype));
*/

class ModifiedDiffHighlight {
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

    updateOriginalEditor(html, markerLayer, session, config, ignoreTrimWhitespace = true) {
        var start = config.firstRow;
        var end = config.lastRow;

        var diffView = this.diffView;
        var lineChanges = diffView.chunks;

        for (const lineChange of lineChanges) {

            if (isChangeOrDelete(lineChange)) {
                let range = new Range(lineChange.origStart, 0, lineChange.origEnd, 1 << 30);
                let makeRed = "inline";
                //TODO: ??
                /*if (!isChangeOrInsert(lineChange) || !lineChange.charChanges) {
                    makeRed = "inline";
                }*/
                markerLayer.drawFullLineMarker(html, range.clipRows(start, end).toScreenRange(session), "ace_diff " + "delete " + makeRed, //TODO:
                    config
                );


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
                                    var screenRange = range.clipRows(start, end).toScreenRange(session);
                                    markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff inline " + "delete", //TODO:
                                        config
                                    );
                                }
                            }
                            else {
                                let range = new Range(charChange.originalStartLineNumber,
                                    charChange.originalStartColumn, charChange.originalEndLineNumber,
                                    charChange.originalEndColumn
                                );
                                var screenRange = range.clipRows(start, end).toScreenRange(session);
                                if (screenRange.isMultiLine()) {
                                    markerLayer.drawTextMarker(html, range, "ace_diff inline " + "delete", //TODO:
                                        config
                                    );
                                }
                                else {
                                    markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff inline " + "delete", //TODO:
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

    updateModifiedEditor(html, markerLayer, session, config, ignoreTrimWhitespace = true) {
        var start = config.firstRow;
        var end = config.lastRow;

        var diffView = this.diffView;
        var lineChanges = diffView.chunks;

        for (const lineChange of lineChanges) {

            // Arrows for reverting changes.
            /*if (renderMarginRevertIcon) {
                if (lineChange.modifiedEndLineNumber > 0) {
                    result.decorations.push({
                        range: new Range(lineChange.modifiedStartLineNumber, 1, lineChange.modifiedStartLineNumber, 1),
                        options: DECORATIONS.arrowRevertChange
                    });
                } else {
                    const viewZone = zones.modified.find(z => z.afterLineNumber === lineChange.modifiedStartLineNumber);
                    if (viewZone) {
                        viewZone.marginDomNode = createViewZoneMarginArrow();
                    }
                }
            }*/

            if (isChangeOrInsert(lineChange)) {
                let range = new Range(lineChange.editStart, 0, lineChange.editEnd, 1 << 30);
                let makeGreen = "inline";
                //TODO:
                /*  if (!isChangeOrDelete(lineChange) || !lineChange.charChanges) {
                      makeGreen = "inline"
                  }*/
                markerLayer.drawFullLineMarker(html, range.clipRows(start, end).toScreenRange(session), "ace_diff " + "insert " + makeGreen, //TODO:
                    config
                );


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
                                    var screenRange = range.clipRows(start, end).toScreenRange(session);
                                    markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff inline " + "insert", //TODO:
                                        config
                                    );
                                }
                            }
                            else {
                                let range = new Range(charChange.modifiedStartLineNumber,
                                    charChange.modifiedStartColumn, charChange.modifiedEndLineNumber,
                                    charChange.modifiedEndColumn
                                );
                                var screenRange = range.clipRows(start, end).toScreenRange(session);
                                if (screenRange.isMultiLine()) {
                                    markerLayer.drawTextMarker(html, range, "ace_diff inline " + "insert", //TODO:
                                        config
                                    );
                                }
                                else {
                                    markerLayer.drawSingleLineMarker(html, screenRange, "ace_diff inline " + "insert", //TODO:
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
