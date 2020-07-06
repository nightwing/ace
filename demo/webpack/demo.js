"use strict";
 
// import ace
var ace = require('../../src/ace')
// import Range from ace (it is also available as ace.Range)
var {Range, EditSession} = require('../../src/ace')

require("../../src/webpack-resolver");

// import modes that you want to include into your main bundle
// import "../../build/src-noconflict/mode-javascript";

// import webpack resolver to dynamically load modes, you need to install file-loader for this to work!

// if you want to allow dynamic loading of only a few modules use setModuleUrl for each of them manually
/*
import jsWorkerUrl from "file-loader!../../build/src-noconflict/worker-javascript";
ace.config.setModuleUrl("ace/mode/javascript_worker", jsWorkerUrl)
*/

var editor = ace.edit(null, {
    maxLines: 30,
    minLines: 10,
    value: "var hello = 'world'" + "\n",
    mode: "ace/mode/javascript",
    bug: 1
})

editor.selection.setRange(new Range(0,0,0,3))

document.body.appendChild(editor.container)

/*
import {Mode as JSMode} from "../../build/src-noconflict/mode-javascript"
editor.setMode( new JSMode())
*/


window.eslint = require("eslint/lib/linter")

var defaultRules = require("eslint/lib/rules")
var reactRules = require("eslint-plugin-react")
var linter = new eslint.Linter()
console.log(linter)

var rules = {
}
rules["handle-callback-err"] = 1;
    rules["no-debugger"] = 1;
    rules["no-undef"] = 1;
    // too buggy:
    // rules["no-use-before-define"] = [3, "nofunc"];
    // to annoying:
    // rules["no-shadow"] = 3;
    rules["no-inner-declarations"] = [1, "functions"];
    rules["no-native-reassign"] = 1;
    rules["no-new-func"] = 1;
    rules["no-new-wrappers"] = 1;
    rules["no-cond-assign"] = [1, "except-parens"];
    rules["no-debugger"] = 3;
    rules["no-dupe-keys"] = 3;
    rules["no-eval"] = 1;
    rules["no-func-assign"] = 1;
    rules["no-extra-semi"] = 3;
    rules["no-invalid-regexp"] = 1;
    rules["no-irregular-whitespace"] = 3;
    rules["no-negated-in-lhs"] = 1;
    rules["no-regex-spaces"] = 3;
    rules["quote-props"] = 0;
    rules["no-unreachable"] = 1;
    rules["use-isnan"] = 2;
    rules["valid-typeof"] = 1;
    rules["no-redeclare"] = 3;
    rules["no-with"] = 1;
    rules["radix"] = 3;
    rules["no-delete-var"] = 2;
    rules["no-label-var"] = 3;
    rules["no-console"] = 0;
    rules["no-shadow-restricted-names"] = 2;
    rules["handle-callback-err"] = 1;
    rules["no-new-require"] = 2;

var data = linter.verify("value", {
    rules
});
// debugger
console.log(data)




