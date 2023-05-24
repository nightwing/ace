"use strict";
var dom = require("../../lib/dom");
var oop = require("../../lib/oop");
var EventEmitter = require("../../lib/event_emitter").EventEmitter;

class Decorator {
    constructor(parent, renderer) {
        this.parentEl = parent;
        this.canvas = dom.createElement("canvas");
        this.renderer = renderer;
        this.pixelRatio = 1;
        this.maxHeight = renderer.layerConfig.maxHeight;
        this.lineHeight = renderer.layerConfig.lineHeight;
        this.minDecorationHeight = (2 * this.pixelRatio) | 0;
        this.halfMinDecorationHeight = (this.minDecorationHeight / 2) | 0;

        this.canvas.style.top = 0 + "px";
        this.canvas.style.right = 0 + "px";
        this.canvas.style.zIndex = "7";
        this.canvas.style.position = "absolute";
        this.colors = {
            dark: {},
            light: {}
        };
        
        this.setDimensions();

        parent.element.appendChild(this.canvas);
    }

    setDimensions(config, correctHeightRatio = true) {
        if (config) {
            this.maxHeight = config.maxHeight;
            this.lineHeight = config.lineHeight;
            this.canvasHeight = config.height;

            var allLineHeight = (config.lastRow + 1) * this.lineHeight;
            if (correctHeightRatio && allLineHeight < this.canvasHeight) {
                this.heightRatio = 1;
            }
            else {
                this.heightRatio = this.canvasHeight / this.maxHeight;
            }
        }
        else {
            this.canvasHeight = this.parentEl.parent.scrollHeight || this.canvasHeight;
            this.canvasWidth = this.parentEl.parent.width || this.canvasWidth;
            this.heightRatio = this.canvasHeight / this.maxHeight;

            this.canvas.width = this.canvasWidth;
            this.canvas.height = this.canvasHeight;
        }
    }
    
    compensateFoldRows(row) {
        let foldData = this.renderer.session.$foldData;
        let compensateFold = 0;
        if (foldData && foldData.length > 0) {
            for (let j = 0; j < foldData.length; j++) {
                if (row > foldData[j].start.row && row < foldData[j].end.row) {
                    compensateFold += row - foldData[j].start.row;
                }
                else if (row >= foldData[j].end.row) {
                    compensateFold += foldData[j].end.row - foldData[j].start.row;
                }
            }
        }
        return compensateFold;
    }

    compensateLineWidgets(row) {
        const widgetManager = this.renderer.session.widgetManager;
        if (widgetManager) {
            let delta = 0;
            widgetManager.lineWidgets.forEach((el, index) => {
                if (row > index) {
                    delta += el.rowCount || 0;
                }
            });
            return delta - 1;
        }
        return 0;
    }
}

oop.implement(Decorator.prototype, EventEmitter);

exports.Decorator = Decorator;
