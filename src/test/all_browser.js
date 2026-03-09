"use strict";

require("ace/lib/fixoldbrowsers");

var mockdom = require("../test/mockdom");
var buildDom = require("../lib/dom").buildDom;
var escapeRegExp = require("ace/lib/lang").escapeRegExp;

var useMockdom = location.search.indexOf("mock=1") != -1;
var forceShow = location.search.indexOf("show=1") != -1;

var documentElement = document.documentElement;
var log = buildDom(["div", {id: "log"}], documentElement);

// change buildDom to use real document in mockdom 
var createElement = document.createElement.bind(document);
var createTextNode = document.createTextNode.bind(document);
var buildDom = eval("(" + buildDom.toString().replace(/document\./g, "") + ")");

window.onerror = function name(...params) {
    console.error(">>>>>>>>>>>>>>", ...params)
}
window.addEventListener('unhandledrejection', (event) => {
    console.error("Unhandled promise rejection:", event.promise, event.reason);
});

var testNames = require("./test_list");

var html = [
    ["div", {ref: "summary"}],
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
function testHref(suiteName, name) {
    var href = '?' + suiteName + (useMockdom ? "&mock=1" : "");
    if (name) href += "#" + escapeRegExp(name.replace(/^test\s*/, ""));
    return href;
}
function testLink(name) {
    return ["a", {href: testHref(name)}, name.replace(/^ace\//, "") + ".js"];
}
function normalizeHref(str) {
    return str.replace(/([?&])&+/g, "$1");
}

var refs = {};
var nav = buildDom(["div", {id: "sidebar"}, html], documentElement, refs);


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
            var messageHeader =  "[" + test.index + "/" + test.count + "]";
            var node = buildDom(["div", {class: test.skip ? "skipped" : "waiting"}, 
                ["a", {href: testHref(test.testSuite.href, test.name)}, messageHeader],
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

            refs.summary.innerText = "Passed: " + passed + ", Failed: " + failed + ", Skipped: " + skipped;
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
            (fn.length ? fn.call(testSuite, done) : fn.call(testSuite));
            callFailed = false;
        } finally {
            if (!fn.length)
                done(callFailed)
            return result;
        }
    }

var currentStep
var waitForStepCallback;
var watchdog
async function runAll() {
    watchdog = setInterval(() => {
        if (!currentStep) return;
        currentStep.interactiveTime = (currentStep.interactiveTime || 0) + 50;
        if (currentStep.interactiveTime >= currentStep.timeout) {
            if (currentStep.error == undefined)
                currentStep.error = new Error("Source did not respond after " + (currentStep.timeout || 0) + "ms!");
            waitForStepCallback()
        }
    }, 50);
    while (currentStep = steps.shift()) {
        currentStep.timeout = (currentStep?.testSuite.timeout || 3000);
        var waitForStep = new Promise(resolve => { waitForStepCallback = resolve });
        setTimeout(runOne, 0);
        await waitForStep
    }
    clearInterval(watchdog);
}
async function runOne() {
    debugger
    waitForStepCallback()
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

    // runAll() 
});
