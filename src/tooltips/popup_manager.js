
"use strict";


var PopupManager = function () {
    this.popovers = [];
};

(function () {
    this.addPopover = function (popover) {
        this.popovers.push(popover);
        this.updatePopovers();
    };

    this.removePopover = function (popover) {
        const index = this.popovers.indexOf(popover);
        if (index !== -1) {
            this.popovers.splice(index, 1);
            this.updatePopovers();
        }
    };

    this.updatePopovers = function () {
        this.popovers.sort((a, b) => b.priority - a.priority);
        let visiblePopovers = [];

        for (let popover of this.popovers) {
            let shouldDisplay = true;
            for (let visiblePopover of visiblePopovers) {
                if (this.doPopoversOverlap(visiblePopover, popover)) {
                    shouldDisplay = false;
                    break;
                }
            }

            popover.setVisible(shouldDisplay);
            if (shouldDisplay) {
                visiblePopovers.push(popover);
            }
        }
    };

    this.doPopoversOverlap = function (popoverA, popoverB) {
        const rectA = popoverA.getRect();
        const rectB = popoverB.getRect();

        return (rectA.left < rectB.right && rectA.right > rectB.left && rectA.top < rectB.bottom && rectA.bottom
            > rectB.top);
    };
}).call(PopupManager.prototype);

exports.PopupManager = PopupManager;


