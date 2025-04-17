"use strict";

var LineWidgets = require("ace/line_widgets").LineWidgets;
var TextLayer = require("ace/layer/text").Text;
var MarkerLayer = require("ace/layer/marker").Marker;
var EditSession = require("ace/edit_session").EditSession;

const {BaseDiffView} = require("./base_diff_view");
const config = require("ace/config");

class InlineDiffView extends BaseDiffView {
    /**
     * Constructs a new inline DiffView instance.
     * @param {Object} [diffModel] - The model for the diff view.
     * @param {import("ace-code").Editor} [diffModel.editorA] - The editor for the original view.
     * @param {import("ace-code").Editor} [diffModel.editorB] - The editor for the edited view.
     * @param {import("ace-code").EditSession} [diffModel.sessionA] - The edit session for the original view.
     * @param {import("ace-code").EditSession} [diffModel.sessionB] - The edit session for the edited view.
     * @param {string} [diffModel.valueA] - The original content.
     * @param {string} [diffModel.valueB] - The modified content.
     * @param {boolean} [diffModel.showSideA] - Whether to show the original view or modified view.
     * @param {HTMLElement} [container] - optional container element for the DiffView.
     */
    constructor(diffModel, container) {
        diffModel = diffModel || {};
        super( true, container);
        this.init(diffModel);
    }

    init(diffModel) {
        this.showSideA = diffModel.showSideA == undefined ? true : diffModel.showSideA;

        this.onInput = this.onInput.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onAfterRender = this.onAfterRender.bind(this);

        this.$setupModels(diffModel);
        this.onChangeTheme();
        config.resetOptions(this);
        config["_signal"]("diffView", this);

        this.textLayer = new TextLayer(this.activeEditor.renderer.content);
        this.textLayer.setSession(this.otherSession);
        this.textLayer.setPadding(4);
        this.markerLayer = new MarkerLayer(this.activeEditor.renderer.content);
        this.markerLayer.setSession(this.otherSession);
        this.markerLayer.setPadding(4);
        //this.markerLayer.element.style.position = "static"; //TODO: check for side effects
        
        this.markerLayer.element.parentNode.insertBefore(
            this.markerLayer.element,
            this.markerLayer.element.parentNode.firstChild
        );

        this.$attachEventHandlers();
    }

    align() {
        var diffView = this;

        function add(session, w) {
            let lineWidget = session.lineWidgets[w.row];
            if (lineWidget) {
                w.rowsAbove += lineWidget.rowsAbove > w.rowsAbove ? lineWidget.rowsAbove : w.rowsAbove;
                w.rowCount += lineWidget.rowCount;
            }
            session.lineWidgets[w.row] = w;
            session.widgetManager.lineWidgets[w.row] = w;
        }

        var init = (session) => {
            if (!session.widgetManager) {
                session.widgetManager = new LineWidgets(session);
                if (session.$editor) session.widgetManager.attach(session.$editor);
            }
            session.lineWidgets = [];
            session.widgetManager.lineWidgets = [];
            this.textLayer.element.innerHTML = "";
        };

        init(diffView.diffSession.sessionA);
        init(diffView.diffSession.sessionB);

        diffView.chunks.forEach(function (ch) {
            var diff1 = ch.old.end.row - ch.old.start.row;
            var diff2 = ch.new.end.row - ch.new.start.row;



            //TODO: diffView.showSideA is not used
            let sessionA = diffView.diffSession.sessionA;
            let sessionB = diffView.diffSession.sessionB;
            if (!diffView.showSideA) {
                [sessionA, sessionB] = [sessionB, sessionA];
            }
            add(sessionA, {
                rowCount: diff2,
                rowsAbove: ch.old.end.row === 0 ? diff2 : 0,
                row: ch.old.end.row === 0 ? 0 : ch.old.end.row - 1
            });
            add(sessionB, {
                rowCount: diff1,
                rowsAbove: diff1,
                row: ch.new.start.row,
            });

        });
        diffView.diffSession.sessionA["_emit"]("changeFold", {data: {start: {row: 0}}});
        diffView.diffSession.sessionB["_emit"]("changeFold", {data: {start: {row: 0}}});
    }

    onSelect(e, selection) {
        var selectionRange = selection.getRange();
        this.findChunkIndex(this.chunks, selectionRange.start.row, false);
    }

    $attachSessionsEventHandlers() {
        if (this.showSideA) {
            this.activeEditor = this.editorA;
            this.otherSession = this.diffSession.sessionB;
        } else {
            this.activeEditor = this.editorB;
            this.otherSession = this.diffSession.sessionA;
        }
        // this.otherSession = EditSession.fromJSON(this.otherSession.toJSON());//TODO attempt to not mess with sessions

        let activeMarker, dynamicMarker;
        if (this.showSideA) {
            activeMarker = this.markerA;
            dynamicMarker = this.markerB;
        } else {
            activeMarker = this.markerB;
            dynamicMarker = this.markerA;
        }
        this.$attachSessionEventHandlers(this.activeEditor, activeMarker);
        this.otherSession.addDynamicMarker(dynamicMarker);
    }

    $attachSessionEventHandlers(editor, marker) {
        editor.session.addDynamicMarker(marker);
        editor.selection.on("changeCursor", this.onSelect);
        editor.selection.on("changeSelection", this.onSelect);
    }

    $detachSessionsEventHandlers() {
        let activeMarker, dynamicMarker;//TODO: duplicate code
        if (this.showSideA) {
            activeMarker = this.markerA;
            dynamicMarker = this.markerB;
        } else {
            activeMarker = this.markerB;
            dynamicMarker = this.markerA;
        }
        this.$detachSessionEventHandlers(this.activeEditor, activeMarker);
        this.otherSession.removeMarker(dynamicMarker.id);
        this.otherSession.bgTokenizer.lines.fill(undefined);
    }

    $detachSessionEventHandlers(editor, marker) {
        editor.session.removeMarker(marker.id);
        editor.selection.off("changeCursor", this.onSelect);
        editor.selection.off("changeSelection", this.onSelect);
    }

    $attachEventHandlers() {
        this.activeEditor.on("input", this.onInput);
        this.activeEditor.renderer.on("afterRender", this.onAfterRender);
    }

    $detachEventHandlers() {
        this.$detachSessionsEventHandlers();
        this.activeEditor.off("input", this.onInput);
        this.activeEditor.renderer.off("afterRender", this.onAfterRender);

        this.activeEditor.renderer["$scrollDecorator"].zones = [];
        this.activeEditor.renderer["$scrollDecorator"].$updateDecorators(this.activeEditor.renderer.layerConfig);

        this.textLayer.element.textContent = "";
        this.markerLayer.element.textContent = "";
    }

    /**
     * @param {number} changes
     * @param {import("ace-code").VirtualRenderer} renderer
     */
    onAfterRender(changes, renderer) {
        var config = renderer.layerConfig;

        function filterLines(lines, chunks) {
            var i = 0;
            var nextChunkIndex = 0;

            var nextChunk = chunks[nextChunkIndex];
            nextChunkIndex++;
            var nextStart = nextChunk ? nextChunk.old.start.row : lines.length;
            var nextEnd = nextChunk ? nextChunk.old.end.row : lines.length;
            while (i < lines.length) {
                while (i < nextStart) {
                    if (lines[i] && lines[i].length) lines[i].length = 0;
                    i++;
                }
                while (i < nextEnd) {
                    if (lines[i] && lines[i].length == 0) lines[i] = undefined;
                    i++;
                }
                nextChunk = chunks[nextChunkIndex];
                nextChunkIndex++;
                nextStart = nextChunk ? nextChunk.old.start.row : lines.length;
                nextEnd = nextChunk ? nextChunk.old.end.row : lines.length;
            }
        }

        filterLines(this.otherSession.bgTokenizer.lines, this.chunks);//TODO messes text layers

        var session = this.otherSession;

        session.$scrollTop = renderer.scrollTop;
        session.$scrollLeft = renderer.scrollLeft;

        var cloneRenderer = {
            scrollTop: renderer.scrollTop,
            scrollLeft: renderer.scrollLeft,
            $size: renderer.$size,
            session: session,
            $horizScroll: renderer.$horizScroll,
            $vScroll: renderer.$vScroll,
            $padding: renderer.$padding,
            scrollMargin: renderer.scrollMargin,
            characterWidth: renderer.characterWidth,
            lineHeight: renderer.lineHeight,
            $computeLayerConfig: renderer.$computeLayerConfig,
            $getLongestLine: renderer.$getLongestLine,
            scrollBarV: {
                setVisible: function () {}
            },
            scrollBarH: {
                setVisible: function () {}
            },
            layerConfig: renderer.layerConfig,
            $updateCachedSize: function () {},
            _signal: function () {},
        };

        cloneRenderer.$computeLayerConfig();

        console.log(config, cloneRenderer.layerConfig);
        var newConfig = cloneRenderer.layerConfig;
        newConfig.firstRowScreen = config.firstRowScreen;

        this.textLayer.update(newConfig);

        this.markerLayer.setMarkers(this.otherSession.getMarkers());
        this.markerLayer.update(newConfig);
    }

}



exports.InlineDiffView = InlineDiffView;
