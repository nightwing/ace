"use strict";
var Decorator = require("./decorators").Decorator;

class DiffDecorator extends Decorator {
    zones = [];

    constructor(parent, renderer) {
        super(parent, renderer);

        this.canvasWidth = parent.width;
        
        this.colors.dark = {
            "delete": "rgba(255, 18, 18, 1)",
            "insert": "rgba(18, 136, 18, 1)"
        };

        this.colors.light = {
            "delete": "rgb(255,51,51)",
            "insert": "rgb(32,133,72)"
        };
        
    }

    addZone(startRow, endRow, type) {
        this.zones.push({
            startRow,
            endRow,
            type
        });
    }

    $updateDecorators(config) {
        var colors = (this.renderer.theme.isDark === true) ? this.colors.dark : this.colors.light;
        this.setDimensions(config, false);

        var ctx = this.canvas.getContext("2d");

        function compare(a, b) {
            if (a.priority === b.priority) {
                if (a.from === b.from) {
                    return a.to - b.to;
                }
                return a.from - b.from;
            }
            return a.priority - b.priority;
        }

        var zones = this.zones;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (zones) {
            var resolvedZones = [];
            var priorities = {
                "delete": 0,
                "insert": 1
            };

            for (let i = 0; i < zones.length; i++) {
                const offset1 = this.getVerticalOffsetForRow(zones[i].startRow);
                const offset2 = this.getVerticalOffsetForRow(zones[i].endRow) + this.lineHeight;
                
                const y1 = Math.round(this.heightRatio * offset1);
                const y2 = Math.round(this.heightRatio * offset2);

                let ycenter = Math.round((y1 + y2) / 2);
                let halfHeight = (y2 - ycenter);

                if (halfHeight < this.halfMinDecorationHeight) {
                    halfHeight = this.halfMinDecorationHeight;
                }

                if (ycenter - halfHeight < 0) {
                    ycenter = halfHeight;
                }
                if (ycenter + halfHeight > this.canvasHeight) {
                    ycenter = this.canvasHeight - halfHeight;
                }

                resolvedZones.push({
                    from: ycenter - halfHeight,
                    to: ycenter + halfHeight,
                    priority: priorities[zones[i].type],
                    color: colors[zones[i].type] || null
                });
            }

            resolvedZones = resolvedZones.sort(compare);

            let currentPriority = 0;
            let currentFrom = 0;
            let currentTo = 0;

            for (const zone of resolvedZones) {
                ctx.fillStyle = zone.color || null;

                const zoneFrom = zone.from;
                const zoneTo = zone.to;
                const zonePriority = zone.priority;

                if (zonePriority !== currentPriority) {
                    ctx.fillRect(0, currentFrom, this.canvasWidth, currentTo - currentFrom);

                    currentPriority = zonePriority;
                    ctx.fillStyle = zone.color || null;
                    currentFrom = zoneFrom;
                    currentTo = zoneTo;
                }
                else {
                    if (currentTo >= zoneFrom) {
                        currentTo = Math.max(currentTo, zoneTo);
                    }
                    else {
                        ctx.fillRect(0, currentFrom, this.canvasWidth, currentTo - currentFrom);
                        currentFrom = zoneFrom;
                        currentTo = zoneTo;
                    }
                }
            }

            ctx.fillRect(0, currentFrom, this.canvasWidth, currentTo - currentFrom);
        }

        var cursor = this.renderer.session.selection.getCursor();
        if (cursor) {
            let currentY = Math.round(this.getVerticalOffsetForRow(cursor.row) * this.heightRatio);
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, currentY, this.canvasWidth, 2);
        }

    }

    getVerticalOffsetForRow(row) {
        row = row | 0;

        let previousLinesHeight;
        if (row > 1) {
            previousLinesHeight = this.lineHeight * row;
        }
        else {
            previousLinesHeight = 0;
        }

        return previousLinesHeight + this.compensateFoldRows(row) + this.compensateLineWidgets(row);
    }
}

exports.DiffDecorator = DiffDecorator;
