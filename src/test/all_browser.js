"use strict";

require("ace/lib/fixoldbrowsers");

var mockdom = require("../test/mockdom");
var buildDom = require("../lib/dom").buildDom;
var escapeRegExp = require("ace/lib/lang").escapeRegExp;

var useMockdom = location.search.indexOf("mock=1") != -1;
var forceShow = location.search.indexOf("show=1") != -1;

var log = document.getElementById("log");
var documentElement = document.documentElement;

// change buildDom to use real document in mockdom 
var createElement = document.createElement.bind(document);
var createTextNode = document.createTextNode.bind(document);
var buildDom = eval("(" + buildDom.toString().replace(/document\./g, "") + ")");

window.onerror = function name(...params) {
    console.log(">>>>>>>>>>>>>>", ...params)
}
window.addEventListener('unhandledrejection', (event) => {
    console.log("Unhandled promise rejection:", event.promise, event.reason);
});


var testNames = [
    "ace/ace_test",
    "ace/anchor_test",
    "ace/autocomplete/inline_test",
    "ace/autocomplete/popup_test",
    "ace/autocomplete_test",
    "ace/background_tokenizer_test",
    "ace/commands/command_manager_test",
    "ace/config_test",
    "ace/document_test",
    "ace/edit_session_test",
    "ace/editor_change_document_test",
    "ace/editor_commands_test",
    "ace/editor_highlight_selected_word_test",
    "ace/editor_navigation_test",
    "ace/editor_options_test",
    "ace/editor_text_edit_test",
    "ace/ext/beautify_test",
    "ace/ext/code_lens_test",
    "ace/ext/command_bar_test",
    "ace/ext/diff/diff_test",
    "ace/ext/emmet_test",
    "ace/ext/error_marker_test",
    "ace/ext/hardwrap_test",
    "ace/ext/inline_autocomplete_test",
    "ace/ext/simple_tokenizer_test",
    "ace/ext/static_highlight_test",
    "ace/ext/whitespace_test",
    "ace/incremental_search_test",
    "ace/keyboard/emacs_test",
    "ace/keyboard/gutter_handler_test",
    "ace/keyboard/keybinding_test",
    "ace/keyboard/sublime_test",
    "ace/keyboard/textinput_test",
    "ace/keyboard/vim_ace_test",
    "ace/keyboard/vim_test",
    "ace/layer/gutter_test",
    "ace/layer/text_test",
    "ace/lib/event_emitter_test",
    "ace/marker_group_test",
    // "ace/mode/_test/highlight_rules_test",
    "ace/mode/ada_test",
    "ace/mode/behaviour/behaviour_test",
    "ace/mode/coldfusion_test",
    "ace/mode/css_test",
    "ace/mode/folding/basic_test",
    "ace/mode/folding/coffee_test",
    "ace/mode/folding/cstyle_test",
    "ace/mode/folding/drools_test",
    "ace/mode/folding/fold_mode_test",
    "ace/mode/folding/html_test",
    "ace/mode/folding/javascript_test",
    "ace/mode/folding/latex_test",
    "ace/mode/folding/lua_test",
    "ace/mode/folding/php_test",
    "ace/mode/folding/pythonic_test",
    "ace/mode/folding/ruby_test",
    "ace/mode/folding/vbscript_test",
    "ace/mode/folding/xml_test",
    "ace/mode/folding/yaml_test",
    "ace/mode/html_test",
    "ace/mode/javascript_test",
    "ace/mode/logiql_test",
    "ace/mode/odin_test",
    "ace/mode/php_test",
    "ace/mode/plain_text_test",
    "ace/mode/python_test",
    "ace/mode/ruby_test",
    "ace/mode/text_test",
    "ace/mode/vbscript_test",
    "ace/mode/xml_test",
    "ace/mouse/default_gutter_handler_test",
    "ace/mouse/mouse_handler_test",
    "ace/multi_select_test",
    "ace/occur_test",
    "ace/placeholder_test",
    "ace/range_list_test",
    "ace/range_test",
    "ace/scrollbar_test",
    "ace/search_test",
    "ace/selection_test",
    "ace/snippets_test",
    "ace/test/mockdom_test",
    "ace/token_iterator_test",
    "ace/tokenizer_test",
    "ace/tooltip_test",
    "ace/undomanager_test",
    "ace/virtual_renderer_test"
];

var html = [
    useMockdom
        ? ["a", {href: normalizeHref(location.search.replace('mock=1', '')) + location.hash}, "do not use mockdom"]
        : ["a", {href: normalizeHref(location.search + '&mock=1') + location.hash}, "use mockdom"],
    ["br"],
    forceShow
        ? ["a", {href: normalizeHref(location.search.replace('show=1', '')) + location.hash}, "hide mock renderer"]
        : ["a", {href: normalizeHref(location.search + '&show=1') + location.hash}, "show mock renderer"],
    ["br"],
    ["a", {href: '?runall' + (useMockdom ? "&mock=1" : "")}, "Run all tests"], ["br"],
    ["hr"]
];
for (var i in testNames) {    
    html.push(testLink(testNames[i]), ["br"]);
}

function testLink(name) {
    return ["a", {href:'?' + name + (useMockdom ? "&mock=1" : "")}, name.replace(/^ace\//, "") + ".js"];
}
function normalizeHref(str) {
    return str.replace(/([?&])&+/g, "$1");
}

var nav = buildDom(["div", {style: "position:absolute;right:0;top:0"}, html], document.body);


if (forceShow) {
    // @ts-ignore
    require(["ace/virtual_renderer", "ace/test/mockrenderer"], function(real, mock) {
        var VirtualRenderer = real.VirtualRenderer;
        mock.MockRenderer = function() {
            var el = document.createElement("div");
            el.style.position = "fixed";
            el.style.left = "20px";
            el.style.top = "30px";
            el.style.width = "500px";
            el.style.height = "300px";
            document.body.appendChild(el);
            
            return new VirtualRenderer(el);
        };
    });
}

if (useMockdom) {
    mockdom.loadInBrowser(window);
}

var selectedTests = [];
if (location.search) {
    var parts = location.search.split(/[&?]|\w+=\w+/).filter(Boolean);
    if (parts[0] == "runall")
        selectedTests = testNames;
    else
        selectedTests = parts[0].split(",");
}
var filter = decodeURIComponent(location.hash.substr(1));
window.onhashchange = function() { location.reload(); };

// @ts-ignore
require(selectedTests, async function() {
    var testSuites = selectedTests.map(function(x) {
        var module = require(x);
        module.href = x;
        return module;
    });

    var failed = 0;
    var passed = 0;
    var skipped = 0;
    var reporter = {
        beforeEach: function(test) {
            if (!test.name) return;
            var messageHeader = "[" + test.index + "/" + test.count + "]";
            var node = buildDom(["div", {class: test.skip ? "skipped" : "waiting"}, 
                ["a", {href: "#" + escapeRegExp(test.name.replace(/^test\s*/, ""))}, messageHeader],
                " ",                
                test.name,
                ["span", (test.skip ? " SKIP" : " ...")],
            ], log);
            test.reportNode = node;
            console.log(messageHeader + test.name);
        },
        afterEach: function(test) {
            if (!log.parentElement) {
                documentElement.appendChild(log)
                debugger
            }
            if (!test.name) return;
            if (test.skip) {
                skipped++
                return;
            } else if (test.passed) {
                passed++;
            } else {
                failed++;
            }

            test.reportNode.className = test.passed ? "passed" : "failed";
            test.reportNode.lastChild.remove()
            buildDom(["span", (test.passed ? " OK" : " FAIL") + "  " + test.time + "ms"], test.reportNode)
            if (test.error && test.error != true)
                buildDom(["pre", {class: "error"}, test.error + ""], log);
            if (test.error) console.log(test.fn);
        },
        before: function(testSuite) {
            var counter = " [" + testSuite.index + "/" + testSuite.count + "]";
            var href = testSuite.href;
            buildDom(["div", {}, testLink(href), counter], log);
            console.log(href, counter);
        },
        after: function(test) {

        },
        done: function() {
            if (!log.parentElement) {
                documentElement.appendChild(log)
                debugger
            }
            var node = buildDom(["div", {class: "summary"},
                ["br"], "Summary:", ["br"], ["br"],
                "Total number of tests: " + (passed + failed + skipped), ["br"],
                (passed && [null, "Passed tests: " + passed, ["br"]]),
                (passed && [null, "Passed tests: " + skipped, ["br"]]),
                (failed && [null, "Failed tests: " + failed])
            ], log);
            console.log(node.innerText); 
        }
    };

    var stepIndex = 0
    async function runStep() {
        try {
            var step = steps[stepIndex++];
            if (!step) return;
            if (step.type == "before") {
                reporter.before(step.testSuite);
            }
            try {
                if (step.fn) await runTimed(step)
            } finally {
                if (step.type == "after") {
                    reporter.after(step.testSuite);
                } else if (step.type == "done") {
                    reporter.done();
                }
            }
        } finally {
            if (!step) return;
            // if (step.error) {
            //     console.log("---------------------------->>")
            //     setTimeout(function() {
            //         console.log("---------------------------->><<")
            //         runStep()
            //     }, 1000)
            //     return
            // }
            setTimeout(runStep,0);
        }
    }
    async function runTimed(step, callback) {
        var fn = step.fn;
        var testSuite = step.testSuite;

        var resolve;
        var result = new Promise(function(resolve_, reject_) {
            resolve = resolve_;
        });
        result.name = step.name;

        var doneCalled = false;
        var done = function(error) {
            if (doneCalled) return;
            if (error) step.error = error;
            step.passed = !step.error;
            clearTimeout(timeoutId);
            step.time = Date.now() - t;
            doneCalled = true;
            resolve();
            reporter.afterEach(step);
        };
        var timeout = testSuite.timeout || 3000;
        var interactiveTimeStep = 100;
        var remainingTime = timeout;
        var timeoutId = setTimeout(function wait() {
            remainingTime -= interactiveTimeStep;
            if (remainingTime > 0) {
                timeoutId = setTimeout(wait, Math.min(interactiveTimeStep, remainingTime))
            } else {
                done(new Error("Source did not respond after " + timeout + "ms!"))
            }
        }, Math.min(interactiveTimeStep, remainingTime));
        
        var t = Date.now();
        step.passed = false;
        reporter.beforeEach(step);
        var callFailed = true;
        try {
            (fn.length ? fn.call(step, done) : fn.call(step));
            callFailed = false;
        } finally {
            if (!fn.length)
                done(callFailed)
            return result;
        }
    }


    var steps = [];
    for (var i = 0; i < testSuites.length; i++) {
        var testSuite = testSuites[i];
        testSuite.index = i + 1;
        testSuite.count = testSuites.length;

        var testArray = [];
        Object.keys(testSuite).forEach(name => {
            if (!name.match(/^>?test/))
                return;
            var test = {name, testSuite, fn: testSuite[name]};
            if (filter && !test.name.match(filter)) {
                test.skip = true;
            }
            testArray.push(test);
        })

        if (!testArray.length) continue;

        steps.push({type: "before", testSuite, fn: testSuite.setUpSuite})
        for (var j = 0; j < testArray.length; j++) {
            var test = testArray[j];
            test.index = j + 1;
            test.count = testArray.length;  
            steps.push({type: "beforeEach", testSuite, fn: testSuite.setUp});
            steps.push(test);
            steps.push({type: "afterEach", testSuite, fn: testSuite.tearDown});
        } 
        steps.push({type: "after", testSuite, fn: testSuite.tearDownSuite});
    }

    steps.push({type: "done"})

    runStep();
});
