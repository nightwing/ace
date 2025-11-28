"use strict";

require("ace/lib/fixoldbrowsers");

var mockdom = require("../test/mockdom");
var AsyncTest = require("asyncjs").test;
var async = require("asyncjs");
var buildDom = require("../lib/dom").buildDom;
var escapeRegExp = require("ace/lib/lang").escapeRegExp;

var useMockdom = location.search.indexOf("mock=1") != -1;
var forceShow = location.search.indexOf("show=1") != -1;

var passed = 0;
var failed = 0;
var log = document.getElementById("log");

// change buildDom to use real document in mockdom 
var createElement = document.createElement.bind(document);
var createTextNode = document.createTextNode.bind(document);
var buildDom = eval("(" + buildDom.toString().replace(/document\./g, "") + ")");

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
    "ace/mode/_test/highlight_rules_test",
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
    return ["a", {href:'?' + name + (useMockdom ? "&mock=1" : "")}, name.replace(/^ace\//, "")];
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
    var reporter = {
        before: function(test) {
            if (!test.name) return;
            var messageHeader = "[" + test.index + "/" + test.count + "]";
            var node = buildDom(["div", {class: test.skip ? "skipped" : "waiting"}, 
                ["a", {href: "#" + escapeRegExp(test.name.replace(/^test\s*/, ""))}, messageHeader],
                " ",                
                test.name,
                ["span", (test.skip ? " SKIP" : " ...")],
            ], log);
            test.reportNode = node;
        },
        after: function(test) {
            if (!test.name) return;
            if (test.passed) {
                passed++;
            } else {
                failed++;
            }

            test.reportNode.className = test.passed ? "passed" : "failed";
            test.reportNode.lastChild.remove()
            buildDom(["span", (test.passed ? " OK" : " FAIL") + "  " + test.time + "ms"], test.reportNode)
        },
        beforeSuite: function(testSuite) {            
            var href = testSuite.href;
            buildDom(["div", {}, testLink(href)], log);
            console.log(href);
        },
        afterSuite: function(test) {

        }
    };

    async function runTest(testSuite, test) {
        var fn = test.fn;
        if (fn.length) {
            var olfFn = fn
            var next
            var callbackPromise = new Promise(function(resolve, reject) {
                next = function(err) {
                    if (err) return reject(err);
                    resolve(err)
                }
            })
            fn = async function() {
                await olfFn.call(test, next);
                await callbackPromise;
            }
        }
        var timeout = testSuite.timeout || 3000
        var timeoutId = setTimeout(function() {
            next(new Error("Source did not respond after " + timeout + "ms!"))
        }, timeout);
        var t = Date.now();
        test.passed = false;
        reporter.before(test);
        try {
            await fn.call(test);
            test.passed = true;
        } finally {
            clearTimeout(timeoutId);
            test.time = Date.now() - t;
        }
        reporter.after(test);
    }

    for (var i = 0; i < testSuites.length; i++) {
        var testSuite = testSuites[i];

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

        reporter.beforeSuite(testSuite)
        if (testSuite.setUpSuite)
            await runTest(testSuite, {fn: testSuite.setUpSuite});
        for (var j = 0; j < testArray.length; j++) {
            var test = testArray[j];
            test.index = j;
            test.count = testArray.length;
            if (test.skip) {
                reporter.before(test);
                continue;
            }
            if (testSuite.setup)
                await runTest(testSuite, {fn: testSuite.setup});
            await runTest(testSuite, test);            
            if (testSuite.tearDown)
                await runTest(testSuite, {fn: testSuite.tearDown});
        }
        if (testSuite.tearDownSuite)
            await runTest(testSuite, {fn: testSuite.tearDownSuite});
        reporter.afterSuite(testSuite)
    }


  
    var node = buildDom(["div", {class: "summary"},
        ["br"], "Summary:", ["br"], ["br"],
        "Total number of tests: " + (passed + failed), ["br"],
        (passed && [null, "Passed tests: " + passed, ["br"]]),
        (failed && [null, "Failed tests: " + failed])
    ], log);
    console.log(node.innerText); 

});
