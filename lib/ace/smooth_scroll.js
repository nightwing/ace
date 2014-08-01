/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define(function (require, exports, module) {
'use strict';
// How much the force is increased/decreased (at least) per scroll event.
var STEP = 0.00001;
// How much the force is to be reduced each 16 ms (60fps). For instance, if the value is 0.8,
// after 16ms the force will be 80% of what is was initially, after 32ms it will be 0.64% of
// the initial value, and so on.
var FORCE_REDUCTION_FACTOR = 0.8;
// Same as above but to reduce the speed of the page in order to simulate some kind of drag or
// friction.
var PSEUDO_FRICTION = 0.93;
// Maximum magnitude of the force that can be applied to the page.
var MAX_FORCE = 0.08;
// If the speed of the page goes below this value, we just won't update the scroll position and
// we will stop the page.
var SPEED_THRESHOLD = 0.001;

return function(ace) {
    var $scroller = null;
    var scrollerElement = null;
    var velocity = 0.0;
    var force = 0.0;
    var isAnimating = false;
    var lastUpdate = 0;
    var lastScroll = 0;
    var lastPosition = 0;
    
    function update(timestamp) {
        if (!isAnimating) return;
        if (lastUpdate === 0.0) {
            lastUpdate = timestamp;
            return requestAnimationFrame(update);
        }
        var elapsedTime = timestamp - lastUpdate;
        lastUpdate = timestamp;
        var exp = elapsedTime / 16.0;
        force *= Math.pow(FORCE_REDUCTION_FACTOR, exp);
        velocity += force * elapsedTime;
        velocity *= Math.pow(PSEUDO_FRICTION, exp);
        
        if (Math.abs(velocity) < SPEED_THRESHOLD) {
            velocity = 0.0;
            isAnimating = false;
            return;
        }
        var newPosition = Math.round(ace.renderer.scrollTop + velocity * elapsedTime);
        
        if (newPosition !== lastPosition) {
            ace.renderer.scrollTop = newPosition; console.log(newPosition)
            lastPosition = newPosition;
            ace.renderer.$loop.schedule(ace.renderer.CHANGE_SCROLL)
        }
        return requestAnimationFrame(update);    
    }

    function startAnimating() {
        if (isAnimating) return;
        isAnimating = true;
        requestAnimationFrame(update);
    }

    function stopAnimating() { isAnimating = false; }
     
    function onScroll(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // If this is the first scroll, just get the current time and wait for another event.
        if (lastScroll === 0) {
            lastScroll = window.performance.now();
            return;
        }
        
        // Determine how much time has passed since the last scroll event.
        var currentTime = window.performance.now();
        var elapsedTime = currentTime - lastScroll;
        lastScroll = currentTime;
        
        if (elapsedTime === 0.0) { return; }

        // Get the wheel delta from the original webkit event.
        var wheelDelta = -event.domEvent.wheelDeltaY;
        
        var sameDirection = velocity * wheelDelta >= 0.0; // -1*1 = -1 and -1*-1 = 1 so yea.
        
        // If we are scrolling in the same direction as the page is moving, we change the force
        // being applied. Otherwise, we want the page to stop so we reset the force and the 
        // velocity to zero. This way the user can scroll fast in one direction and then just 
        // scroll one click in the opposite direction to stop the page.
        if (sameDirection) {
            var currentStep = wheelDelta * STEP;
            // Add to the force being applied to the page. Note that the less time that has passed
            // since the last scroll event, the more the force will be increased/decreased.
            force += currentStep + currentStep / (elapsedTime * 0.002);
            
            // Make sure we don't apply a ridiculous force... this is not star wars.
            var forceMagnitude = Math.abs(force);
            if (forceMagnitude > MAX_FORCE) { force *= MAX_FORCE / forceMagnitude; }
            startAnimating()
        } else {
            force = 0.0;
            velocity = 0.0;
        }
    }

    function addListeners() {        
        ace.on('mousewheel', onScroll);
    }

    function removeListeners() {
        ace.off('mousewheel', onScroll);
    }
    addListeners()
}
});