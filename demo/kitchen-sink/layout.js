var p = app._ace.container
while (!p.classList.contains("session_page"))p =p.parentNode
var node = p
function rmClass(ch, cls) {
    for (var i = 0; i < ch.length; i++) {
        if (ch[i].classList)
            ch[i].classList.remove(cls)
    }
}
var classes = [
"fsSibling","fsNode","fsParent",
"fsSibling-in", "fsNode-in", "fsParent-in",
"fsSibling-out", "fsNode-out", "fsParent-out",
]
function restore() {
    classes.forEach(function(x) {
        rmClass(document.querySelectorAll("." + x), x)
    })
}

function maximize() {
    node.classList.add("fsNode")
    var parent = node
    while (parent = parent.parentNode) {
        if (parent == document.body) break
        if (parent.classList)
            parent.classList.add("fsParent")
        var ch = parent.childNodes
        for (var i = 0; i < ch.length; i++) {
            if (ch[i] != node && ch[i].classList)
                if (!ch[i].classList.contains("fsParent"))
                    ch[i].classList.add("fsSibling")
        }
    }
}

document.getElementById("xcx") && document.getElementById("xcx").remove()
require("ace/lib/dom").importCssString(`
    .fsParent {overflow: visible}
    .fsNode {
        position: fixed!important; top:0!important; left:0!important;
        right:0!important; bottom: 0!important;
    }
    .fsSibling {
       // visibility: hidden!important;  
       z-index: -1!important;
    }

`, "xcx")

document.querySelectorAll(".fsParent")

if (window.csstt != null) {
        node.style.top = ""
        node.style.left = ""
        node.style.right = ""
        node.style.bottom = ""
    restore()
    node.style.cssText= window.csstt
    window.csstt = null
} else {
    window.csstt = node.style.cssText
    r = node.getBoundingClientRect()
    maximize()

    node.style.top = node.style.left = node.style.right = node.style.bottom = ""
    node.style.transition =  "" 
    node.style.cssText += 
    "top:" + r.top + "px!important;" + 
    "left:" + r.left + "px!important;" + 
    "right:" + (window.innerWidth - r.right) + "px!important;" + 
    "bottom:" + (window.innerHeight - r.bottom) + "px!important;"
// node.style.zIndex="111111111"
    node.getBoundingClientRect()
            node.style.transition =  "0.15s all cubic-bezier(0,0,0.32,1)" 
    node.getBoundingClientRect()
        node.style.top = "0"
        node.style.left = "0"
        node.style.right = "0"
        node.style.bottom = "0"
}


//-----------------------------------------------------------------------------------------------


var dom = require("ace/lib/dom")
var event = require("ace/lib/event")
s = document.getElementById("x.css")
if (s) s.remove()
dom.importCssString(`
.splitter {
    background: #000; 
    z-index:10;
    position: absolute;
}

.splitter-h {
    width: 1px;
    cursor: ew-resize;
    box-shadow: 1px 1px 0px rgba(143, 143, 143, 0.14);
}

.splitter-v {
    height: 1px;
    cursor: ns-resize;
    box-shadow: 1px 1px 0px rgba(143, 143, 143, 0.14);
}
.splitter-h div {
    margin-left: -2px;
    width: 5px;
//     background-color: #cccc;
    height: 100%
}
.splitter-v div {
    margin-top: -2px;
    height: 5px;
//     background-color: #cccc;
}
.splitter-h:hover {
   //  margin-left: -2px;
  //  width:3px;
}
.splitter-v:hover {
//     margin-top: -1px;
//     height:3px;
}
.splitter:hover {
//     border-color: #000;
//    background-color: #f00;
}
.box {
    /opacity: 0.9
}
`, "x.css")


var Tabbar = class {

    draw() {
        
    }
    setBox(x, y, w, h) {

    }
}


var SPLIT = 1
var Box = class {
    constructor(options) {
        if (options.splitter != false) {

        }
        this.vertical = options.vertical;
        this.color = options.color;
        this[0] = options[0]
        this[1] = options[1]
        this.ratio = options.ratio || 0.5;
    }
    set direction(v) {
        this.vertical
    }
    onMouseDown(e) {
        var button = e.button;
        if (button !== 0)
            return;
        
        var box = this;
        var rect = this.element.getBoundingClientRect();
        var x = e.clientX;
        var y = e.clientY;

        var onMouseMove = function(e) {
            x = e.clientX;
            y = e.clientY;
            if (box.vertical) {
                box.ratio = (y - rect.top) / rect.height;
            } else {
                box.ratio = (x - rect.left) / rect.width;
            }
            box.ratio = Math.max(0, Math.min(box.ratio, 1));
            box.resize();
        };
        var onResizeEnd = function(e) {
            console.log("---------------")
        };

        event.capture(s, onMouseMove, onResizeEnd);
        return e.preventDefault();
    };
    resize() {
        this.$updateChildSize(...this.box);
    }
    draw() {
        if (!this.element) {
            this.element = dom.buildDom(["div", {class: "box"}])
            this.splitter = dom.buildDom(["div", {class: `splitter splitter${
                this.vertical ? "-v" : "-h"
            }`}, ["div"]])

            this.splitter.onmousedown = this.onMouseDown.bind(this);

            this.element.appendChild(this.splitter)

            this.element.host = this;
            this.element.style.backgroundColor = this.color
            this.element.style.position = "absolute"
            if (this[0]) {
                this[0].draw()
                this.element.appendChild(this[0].element);
            }
            if (this[1]) {
                this[1].draw()
                this.element.appendChild(this[1].element);
            }
        }
    }
    setBox(x, y, w, h) {
        setBox(this.element, x, y, w, h);
        this.box = [x, y, w, h];
        this.$updateChildSize(x, y, w, h);
    }
    $updateChildSize(x, y, w, h) {
        if (!this[0] || !this[1]) {
            this.splitter.style.display = "none"
        } else {
            this.splitter.style.display = ""
        }
        var ratio = this.ratio;
        
        if (this.vertical) {
            var splitH =  h*ratio-SPLIT
            if (this.splitter)
                setBox(this.splitter, 0, splitH, w, "")
            if (this[0])
                this[0].setBox(0, 0, w, splitH)
            if (this[1])
                this[1].setBox(0, splitH + SPLIT, w, h - splitH - SPLIT)
        }
        else {
            var splitW = w*ratio-SPLIT/2
            if (this.splitter)
                setBox(this.splitter, splitW, 0, "", h)
            if (this[0])
                this[0].setBox(0, 0, splitW, h)
            if (this[1])
                this[1].setBox(splitW+SPLIT, 0, w - splitW -SPLIT, h)
        }
    }
}

function setBox(el, x, y, w, h) {
    var s = el.style;
    s.left = x + "px"
    s.top = y + "px"
    s.width = w + "px"
    s.height = h + "px"

}

var Pane = class Pane extends Box {
    constructor(options) {
        super(options)

    }
    draw() {
        if (!this.element) {
            this.element = dom.buildDom(["div", {class: "box"}])
            this.element.style.background = this.color
        }

    }
    $updateChildSize(x, y, w, h) {

    }
}




b = new Box({
    vertical: false,
    0: new Box({
        vertical: false,
        color: "red",
        size: "200px"
    }),
    1: new Box({
        vertical: true,
        // color: "gold" ,
        0: new Pane({
            vertical: false,
            color: "beige",
            size: "40%"
        }),
        1: new Box({
            vertical: false,
            color: "gold",
            size: "60%"
        }),
    }),
})

b.draw()
document.body.innerHTML = ""
document.body.appendChild(b.element)

var onResize = function() {
    b.setBox(0, 0, window.innerWidth, window.innerHeight)
}
window.onresize = onResize
onResize()

b.element






// ------------------------------------------------------------------------




+function (editor) {
var MouseEvent = require("ace/mouse/mouse_event").MouseEvent;

var data = []
 
 var el = editor.container
    var startX, startY;
    var touchStartT;
    var touchEndT;
    var mode = "scroll"
    el.addEventListener("touchstart", function (e) {
       // console.log(e)
        var touches = e.touches;
        var touchObj = touches[0];
        startX = touchObj.clientX;
        startY = touchObj.clientY;
        data.push([Date.now(), startX, startY])

        e.clientX = touchObj.clientX;
        e.clientY = touchObj.clientY;

        var t = e.timeStamp
        console.log(t - touchStartT)

        var ev = new MouseEvent(e, editor)
        var pos = ev.getDocumentPosition()

        if (t - touchStartT < 500 && touches.length == 1) {
            e.preventDefault()
            e.button = 0
            editor.selection.moveToPosition(pos)
            editor.selection.selectWord()
            mode = "select"
        }
        else if (pos.row) {
            mode = "cursor"
        }
        else {
            mode = "scroll"
        }
        touchStartT= t; 
        //console.log(t)
    });
    el.addEventListener("touchend", function (e) {
       // console.log(e)
        // debugger
        var touches = e.touches;
        var touchObj = touches[0];
//         startX = touchObj.clientX;
//         startY = touchObj.clientY;
//         data.push([Date.now(), startX, startY])
    });
    el.addEventListener("touchmove", function (e) {
        var touches = e.touches;
        if (touches.length > 1) return;
        
        var touchObj = touches[0];

        e.wheelX = startX - touchObj.clientX;
        e.wheelY = startY - touchObj.clientY;

        startX = touchObj.clientX;
        startY = touchObj.clientY;

        e.clientX = touchObj.clientX;
        e.clientY = touchObj.clientY;
        
        // editor.$mouseHandler.onMouseEvent("mousemove", e);
        if (mode == "scroll") {
           editor.$mouseHandler.onTouchMove("touchmove", e); 
        }
        else {
            var ev = new MouseEvent(e, editor)
            var pos = ev.getDocumentPosition()
            editor.selection.moveCursorToPosition(pos)
        }
        data.push([Date.now(), startX, startY])
        // 
    });
/*

- touch around cursor
- touch and hold 150ms
- double touch 
- 

*/
}(window.editor)


