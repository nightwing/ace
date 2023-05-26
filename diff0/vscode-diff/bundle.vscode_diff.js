(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "computeDiff": () => (/* binding */ computeDiff)
});

;// CONCATENATED MODULE: ./src/vs/base/common/errors.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
// Avoid circular dependency on EventEmitter by implementing a subset of the interface.
class ErrorHandler {
    addListener(listener) {
        this.listeners.push(listener);
        return ()=>{
            this._removeListener(listener);
        };
    }
    emit(e) {
        this.listeners.forEach((listener)=>{
            listener(e);
        });
    }
    _removeListener(listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
    setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
        this.unexpectedErrorHandler = newUnexpectedErrorHandler;
    }
    getUnexpectedErrorHandler() {
        return this.unexpectedErrorHandler;
    }
    onUnexpectedError(e) {
        this.unexpectedErrorHandler(e);
        this.emit(e);
    }
    // For external errors, we don't want the listeners to be called
    onUnexpectedExternalError(e) {
        this.unexpectedErrorHandler(e);
    }
    constructor(){
        _define_property(this, "unexpectedErrorHandler", void 0);
        _define_property(this, "listeners", void 0);
        this.listeners = [];
        this.unexpectedErrorHandler = function(e) {
            setTimeout(()=>{
                if (e.stack) {
                    if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
                        throw new ErrorNoTelemetry(e.message + '\n\n' + e.stack);
                    }
                    throw new Error(e.message + '\n\n' + e.stack);
                }
                throw e;
            }, 0);
        };
    }
}
const errorHandler = new ErrorHandler();
function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
    errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
}
/**
 * Returns if the error is a SIGPIPE error. SIGPIPE errors should generally be
 * logged at most once, to avoid a loop.
 *
 * @see https://github.com/microsoft/vscode-remote-release/issues/6481
 */ function isSigPipeError(e) {
    var _cast_syscall;
    if (!e || typeof e !== 'object') {
        return false;
    }
    const cast = e;
    return cast.code === 'EPIPE' && ((_cast_syscall = cast.syscall) === null || _cast_syscall === void 0 ? void 0 : _cast_syscall.toUpperCase()) === 'WRITE';
}
function onUnexpectedError(e) {
    // ignore errors from cancelled promises
    if (!isCancellationError(e)) {
        errorHandler.onUnexpectedError(e);
    }
    return undefined;
}
function onUnexpectedExternalError(e) {
    // ignore errors from cancelled promises
    if (!isCancellationError(e)) {
        errorHandler.onUnexpectedExternalError(e);
    }
    return undefined;
}
function transformErrorForSerialization(error) {
    if (error instanceof Error) {
        const { name , message  } = error;
        const stack = error.stacktrace || error.stack;
        return {
            $isError: true,
            name,
            message,
            stack,
            noTelemetry: ErrorNoTelemetry.isErrorNoTelemetry(error)
        };
    }
    // return as is
    return error;
}
const canceledName = 'Canceled';
/**
 * Checks if the given error is a promise in canceled state
 */ function isCancellationError(error) {
    if (error instanceof CancellationError) {
        return true;
    }
    return error instanceof Error && error.name === canceledName && error.message === canceledName;
}
// !!!IMPORTANT!!!
// Do NOT change this class because it is also used as an API-type.
class CancellationError extends Error {
    constructor(){
        super(canceledName);
        this.name = this.message;
    }
}
/**
 * @deprecated use {@link CancellationError `new CancellationError()`} instead
 */ function canceled() {
    const error = new Error(canceledName);
    error.name = error.message;
    return error;
}
function illegalArgument(name) {
    if (name) {
        return new Error(`Illegal argument: ${name}`);
    } else {
        return new Error('Illegal argument');
    }
}
function illegalState(name) {
    if (name) {
        return new Error(`Illegal state: ${name}`);
    } else {
        return new Error('Illegal state');
    }
}
function readonly(name) {
    return name ? new Error(`readonly property '${name} cannot be changed'`) : new Error('readonly property cannot be changed');
}
function disposed(what) {
    const result = new Error(`${what} has been disposed`);
    result.name = 'DISPOSED';
    return result;
}
function getErrorMessage(err) {
    if (!err) {
        return 'Error';
    }
    if (err.message) {
        return err.message;
    }
    if (err.stack) {
        return err.stack.split('\n')[0];
    }
    return String(err);
}
class NotImplementedError extends Error {
    constructor(message){
        super('NotImplemented');
        if (message) {
            this.message = message;
        }
    }
}
class NotSupportedError extends Error {
    constructor(message){
        super('NotSupported');
        if (message) {
            this.message = message;
        }
    }
}
class ExpectedError extends Error {
    constructor(...args){
        super(...args);
        _define_property(this, "isExpected", true);
    }
}
/**
 * Error that when thrown won't be logged in telemetry as an unhandled error.
 */ class ErrorNoTelemetry extends Error {
    static fromError(err) {
        if (err instanceof ErrorNoTelemetry) {
            return err;
        }
        const result = new ErrorNoTelemetry();
        result.message = err.message;
        result.stack = err.stack;
        return result;
    }
    static isErrorNoTelemetry(err) {
        return err.name === 'CodeExpectedError';
    }
    constructor(msg){
        super(msg);
        _define_property(this, "name", void 0);
        this.name = 'CodeExpectedError';
    }
}
/**
 * This error indicates a bug.
 * Do not throw this for invalid user input.
 * Only catch this error to recover gracefully from bugs.
 */ class errors_BugIndicatingError extends Error {
    constructor(message){
        super(message || 'An unexpected bug occurred.');
        Object.setPrototypeOf(this, errors_BugIndicatingError.prototype);
        // Because we know for sure only buggy code throws this,
        // we definitely want to break here and fix the bug.
        // eslint-disable-next-line no-debugger
        debugger;
    }
}

;// CONCATENATED MODULE: ./src/vs/base/common/assert.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ 
/**
 * Throws an error with the provided message if the provided value does not evaluate to a true Javascript value.
 *
 * @deprecated Use `assert(...)` instead.
 * This method is usually used like this:
 * ```ts
 * import * as assert from 'vs/base/common/assert';
 * assert.ok(...);
 * ```
 *
 * However, `assert` in that example is a user chosen name.
 * There is no tooling for generating such an import statement.
 * Thus, the `assert(...)` function should be used instead.
 */ function ok(value, message) {
    if (!value) {
        throw new Error(message ? `Assertion failed (${message})` : 'Assertion Failed');
    }
}
function assertNever(value, message = 'Unreachable') {
    throw new Error(message);
}
function assert(condition) {
    if (!condition) {
        throw new BugIndicatingError('Assertion Failed');
    }
}
/**
 * condition must be side-effect free!
 */ function assertFn(condition) {
    if (!condition()) {
        // eslint-disable-next-line no-debugger
        debugger;
        // Reevaluate `condition` again to make debugging easier
        condition();
        onUnexpectedError(new errors_BugIndicatingError('Assertion Failed'));
    }
}
function checkAdjacentItems(items, predicate) {
    let i = 0;
    while(i < items.length - 1){
        const a = items[i];
        const b = items[i + 1];
        if (!predicate(a, b)) {
            return false;
        }
        i++;
    }
    return true;
}

;// CONCATENATED MODULE: ./src/vs/base/common/charCode.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ // Names from https://blog.codinghorror.com/ascii-pronunciation-rules-for-programmers/
/**
 * An inlined enum containing useful character codes (to be used with String.charCodeAt).
 * Please leave the const keyword such that it gets inlined when compiled to JavaScript!
 */ var CharCode;
(function(CharCode) {
    CharCode[CharCode["Null"] = 0] = "Null";
    CharCode[CharCode[/**
	 * The `\b` character.
	 */ "Backspace"] = 8] = "Backspace";
    CharCode[CharCode[/**
	 * The `\t` character.
	 */ "Tab"] = 9] = "Tab";
    CharCode[CharCode[/**
	 * The `\n` character.
	 */ "LineFeed"] = 10] = "LineFeed";
    CharCode[CharCode[/**
	 * The `\r` character.
	 */ "CarriageReturn"] = 13] = "CarriageReturn";
    CharCode[CharCode["Space"] = 32] = "Space";
    CharCode[CharCode[/**
	 * The `!` character.
	 */ "ExclamationMark"] = 33] = "ExclamationMark";
    CharCode[CharCode[/**
	 * The `"` character.
	 */ "DoubleQuote"] = 34] = "DoubleQuote";
    CharCode[CharCode[/**
	 * The `#` character.
	 */ "Hash"] = 35] = "Hash";
    CharCode[CharCode[/**
	 * The `$` character.
	 */ "DollarSign"] = 36] = "DollarSign";
    CharCode[CharCode[/**
	 * The `%` character.
	 */ "PercentSign"] = 37] = "PercentSign";
    CharCode[CharCode[/**
	 * The `&` character.
	 */ "Ampersand"] = 38] = "Ampersand";
    CharCode[CharCode[/**
	 * The `'` character.
	 */ "SingleQuote"] = 39] = "SingleQuote";
    CharCode[CharCode[/**
	 * The `(` character.
	 */ "OpenParen"] = 40] = "OpenParen";
    CharCode[CharCode[/**
	 * The `)` character.
	 */ "CloseParen"] = 41] = "CloseParen";
    CharCode[CharCode[/**
	 * The `*` character.
	 */ "Asterisk"] = 42] = "Asterisk";
    CharCode[CharCode[/**
	 * The `+` character.
	 */ "Plus"] = 43] = "Plus";
    CharCode[CharCode[/**
	 * The `,` character.
	 */ "Comma"] = 44] = "Comma";
    CharCode[CharCode[/**
	 * The `-` character.
	 */ "Dash"] = 45] = "Dash";
    CharCode[CharCode[/**
	 * The `.` character.
	 */ "Period"] = 46] = "Period";
    CharCode[CharCode[/**
	 * The `/` character.
	 */ "Slash"] = 47] = "Slash";
    CharCode[CharCode["Digit0"] = 48] = "Digit0";
    CharCode[CharCode["Digit1"] = 49] = "Digit1";
    CharCode[CharCode["Digit2"] = 50] = "Digit2";
    CharCode[CharCode["Digit3"] = 51] = "Digit3";
    CharCode[CharCode["Digit4"] = 52] = "Digit4";
    CharCode[CharCode["Digit5"] = 53] = "Digit5";
    CharCode[CharCode["Digit6"] = 54] = "Digit6";
    CharCode[CharCode["Digit7"] = 55] = "Digit7";
    CharCode[CharCode["Digit8"] = 56] = "Digit8";
    CharCode[CharCode["Digit9"] = 57] = "Digit9";
    CharCode[CharCode[/**
	 * The `:` character.
	 */ "Colon"] = 58] = "Colon";
    CharCode[CharCode[/**
	 * The `;` character.
	 */ "Semicolon"] = 59] = "Semicolon";
    CharCode[CharCode[/**
	 * The `<` character.
	 */ "LessThan"] = 60] = "LessThan";
    CharCode[CharCode[/**
	 * The `=` character.
	 */ "Equals"] = 61] = "Equals";
    CharCode[CharCode[/**
	 * The `>` character.
	 */ "GreaterThan"] = 62] = "GreaterThan";
    CharCode[CharCode[/**
	 * The `?` character.
	 */ "QuestionMark"] = 63] = "QuestionMark";
    CharCode[CharCode[/**
	 * The `@` character.
	 */ "AtSign"] = 64] = "AtSign";
    CharCode[CharCode["A"] = 65] = "A";
    CharCode[CharCode["B"] = 66] = "B";
    CharCode[CharCode["C"] = 67] = "C";
    CharCode[CharCode["D"] = 68] = "D";
    CharCode[CharCode["E"] = 69] = "E";
    CharCode[CharCode["F"] = 70] = "F";
    CharCode[CharCode["G"] = 71] = "G";
    CharCode[CharCode["H"] = 72] = "H";
    CharCode[CharCode["I"] = 73] = "I";
    CharCode[CharCode["J"] = 74] = "J";
    CharCode[CharCode["K"] = 75] = "K";
    CharCode[CharCode["L"] = 76] = "L";
    CharCode[CharCode["M"] = 77] = "M";
    CharCode[CharCode["N"] = 78] = "N";
    CharCode[CharCode["O"] = 79] = "O";
    CharCode[CharCode["P"] = 80] = "P";
    CharCode[CharCode["Q"] = 81] = "Q";
    CharCode[CharCode["R"] = 82] = "R";
    CharCode[CharCode["S"] = 83] = "S";
    CharCode[CharCode["T"] = 84] = "T";
    CharCode[CharCode["U"] = 85] = "U";
    CharCode[CharCode["V"] = 86] = "V";
    CharCode[CharCode["W"] = 87] = "W";
    CharCode[CharCode["X"] = 88] = "X";
    CharCode[CharCode["Y"] = 89] = "Y";
    CharCode[CharCode["Z"] = 90] = "Z";
    CharCode[CharCode[/**
	 * The `[` character.
	 */ "OpenSquareBracket"] = 91] = "OpenSquareBracket";
    CharCode[CharCode[/**
	 * The `\` character.
	 */ "Backslash"] = 92] = "Backslash";
    CharCode[CharCode[/**
	 * The `]` character.
	 */ "CloseSquareBracket"] = 93] = "CloseSquareBracket";
    CharCode[CharCode[/**
	 * The `^` character.
	 */ "Caret"] = 94] = "Caret";
    CharCode[CharCode[/**
	 * The `_` character.
	 */ "Underline"] = 95] = "Underline";
    CharCode[CharCode[/**
	 * The ``(`)`` character.
	 */ "BackTick"] = 96] = "BackTick";
    CharCode[CharCode["a"] = 97] = "a";
    CharCode[CharCode["b"] = 98] = "b";
    CharCode[CharCode["c"] = 99] = "c";
    CharCode[CharCode["d"] = 100] = "d";
    CharCode[CharCode["e"] = 101] = "e";
    CharCode[CharCode["f"] = 102] = "f";
    CharCode[CharCode["g"] = 103] = "g";
    CharCode[CharCode["h"] = 104] = "h";
    CharCode[CharCode["i"] = 105] = "i";
    CharCode[CharCode["j"] = 106] = "j";
    CharCode[CharCode["k"] = 107] = "k";
    CharCode[CharCode["l"] = 108] = "l";
    CharCode[CharCode["m"] = 109] = "m";
    CharCode[CharCode["n"] = 110] = "n";
    CharCode[CharCode["o"] = 111] = "o";
    CharCode[CharCode["p"] = 112] = "p";
    CharCode[CharCode["q"] = 113] = "q";
    CharCode[CharCode["r"] = 114] = "r";
    CharCode[CharCode["s"] = 115] = "s";
    CharCode[CharCode["t"] = 116] = "t";
    CharCode[CharCode["u"] = 117] = "u";
    CharCode[CharCode["v"] = 118] = "v";
    CharCode[CharCode["w"] = 119] = "w";
    CharCode[CharCode["x"] = 120] = "x";
    CharCode[CharCode["y"] = 121] = "y";
    CharCode[CharCode["z"] = 122] = "z";
    CharCode[CharCode[/**
	 * The `{` character.
	 */ "OpenCurlyBrace"] = 123] = "OpenCurlyBrace";
    CharCode[CharCode[/**
	 * The `|` character.
	 */ "Pipe"] = 124] = "Pipe";
    CharCode[CharCode[/**
	 * The `}` character.
	 */ "CloseCurlyBrace"] = 125] = "CloseCurlyBrace";
    CharCode[CharCode[/**
	 * The `~` character.
	 */ "Tilde"] = 126] = "Tilde";
    CharCode[CharCode[/**
	 * The &nbsp; (no-break space) character.
	 * Unicode Character 'NO-BREAK SPACE' (U+00A0)
	 */ "NoBreakSpace"] = 160] = "NoBreakSpace";
    CharCode[CharCode["U_Combining_Grave_Accent"] = 0x0300] = "U_Combining_Grave_Accent";
    CharCode[CharCode["U_Combining_Acute_Accent"] = 0x0301] = "U_Combining_Acute_Accent";
    CharCode[CharCode["U_Combining_Circumflex_Accent"] = 0x0302] = "U_Combining_Circumflex_Accent";
    CharCode[CharCode["U_Combining_Tilde"] = 0x0303] = "U_Combining_Tilde";
    CharCode[CharCode["U_Combining_Macron"] = 0x0304] = "U_Combining_Macron";
    CharCode[CharCode["U_Combining_Overline"] = 0x0305] = "U_Combining_Overline";
    CharCode[CharCode["U_Combining_Breve"] = 0x0306] = "U_Combining_Breve";
    CharCode[CharCode["U_Combining_Dot_Above"] = 0x0307] = "U_Combining_Dot_Above";
    CharCode[CharCode["U_Combining_Diaeresis"] = 0x0308] = "U_Combining_Diaeresis";
    CharCode[CharCode["U_Combining_Hook_Above"] = 0x0309] = "U_Combining_Hook_Above";
    CharCode[CharCode["U_Combining_Ring_Above"] = 0x030A] = "U_Combining_Ring_Above";
    CharCode[CharCode["U_Combining_Double_Acute_Accent"] = 0x030B] = "U_Combining_Double_Acute_Accent";
    CharCode[CharCode["U_Combining_Caron"] = 0x030C] = "U_Combining_Caron";
    CharCode[CharCode["U_Combining_Vertical_Line_Above"] = 0x030D] = "U_Combining_Vertical_Line_Above";
    CharCode[CharCode["U_Combining_Double_Vertical_Line_Above"] = 0x030E] = "U_Combining_Double_Vertical_Line_Above";
    CharCode[CharCode["U_Combining_Double_Grave_Accent"] = 0x030F] = "U_Combining_Double_Grave_Accent";
    CharCode[CharCode["U_Combining_Candrabindu"] = 0x0310] = "U_Combining_Candrabindu";
    CharCode[CharCode["U_Combining_Inverted_Breve"] = 0x0311] = "U_Combining_Inverted_Breve";
    CharCode[CharCode["U_Combining_Turned_Comma_Above"] = 0x0312] = "U_Combining_Turned_Comma_Above";
    CharCode[CharCode["U_Combining_Comma_Above"] = 0x0313] = "U_Combining_Comma_Above";
    CharCode[CharCode["U_Combining_Reversed_Comma_Above"] = 0x0314] = "U_Combining_Reversed_Comma_Above";
    CharCode[CharCode["U_Combining_Comma_Above_Right"] = 0x0315] = "U_Combining_Comma_Above_Right";
    CharCode[CharCode["U_Combining_Grave_Accent_Below"] = 0x0316] = "U_Combining_Grave_Accent_Below";
    CharCode[CharCode["U_Combining_Acute_Accent_Below"] = 0x0317] = "U_Combining_Acute_Accent_Below";
    CharCode[CharCode["U_Combining_Left_Tack_Below"] = 0x0318] = "U_Combining_Left_Tack_Below";
    CharCode[CharCode["U_Combining_Right_Tack_Below"] = 0x0319] = "U_Combining_Right_Tack_Below";
    CharCode[CharCode["U_Combining_Left_Angle_Above"] = 0x031A] = "U_Combining_Left_Angle_Above";
    CharCode[CharCode["U_Combining_Horn"] = 0x031B] = "U_Combining_Horn";
    CharCode[CharCode["U_Combining_Left_Half_Ring_Below"] = 0x031C] = "U_Combining_Left_Half_Ring_Below";
    CharCode[CharCode["U_Combining_Up_Tack_Below"] = 0x031D] = "U_Combining_Up_Tack_Below";
    CharCode[CharCode["U_Combining_Down_Tack_Below"] = 0x031E] = "U_Combining_Down_Tack_Below";
    CharCode[CharCode["U_Combining_Plus_Sign_Below"] = 0x031F] = "U_Combining_Plus_Sign_Below";
    CharCode[CharCode["U_Combining_Minus_Sign_Below"] = 0x0320] = "U_Combining_Minus_Sign_Below";
    CharCode[CharCode["U_Combining_Palatalized_Hook_Below"] = 0x0321] = "U_Combining_Palatalized_Hook_Below";
    CharCode[CharCode["U_Combining_Retroflex_Hook_Below"] = 0x0322] = "U_Combining_Retroflex_Hook_Below";
    CharCode[CharCode["U_Combining_Dot_Below"] = 0x0323] = "U_Combining_Dot_Below";
    CharCode[CharCode["U_Combining_Diaeresis_Below"] = 0x0324] = "U_Combining_Diaeresis_Below";
    CharCode[CharCode["U_Combining_Ring_Below"] = 0x0325] = "U_Combining_Ring_Below";
    CharCode[CharCode["U_Combining_Comma_Below"] = 0x0326] = "U_Combining_Comma_Below";
    CharCode[CharCode["U_Combining_Cedilla"] = 0x0327] = "U_Combining_Cedilla";
    CharCode[CharCode["U_Combining_Ogonek"] = 0x0328] = "U_Combining_Ogonek";
    CharCode[CharCode["U_Combining_Vertical_Line_Below"] = 0x0329] = "U_Combining_Vertical_Line_Below";
    CharCode[CharCode["U_Combining_Bridge_Below"] = 0x032A] = "U_Combining_Bridge_Below";
    CharCode[CharCode["U_Combining_Inverted_Double_Arch_Below"] = 0x032B] = "U_Combining_Inverted_Double_Arch_Below";
    CharCode[CharCode["U_Combining_Caron_Below"] = 0x032C] = "U_Combining_Caron_Below";
    CharCode[CharCode["U_Combining_Circumflex_Accent_Below"] = 0x032D] = "U_Combining_Circumflex_Accent_Below";
    CharCode[CharCode["U_Combining_Breve_Below"] = 0x032E] = "U_Combining_Breve_Below";
    CharCode[CharCode["U_Combining_Inverted_Breve_Below"] = 0x032F] = "U_Combining_Inverted_Breve_Below";
    CharCode[CharCode["U_Combining_Tilde_Below"] = 0x0330] = "U_Combining_Tilde_Below";
    CharCode[CharCode["U_Combining_Macron_Below"] = 0x0331] = "U_Combining_Macron_Below";
    CharCode[CharCode["U_Combining_Low_Line"] = 0x0332] = "U_Combining_Low_Line";
    CharCode[CharCode["U_Combining_Double_Low_Line"] = 0x0333] = "U_Combining_Double_Low_Line";
    CharCode[CharCode["U_Combining_Tilde_Overlay"] = 0x0334] = "U_Combining_Tilde_Overlay";
    CharCode[CharCode["U_Combining_Short_Stroke_Overlay"] = 0x0335] = "U_Combining_Short_Stroke_Overlay";
    CharCode[CharCode["U_Combining_Long_Stroke_Overlay"] = 0x0336] = "U_Combining_Long_Stroke_Overlay";
    CharCode[CharCode["U_Combining_Short_Solidus_Overlay"] = 0x0337] = "U_Combining_Short_Solidus_Overlay";
    CharCode[CharCode["U_Combining_Long_Solidus_Overlay"] = 0x0338] = "U_Combining_Long_Solidus_Overlay";
    CharCode[CharCode["U_Combining_Right_Half_Ring_Below"] = 0x0339] = "U_Combining_Right_Half_Ring_Below";
    CharCode[CharCode["U_Combining_Inverted_Bridge_Below"] = 0x033A] = "U_Combining_Inverted_Bridge_Below";
    CharCode[CharCode["U_Combining_Square_Below"] = 0x033B] = "U_Combining_Square_Below";
    CharCode[CharCode["U_Combining_Seagull_Below"] = 0x033C] = "U_Combining_Seagull_Below";
    CharCode[CharCode["U_Combining_X_Above"] = 0x033D] = "U_Combining_X_Above";
    CharCode[CharCode["U_Combining_Vertical_Tilde"] = 0x033E] = "U_Combining_Vertical_Tilde";
    CharCode[CharCode["U_Combining_Double_Overline"] = 0x033F] = "U_Combining_Double_Overline";
    CharCode[CharCode["U_Combining_Grave_Tone_Mark"] = 0x0340] = "U_Combining_Grave_Tone_Mark";
    CharCode[CharCode["U_Combining_Acute_Tone_Mark"] = 0x0341] = "U_Combining_Acute_Tone_Mark";
    CharCode[CharCode["U_Combining_Greek_Perispomeni"] = 0x0342] = "U_Combining_Greek_Perispomeni";
    CharCode[CharCode["U_Combining_Greek_Koronis"] = 0x0343] = "U_Combining_Greek_Koronis";
    CharCode[CharCode["U_Combining_Greek_Dialytika_Tonos"] = 0x0344] = "U_Combining_Greek_Dialytika_Tonos";
    CharCode[CharCode["U_Combining_Greek_Ypogegrammeni"] = 0x0345] = "U_Combining_Greek_Ypogegrammeni";
    CharCode[CharCode["U_Combining_Bridge_Above"] = 0x0346] = "U_Combining_Bridge_Above";
    CharCode[CharCode["U_Combining_Equals_Sign_Below"] = 0x0347] = "U_Combining_Equals_Sign_Below";
    CharCode[CharCode["U_Combining_Double_Vertical_Line_Below"] = 0x0348] = "U_Combining_Double_Vertical_Line_Below";
    CharCode[CharCode["U_Combining_Left_Angle_Below"] = 0x0349] = "U_Combining_Left_Angle_Below";
    CharCode[CharCode["U_Combining_Not_Tilde_Above"] = 0x034A] = "U_Combining_Not_Tilde_Above";
    CharCode[CharCode["U_Combining_Homothetic_Above"] = 0x034B] = "U_Combining_Homothetic_Above";
    CharCode[CharCode["U_Combining_Almost_Equal_To_Above"] = 0x034C] = "U_Combining_Almost_Equal_To_Above";
    CharCode[CharCode["U_Combining_Left_Right_Arrow_Below"] = 0x034D] = "U_Combining_Left_Right_Arrow_Below";
    CharCode[CharCode["U_Combining_Upwards_Arrow_Below"] = 0x034E] = "U_Combining_Upwards_Arrow_Below";
    CharCode[CharCode["U_Combining_Grapheme_Joiner"] = 0x034F] = "U_Combining_Grapheme_Joiner";
    CharCode[CharCode["U_Combining_Right_Arrowhead_Above"] = 0x0350] = "U_Combining_Right_Arrowhead_Above";
    CharCode[CharCode["U_Combining_Left_Half_Ring_Above"] = 0x0351] = "U_Combining_Left_Half_Ring_Above";
    CharCode[CharCode["U_Combining_Fermata"] = 0x0352] = "U_Combining_Fermata";
    CharCode[CharCode["U_Combining_X_Below"] = 0x0353] = "U_Combining_X_Below";
    CharCode[CharCode["U_Combining_Left_Arrowhead_Below"] = 0x0354] = "U_Combining_Left_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Arrowhead_Below"] = 0x0355] = "U_Combining_Right_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below"] = 0x0356] = "U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below";
    CharCode[CharCode["U_Combining_Right_Half_Ring_Above"] = 0x0357] = "U_Combining_Right_Half_Ring_Above";
    CharCode[CharCode["U_Combining_Dot_Above_Right"] = 0x0358] = "U_Combining_Dot_Above_Right";
    CharCode[CharCode["U_Combining_Asterisk_Below"] = 0x0359] = "U_Combining_Asterisk_Below";
    CharCode[CharCode["U_Combining_Double_Ring_Below"] = 0x035A] = "U_Combining_Double_Ring_Below";
    CharCode[CharCode["U_Combining_Zigzag_Above"] = 0x035B] = "U_Combining_Zigzag_Above";
    CharCode[CharCode["U_Combining_Double_Breve_Below"] = 0x035C] = "U_Combining_Double_Breve_Below";
    CharCode[CharCode["U_Combining_Double_Breve"] = 0x035D] = "U_Combining_Double_Breve";
    CharCode[CharCode["U_Combining_Double_Macron"] = 0x035E] = "U_Combining_Double_Macron";
    CharCode[CharCode["U_Combining_Double_Macron_Below"] = 0x035F] = "U_Combining_Double_Macron_Below";
    CharCode[CharCode["U_Combining_Double_Tilde"] = 0x0360] = "U_Combining_Double_Tilde";
    CharCode[CharCode["U_Combining_Double_Inverted_Breve"] = 0x0361] = "U_Combining_Double_Inverted_Breve";
    CharCode[CharCode["U_Combining_Double_Rightwards_Arrow_Below"] = 0x0362] = "U_Combining_Double_Rightwards_Arrow_Below";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_A"] = 0x0363] = "U_Combining_Latin_Small_Letter_A";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_E"] = 0x0364] = "U_Combining_Latin_Small_Letter_E";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_I"] = 0x0365] = "U_Combining_Latin_Small_Letter_I";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_O"] = 0x0366] = "U_Combining_Latin_Small_Letter_O";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_U"] = 0x0367] = "U_Combining_Latin_Small_Letter_U";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_C"] = 0x0368] = "U_Combining_Latin_Small_Letter_C";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_D"] = 0x0369] = "U_Combining_Latin_Small_Letter_D";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_H"] = 0x036A] = "U_Combining_Latin_Small_Letter_H";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_M"] = 0x036B] = "U_Combining_Latin_Small_Letter_M";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_R"] = 0x036C] = "U_Combining_Latin_Small_Letter_R";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_T"] = 0x036D] = "U_Combining_Latin_Small_Letter_T";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_V"] = 0x036E] = "U_Combining_Latin_Small_Letter_V";
    CharCode[CharCode["U_Combining_Latin_Small_Letter_X"] = 0x036F] = "U_Combining_Latin_Small_Letter_X";
    CharCode[CharCode[/**
	 * Unicode Character 'LINE SEPARATOR' (U+2028)
	 * http://www.fileformat.info/info/unicode/char/2028/index.htm
	 */ "LINE_SEPARATOR"] = 0x2028] = "LINE_SEPARATOR";
    CharCode[CharCode[/**
	 * Unicode Character 'PARAGRAPH SEPARATOR' (U+2029)
	 * http://www.fileformat.info/info/unicode/char/2029/index.htm
	 */ "PARAGRAPH_SEPARATOR"] = 0x2029] = "PARAGRAPH_SEPARATOR";
    CharCode[CharCode[/**
	 * Unicode Character 'NEXT LINE' (U+0085)
	 * http://www.fileformat.info/info/unicode/char/0085/index.htm
	 */ "NEXT_LINE"] = 0x0085] = "NEXT_LINE";
    CharCode[CharCode[// http://www.fileformat.info/info/unicode/category/Sk/list.htm
    "U_CIRCUMFLEX"] = 0x005E] = "U_CIRCUMFLEX";
    CharCode[CharCode["U_GRAVE_ACCENT"] = 0x0060] = "U_GRAVE_ACCENT";
    CharCode[CharCode["U_DIAERESIS"] = 0x00A8] = "U_DIAERESIS";
    CharCode[CharCode["U_MACRON"] = 0x00AF] = "U_MACRON";
    CharCode[CharCode["U_ACUTE_ACCENT"] = 0x00B4] = "U_ACUTE_ACCENT";
    CharCode[CharCode["U_CEDILLA"] = 0x00B8] = "U_CEDILLA";
    CharCode[CharCode["U_MODIFIER_LETTER_LEFT_ARROWHEAD"] = 0x02C2] = "U_MODIFIER_LETTER_LEFT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_RIGHT_ARROWHEAD"] = 0x02C3] = "U_MODIFIER_LETTER_RIGHT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_UP_ARROWHEAD"] = 0x02C4] = "U_MODIFIER_LETTER_UP_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_DOWN_ARROWHEAD"] = 0x02C5] = "U_MODIFIER_LETTER_DOWN_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING"] = 0x02D2] = "U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING"] = 0x02D3] = "U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_UP_TACK"] = 0x02D4] = "U_MODIFIER_LETTER_UP_TACK";
    CharCode[CharCode["U_MODIFIER_LETTER_DOWN_TACK"] = 0x02D5] = "U_MODIFIER_LETTER_DOWN_TACK";
    CharCode[CharCode["U_MODIFIER_LETTER_PLUS_SIGN"] = 0x02D6] = "U_MODIFIER_LETTER_PLUS_SIGN";
    CharCode[CharCode["U_MODIFIER_LETTER_MINUS_SIGN"] = 0x02D7] = "U_MODIFIER_LETTER_MINUS_SIGN";
    CharCode[CharCode["U_BREVE"] = 0x02D8] = "U_BREVE";
    CharCode[CharCode["U_DOT_ABOVE"] = 0x02D9] = "U_DOT_ABOVE";
    CharCode[CharCode["U_RING_ABOVE"] = 0x02DA] = "U_RING_ABOVE";
    CharCode[CharCode["U_OGONEK"] = 0x02DB] = "U_OGONEK";
    CharCode[CharCode["U_SMALL_TILDE"] = 0x02DC] = "U_SMALL_TILDE";
    CharCode[CharCode["U_DOUBLE_ACUTE_ACCENT"] = 0x02DD] = "U_DOUBLE_ACUTE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_RHOTIC_HOOK"] = 0x02DE] = "U_MODIFIER_LETTER_RHOTIC_HOOK";
    CharCode[CharCode["U_MODIFIER_LETTER_CROSS_ACCENT"] = 0x02DF] = "U_MODIFIER_LETTER_CROSS_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR"] = 0x02E5] = "U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_HIGH_TONE_BAR"] = 0x02E6] = "U_MODIFIER_LETTER_HIGH_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_MID_TONE_BAR"] = 0x02E7] = "U_MODIFIER_LETTER_MID_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_TONE_BAR"] = 0x02E8] = "U_MODIFIER_LETTER_LOW_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR"] = 0x02E9] = "U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR";
    CharCode[CharCode["U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK"] = 0x02EA] = "U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK";
    CharCode[CharCode["U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK"] = 0x02EB] = "U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK";
    CharCode[CharCode["U_MODIFIER_LETTER_UNASPIRATED"] = 0x02ED] = "U_MODIFIER_LETTER_UNASPIRATED";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD"] = 0x02EF] = "U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_UP_ARROWHEAD"] = 0x02F0] = "U_MODIFIER_LETTER_LOW_UP_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD"] = 0x02F1] = "U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD"] = 0x02F2] = "U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_RING"] = 0x02F3] = "U_MODIFIER_LETTER_LOW_RING";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT"] = 0x02F4] = "U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT"] = 0x02F5] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT"] = 0x02F6] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_TILDE"] = 0x02F7] = "U_MODIFIER_LETTER_LOW_TILDE";
    CharCode[CharCode["U_MODIFIER_LETTER_RAISED_COLON"] = 0x02F8] = "U_MODIFIER_LETTER_RAISED_COLON";
    CharCode[CharCode["U_MODIFIER_LETTER_BEGIN_HIGH_TONE"] = 0x02F9] = "U_MODIFIER_LETTER_BEGIN_HIGH_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_END_HIGH_TONE"] = 0x02FA] = "U_MODIFIER_LETTER_END_HIGH_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_BEGIN_LOW_TONE"] = 0x02FB] = "U_MODIFIER_LETTER_BEGIN_LOW_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_END_LOW_TONE"] = 0x02FC] = "U_MODIFIER_LETTER_END_LOW_TONE";
    CharCode[CharCode["U_MODIFIER_LETTER_SHELF"] = 0x02FD] = "U_MODIFIER_LETTER_SHELF";
    CharCode[CharCode["U_MODIFIER_LETTER_OPEN_SHELF"] = 0x02FE] = "U_MODIFIER_LETTER_OPEN_SHELF";
    CharCode[CharCode["U_MODIFIER_LETTER_LOW_LEFT_ARROW"] = 0x02FF] = "U_MODIFIER_LETTER_LOW_LEFT_ARROW";
    CharCode[CharCode["U_GREEK_LOWER_NUMERAL_SIGN"] = 0x0375] = "U_GREEK_LOWER_NUMERAL_SIGN";
    CharCode[CharCode["U_GREEK_TONOS"] = 0x0384] = "U_GREEK_TONOS";
    CharCode[CharCode["U_GREEK_DIALYTIKA_TONOS"] = 0x0385] = "U_GREEK_DIALYTIKA_TONOS";
    CharCode[CharCode["U_GREEK_KORONIS"] = 0x1FBD] = "U_GREEK_KORONIS";
    CharCode[CharCode["U_GREEK_PSILI"] = 0x1FBF] = "U_GREEK_PSILI";
    CharCode[CharCode["U_GREEK_PERISPOMENI"] = 0x1FC0] = "U_GREEK_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_PERISPOMENI"] = 0x1FC1] = "U_GREEK_DIALYTIKA_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_PSILI_AND_VARIA"] = 0x1FCD] = "U_GREEK_PSILI_AND_VARIA";
    CharCode[CharCode["U_GREEK_PSILI_AND_OXIA"] = 0x1FCE] = "U_GREEK_PSILI_AND_OXIA";
    CharCode[CharCode["U_GREEK_PSILI_AND_PERISPOMENI"] = 0x1FCF] = "U_GREEK_PSILI_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DASIA_AND_VARIA"] = 0x1FDD] = "U_GREEK_DASIA_AND_VARIA";
    CharCode[CharCode["U_GREEK_DASIA_AND_OXIA"] = 0x1FDE] = "U_GREEK_DASIA_AND_OXIA";
    CharCode[CharCode["U_GREEK_DASIA_AND_PERISPOMENI"] = 0x1FDF] = "U_GREEK_DASIA_AND_PERISPOMENI";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_VARIA"] = 0x1FED] = "U_GREEK_DIALYTIKA_AND_VARIA";
    CharCode[CharCode["U_GREEK_DIALYTIKA_AND_OXIA"] = 0x1FEE] = "U_GREEK_DIALYTIKA_AND_OXIA";
    CharCode[CharCode["U_GREEK_VARIA"] = 0x1FEF] = "U_GREEK_VARIA";
    CharCode[CharCode["U_GREEK_OXIA"] = 0x1FFD] = "U_GREEK_OXIA";
    CharCode[CharCode["U_GREEK_DASIA"] = 0x1FFE] = "U_GREEK_DASIA";
    CharCode[CharCode["U_IDEOGRAPHIC_FULL_STOP"] = 0x3002] = "U_IDEOGRAPHIC_FULL_STOP";
    CharCode[CharCode["U_LEFT_CORNER_BRACKET"] = 0x300C] = "U_LEFT_CORNER_BRACKET";
    CharCode[CharCode["U_RIGHT_CORNER_BRACKET"] = 0x300D] = "U_RIGHT_CORNER_BRACKET";
    CharCode[CharCode["U_LEFT_BLACK_LENTICULAR_BRACKET"] = 0x3010] = "U_LEFT_BLACK_LENTICULAR_BRACKET";
    CharCode[CharCode["U_RIGHT_BLACK_LENTICULAR_BRACKET"] = 0x3011] = "U_RIGHT_BLACK_LENTICULAR_BRACKET";
    CharCode[CharCode["U_OVERLINE"] = 0x203E] = "U_OVERLINE";
    CharCode[CharCode[/**
	 * UTF-8 BOM
	 * Unicode Character 'ZERO WIDTH NO-BREAK SPACE' (U+FEFF)
	 * http://www.fileformat.info/info/unicode/char/feff/index.htm
	 */ "UTF8_BOM"] = 65279] = "UTF8_BOM";
    CharCode[CharCode["U_FULLWIDTH_SEMICOLON"] = 0xFF1B] = "U_FULLWIDTH_SEMICOLON";
    CharCode[CharCode["U_FULLWIDTH_COMMA"] = 0xFF0C] = "U_FULLWIDTH_COMMA";
})(CharCode || (CharCode = {}));

;// CONCATENATED MODULE: ./src/vs/editor/common/core/lineRange.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ function lineRange_define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}

/**
 * A range of lines (1-based).
 */ class LineRange {
    /**
	 * @param lineRanges An array of sorted line ranges.
	 */ static joinMany(lineRanges) {
        if (lineRanges.length === 0) {
            return [];
        }
        let result = lineRanges[0];
        for(let i = 1; i < lineRanges.length; i++){
            result = this.join(result, lineRanges[i]);
        }
        return result;
    }
    /**
	 * @param lineRanges1 Must be sorted.
	 * @param lineRanges2 Must be sorted.
	 */ static join(lineRanges1, lineRanges2) {
        if (lineRanges1.length === 0) {
            return lineRanges2;
        }
        if (lineRanges2.length === 0) {
            return lineRanges1;
        }
        const result = [];
        let i1 = 0;
        let i2 = 0;
        let current = null;
        while(i1 < lineRanges1.length || i2 < lineRanges2.length){
            let next = null;
            if (i1 < lineRanges1.length && i2 < lineRanges2.length) {
                const lineRange1 = lineRanges1[i1];
                const lineRange2 = lineRanges2[i2];
                if (lineRange1.startLineNumber < lineRange2.startLineNumber) {
                    next = lineRange1;
                    i1++;
                } else {
                    next = lineRange2;
                    i2++;
                }
            } else if (i1 < lineRanges1.length) {
                next = lineRanges1[i1];
                i1++;
            } else {
                next = lineRanges2[i2];
                i2++;
            }
            if (current === null) {
                current = next;
            } else {
                if (current.endLineNumberExclusive >= next.startLineNumber) {
                    // merge
                    current = new LineRange(current.startLineNumber, Math.max(current.endLineNumberExclusive, next.endLineNumberExclusive));
                } else {
                    // push
                    result.push(current);
                    current = next;
                }
            }
        }
        if (current !== null) {
            result.push(current);
        }
        return result;
    }
    /**
	 * Indicates if this line range contains the given line number.
	 */ contains(lineNumber) {
        return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
    }
    /**
	 * Indicates if this line range is empty.
	 */ get isEmpty() {
        return this.startLineNumber === this.endLineNumberExclusive;
    }
    /**
	 * Moves this line range by the given offset of line numbers.
	 */ delta(offset) {
        return new LineRange(this.startLineNumber + offset, this.endLineNumberExclusive + offset);
    }
    /**
	 * The number of lines this line range spans.
	 */ get length() {
        return this.endLineNumberExclusive - this.startLineNumber;
    }
    /**
	 * Creates a line range that combines this and the given line range.
	 */ join(other) {
        return new LineRange(Math.min(this.startLineNumber, other.startLineNumber), Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive));
    }
    toString() {
        return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
    }
    /**
	 * The resulting range is empty if the ranges do not intersect, but touch.
	 * If the ranges don't even touch, the result is undefined.
	 */ intersect(other) {
        const startLineNumber = Math.max(this.startLineNumber, other.startLineNumber);
        const endLineNumberExclusive = Math.min(this.endLineNumberExclusive, other.endLineNumberExclusive);
        if (startLineNumber <= endLineNumberExclusive) {
            return new LineRange(startLineNumber, endLineNumberExclusive);
        }
        return undefined;
    }
    overlapOrTouch(other) {
        return this.startLineNumber <= other.endLineNumberExclusive && other.startLineNumber <= this.endLineNumberExclusive;
    }
    equals(b) {
        return this.startLineNumber === b.startLineNumber && this.endLineNumberExclusive === b.endLineNumberExclusive;
    }
    constructor(startLineNumber, endLineNumberExclusive){
        /**
	 * The start line number.
	 */ lineRange_define_property(this, "startLineNumber", void 0);
        /**
	 * The end line number (exclusive).
	 */ lineRange_define_property(this, "endLineNumberExclusive", void 0);
        if (startLineNumber > endLineNumberExclusive) {
            throw new errors_BugIndicatingError(`startLineNumber ${startLineNumber} cannot be after endLineNumberExclusive ${endLineNumberExclusive}`);
        }
        this.startLineNumber = startLineNumber;
        this.endLineNumberExclusive = endLineNumberExclusive;
    }
}

;// CONCATENATED MODULE: ./src/vs/editor/common/core/offsetRange.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ function offsetRange_define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}

/**
 * A range of offsets (0-based).
*/ class OffsetRange {
    static addRange(range, sortedRanges) {
        let i = 0;
        while(i < sortedRanges.length && sortedRanges[i].endExclusive < range.start){
            i++;
        }
        let j = i;
        while(j < sortedRanges.length && sortedRanges[j].start <= range.endExclusive){
            j++;
        }
        if (i === j) {
            sortedRanges.splice(i, 0, range);
        } else {
            const start = Math.min(range.start, sortedRanges[i].start);
            const end = Math.max(range.endExclusive, sortedRanges[j - 1].endExclusive);
            sortedRanges.splice(i, j - i, new OffsetRange(start, end));
        }
    }
    static tryCreate(start, endExclusive) {
        if (start > endExclusive) {
            return undefined;
        }
        return new OffsetRange(start, endExclusive);
    }
    get isEmpty() {
        return this.start === this.endExclusive;
    }
    delta(offset) {
        return new OffsetRange(this.start + offset, this.endExclusive + offset);
    }
    get length() {
        return this.endExclusive - this.start;
    }
    toString() {
        return `[${this.start}, ${this.endExclusive})`;
    }
    equals(other) {
        return this.start === other.start && this.endExclusive === other.endExclusive;
    }
    containsRange(other) {
        return this.start <= other.start && other.endExclusive <= this.endExclusive;
    }
    contains(offset) {
        return this.start <= offset && offset < this.endExclusive;
    }
    /**
	 * for all numbers n: range1.contains(n) or range2.contains(n) => range1.join(range2).contains(n)
	 * The joined range is the smallest range that contains both ranges.
	 */ join(other) {
        return new OffsetRange(Math.min(this.start, other.start), Math.max(this.endExclusive, other.endExclusive));
    }
    /**
	 * for all numbers n: range1.contains(n) and range2.contains(n) <=> range1.intersect(range2).contains(n)
	 *
	 * The resulting range is empty if the ranges do not intersect, but touch.
	 * If the ranges don't even touch, the result is undefined.
	 */ intersect(other) {
        const start = Math.max(this.start, other.start);
        const end = Math.min(this.endExclusive, other.endExclusive);
        if (start <= end) {
            return new OffsetRange(start, end);
        }
        return undefined;
    }
    constructor(start, endExclusive){
        offsetRange_define_property(this, "start", void 0);
        offsetRange_define_property(this, "endExclusive", void 0);
        this.start = start;
        this.endExclusive = endExclusive;
        if (start > endExclusive) {
            throw new errors_BugIndicatingError(`Invalid range: ${this.toString()}`);
        }
    }
}

;// CONCATENATED MODULE: ./src/vs/editor/common/core/position.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ /**
 * A position in the editor. This interface is suitable for serialization.
 */ function position_define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/**
 * A position in the editor.
 */ class Position {
    /**
	 * Create a new position from this position.
	 *
	 * @param newLineNumber new line number
	 * @param newColumn new column
	 */ with(newLineNumber = this.lineNumber, newColumn = this.column) {
        if (newLineNumber === this.lineNumber && newColumn === this.column) {
            return this;
        } else {
            return new Position(newLineNumber, newColumn);
        }
    }
    /**
	 * Derive a new position from this position.
	 *
	 * @param deltaLineNumber line number delta
	 * @param deltaColumn column delta
	 */ delta(deltaLineNumber = 0, deltaColumn = 0) {
        return this.with(this.lineNumber + deltaLineNumber, this.column + deltaColumn);
    }
    /**
	 * Test if this position equals other position
	 */ equals(other) {
        return Position.equals(this, other);
    }
    /**
	 * Test if position `a` equals position `b`
	 */ static equals(a, b) {
        if (!a && !b) {
            return true;
        }
        return !!a && !!b && a.lineNumber === b.lineNumber && a.column === b.column;
    }
    /**
	 * Test if this position is before other position.
	 * If the two positions are equal, the result will be false.
	 */ isBefore(other) {
        return Position.isBefore(this, other);
    }
    /**
	 * Test if position `a` is before position `b`.
	 * If the two positions are equal, the result will be false.
	 */ static isBefore(a, b) {
        if (a.lineNumber < b.lineNumber) {
            return true;
        }
        if (b.lineNumber < a.lineNumber) {
            return false;
        }
        return a.column < b.column;
    }
    /**
	 * Test if this position is before other position.
	 * If the two positions are equal, the result will be true.
	 */ isBeforeOrEqual(other) {
        return Position.isBeforeOrEqual(this, other);
    }
    /**
	 * Test if position `a` is before position `b`.
	 * If the two positions are equal, the result will be true.
	 */ static isBeforeOrEqual(a, b) {
        if (a.lineNumber < b.lineNumber) {
            return true;
        }
        if (b.lineNumber < a.lineNumber) {
            return false;
        }
        return a.column <= b.column;
    }
    /**
	 * A function that compares positions, useful for sorting
	 */ static compare(a, b) {
        const aLineNumber = a.lineNumber | 0;
        const bLineNumber = b.lineNumber | 0;
        if (aLineNumber === bLineNumber) {
            const aColumn = a.column | 0;
            const bColumn = b.column | 0;
            return aColumn - bColumn;
        }
        return aLineNumber - bLineNumber;
    }
    /**
	 * Clone this position.
	 */ clone() {
        return new Position(this.lineNumber, this.column);
    }
    /**
	 * Convert to a human-readable representation.
	 */ toString() {
        return '(' + this.lineNumber + ',' + this.column + ')';
    }
    // ---
    /**
	 * Create a `Position` from an `IPosition`.
	 */ static lift(pos) {
        return new Position(pos.lineNumber, pos.column);
    }
    /**
	 * Test if `obj` is an `IPosition`.
	 */ static isIPosition(obj) {
        return obj && typeof obj.lineNumber === 'number' && typeof obj.column === 'number';
    }
    constructor(lineNumber, column){
        /**
	 * line number (starts at 1)
	 */ position_define_property(this, "lineNumber", void 0);
        /**
	 * column (the first character in a line is between column 1 and column 2)
	 */ position_define_property(this, "column", void 0);
        this.lineNumber = lineNumber;
        this.column = column;
    }
}

;// CONCATENATED MODULE: ./src/vs/editor/common/core/range.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ function range_define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}

/**
 * A range in the editor. (startLineNumber,startColumn) is <= (endLineNumber,endColumn)
 */ class Range {
    /**
	 * Test if this range is empty.
	 */ isEmpty() {
        return Range.isEmpty(this);
    }
    /**
	 * Test if `range` is empty.
	 */ static isEmpty(range) {
        return range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn;
    }
    /**
	 * Test if position is in this range. If the position is at the edges, will return true.
	 */ containsPosition(position) {
        return Range.containsPosition(this, position);
    }
    /**
	 * Test if `position` is in `range`. If the position is at the edges, will return true.
	 */ static containsPosition(range, position) {
        if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
            return false;
        }
        if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
            return false;
        }
        if (position.lineNumber === range.endLineNumber && position.column > range.endColumn) {
            return false;
        }
        return true;
    }
    /**
	 * Test if `position` is in `range`. If the position is at the edges, will return false.
	 * @internal
	 */ static strictContainsPosition(range, position) {
        if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
            return false;
        }
        if (position.lineNumber === range.startLineNumber && position.column <= range.startColumn) {
            return false;
        }
        if (position.lineNumber === range.endLineNumber && position.column >= range.endColumn) {
            return false;
        }
        return true;
    }
    /**
	 * Test if range is in this range. If the range is equal to this range, will return true.
	 */ containsRange(range) {
        return Range.containsRange(this, range);
    }
    /**
	 * Test if `otherRange` is in `range`. If the ranges are equal, will return true.
	 */ static containsRange(range, otherRange) {
        if (otherRange.startLineNumber < range.startLineNumber || otherRange.endLineNumber < range.startLineNumber) {
            return false;
        }
        if (otherRange.startLineNumber > range.endLineNumber || otherRange.endLineNumber > range.endLineNumber) {
            return false;
        }
        if (otherRange.startLineNumber === range.startLineNumber && otherRange.startColumn < range.startColumn) {
            return false;
        }
        if (otherRange.endLineNumber === range.endLineNumber && otherRange.endColumn > range.endColumn) {
            return false;
        }
        return true;
    }
    /**
	 * Test if `range` is strictly in this range. `range` must start after and end before this range for the result to be true.
	 */ strictContainsRange(range) {
        return Range.strictContainsRange(this, range);
    }
    /**
	 * Test if `otherRange` is strictly in `range` (must start after, and end before). If the ranges are equal, will return false.
	 */ static strictContainsRange(range, otherRange) {
        if (otherRange.startLineNumber < range.startLineNumber || otherRange.endLineNumber < range.startLineNumber) {
            return false;
        }
        if (otherRange.startLineNumber > range.endLineNumber || otherRange.endLineNumber > range.endLineNumber) {
            return false;
        }
        if (otherRange.startLineNumber === range.startLineNumber && otherRange.startColumn <= range.startColumn) {
            return false;
        }
        if (otherRange.endLineNumber === range.endLineNumber && otherRange.endColumn >= range.endColumn) {
            return false;
        }
        return true;
    }
    /**
	 * A reunion of the two ranges.
	 * The smallest position will be used as the start point, and the largest one as the end point.
	 */ plusRange(range) {
        return Range.plusRange(this, range);
    }
    /**
	 * A reunion of the two ranges.
	 * The smallest position will be used as the start point, and the largest one as the end point.
	 */ static plusRange(a, b) {
        let startLineNumber;
        let startColumn;
        let endLineNumber;
        let endColumn;
        if (b.startLineNumber < a.startLineNumber) {
            startLineNumber = b.startLineNumber;
            startColumn = b.startColumn;
        } else if (b.startLineNumber === a.startLineNumber) {
            startLineNumber = b.startLineNumber;
            startColumn = Math.min(b.startColumn, a.startColumn);
        } else {
            startLineNumber = a.startLineNumber;
            startColumn = a.startColumn;
        }
        if (b.endLineNumber > a.endLineNumber) {
            endLineNumber = b.endLineNumber;
            endColumn = b.endColumn;
        } else if (b.endLineNumber === a.endLineNumber) {
            endLineNumber = b.endLineNumber;
            endColumn = Math.max(b.endColumn, a.endColumn);
        } else {
            endLineNumber = a.endLineNumber;
            endColumn = a.endColumn;
        }
        return new Range(startLineNumber, startColumn, endLineNumber, endColumn);
    }
    /**
	 * A intersection of the two ranges.
	 */ intersectRanges(range) {
        return Range.intersectRanges(this, range);
    }
    /**
	 * A intersection of the two ranges.
	 */ static intersectRanges(a, b) {
        let resultStartLineNumber = a.startLineNumber;
        let resultStartColumn = a.startColumn;
        let resultEndLineNumber = a.endLineNumber;
        let resultEndColumn = a.endColumn;
        const otherStartLineNumber = b.startLineNumber;
        const otherStartColumn = b.startColumn;
        const otherEndLineNumber = b.endLineNumber;
        const otherEndColumn = b.endColumn;
        if (resultStartLineNumber < otherStartLineNumber) {
            resultStartLineNumber = otherStartLineNumber;
            resultStartColumn = otherStartColumn;
        } else if (resultStartLineNumber === otherStartLineNumber) {
            resultStartColumn = Math.max(resultStartColumn, otherStartColumn);
        }
        if (resultEndLineNumber > otherEndLineNumber) {
            resultEndLineNumber = otherEndLineNumber;
            resultEndColumn = otherEndColumn;
        } else if (resultEndLineNumber === otherEndLineNumber) {
            resultEndColumn = Math.min(resultEndColumn, otherEndColumn);
        }
        // Check if selection is now empty
        if (resultStartLineNumber > resultEndLineNumber) {
            return null;
        }
        if (resultStartLineNumber === resultEndLineNumber && resultStartColumn > resultEndColumn) {
            return null;
        }
        return new Range(resultStartLineNumber, resultStartColumn, resultEndLineNumber, resultEndColumn);
    }
    /**
	 * Test if this range equals other.
	 */ equalsRange(other) {
        return Range.equalsRange(this, other);
    }
    /**
	 * Test if range `a` equals `b`.
	 */ static equalsRange(a, b) {
        if (!a && !b) {
            return true;
        }
        return !!a && !!b && a.startLineNumber === b.startLineNumber && a.startColumn === b.startColumn && a.endLineNumber === b.endLineNumber && a.endColumn === b.endColumn;
    }
    /**
	 * Return the end position (which will be after or equal to the start position)
	 */ getEndPosition() {
        return Range.getEndPosition(this);
    }
    /**
	 * Return the end position (which will be after or equal to the start position)
	 */ static getEndPosition(range) {
        return new Position(range.endLineNumber, range.endColumn);
    }
    /**
	 * Return the start position (which will be before or equal to the end position)
	 */ getStartPosition() {
        return Range.getStartPosition(this);
    }
    /**
	 * Return the start position (which will be before or equal to the end position)
	 */ static getStartPosition(range) {
        return new Position(range.startLineNumber, range.startColumn);
    }
    /**
	 * Transform to a user presentable string representation.
	 */ toString() {
        return '[' + this.startLineNumber + ',' + this.startColumn + ' -> ' + this.endLineNumber + ',' + this.endColumn + ']';
    }
    /**
	 * Create a new range using this range's start position, and using endLineNumber and endColumn as the end position.
	 */ setEndPosition(endLineNumber, endColumn) {
        return new Range(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
    }
    /**
	 * Create a new range using this range's end position, and using startLineNumber and startColumn as the start position.
	 */ setStartPosition(startLineNumber, startColumn) {
        return new Range(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
    }
    /**
	 * Create a new empty range using this range's start position.
	 */ collapseToStart() {
        return Range.collapseToStart(this);
    }
    /**
	 * Create a new empty range using this range's start position.
	 */ static collapseToStart(range) {
        return new Range(range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn);
    }
    /**
	 * Create a new empty range using this range's end position.
	 */ collapseToEnd() {
        return Range.collapseToEnd(this);
    }
    /**
	 * Create a new empty range using this range's end position.
	 */ static collapseToEnd(range) {
        return new Range(range.endLineNumber, range.endColumn, range.endLineNumber, range.endColumn);
    }
    /**
	 * Moves the range by the given amount of lines.
	 */ delta(lineCount) {
        return new Range(this.startLineNumber + lineCount, this.startColumn, this.endLineNumber + lineCount, this.endColumn);
    }
    // ---
    static fromPositions(start, end = start) {
        return new Range(start.lineNumber, start.column, end.lineNumber, end.column);
    }
    static lift(range) {
        if (!range) {
            return null;
        }
        return new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
    }
    /**
	 * Test if `obj` is an `IRange`.
	 */ static isIRange(obj) {
        return obj && typeof obj.startLineNumber === 'number' && typeof obj.startColumn === 'number' && typeof obj.endLineNumber === 'number' && typeof obj.endColumn === 'number';
    }
    /**
	 * Test if the two ranges are touching in any way.
	 */ static areIntersectingOrTouching(a, b) {
        // Check if `a` is before `b`
        if (a.endLineNumber < b.startLineNumber || a.endLineNumber === b.startLineNumber && a.endColumn < b.startColumn) {
            return false;
        }
        // Check if `b` is before `a`
        if (b.endLineNumber < a.startLineNumber || b.endLineNumber === a.startLineNumber && b.endColumn < a.startColumn) {
            return false;
        }
        // These ranges must intersect
        return true;
    }
    /**
	 * Test if the two ranges are intersecting. If the ranges are touching it returns true.
	 */ static areIntersecting(a, b) {
        // Check if `a` is before `b`
        if (a.endLineNumber < b.startLineNumber || a.endLineNumber === b.startLineNumber && a.endColumn <= b.startColumn) {
            return false;
        }
        // Check if `b` is before `a`
        if (b.endLineNumber < a.startLineNumber || b.endLineNumber === a.startLineNumber && b.endColumn <= a.startColumn) {
            return false;
        }
        // These ranges must intersect
        return true;
    }
    /**
	 * A function that compares ranges, useful for sorting ranges
	 * It will first compare ranges on the startPosition and then on the endPosition
	 */ static compareRangesUsingStarts(a, b) {
        if (a && b) {
            const aStartLineNumber = a.startLineNumber | 0;
            const bStartLineNumber = b.startLineNumber | 0;
            if (aStartLineNumber === bStartLineNumber) {
                const aStartColumn = a.startColumn | 0;
                const bStartColumn = b.startColumn | 0;
                if (aStartColumn === bStartColumn) {
                    const aEndLineNumber = a.endLineNumber | 0;
                    const bEndLineNumber = b.endLineNumber | 0;
                    if (aEndLineNumber === bEndLineNumber) {
                        const aEndColumn = a.endColumn | 0;
                        const bEndColumn = b.endColumn | 0;
                        return aEndColumn - bEndColumn;
                    }
                    return aEndLineNumber - bEndLineNumber;
                }
                return aStartColumn - bStartColumn;
            }
            return aStartLineNumber - bStartLineNumber;
        }
        const aExists = a ? 1 : 0;
        const bExists = b ? 1 : 0;
        return aExists - bExists;
    }
    /**
	 * A function that compares ranges, useful for sorting ranges
	 * It will first compare ranges on the endPosition and then on the startPosition
	 */ static compareRangesUsingEnds(a, b) {
        if (a.endLineNumber === b.endLineNumber) {
            if (a.endColumn === b.endColumn) {
                if (a.startLineNumber === b.startLineNumber) {
                    return a.startColumn - b.startColumn;
                }
                return a.startLineNumber - b.startLineNumber;
            }
            return a.endColumn - b.endColumn;
        }
        return a.endLineNumber - b.endLineNumber;
    }
    /**
	 * Test if the range spans multiple lines.
	 */ static spansMultipleLines(range) {
        return range.endLineNumber > range.startLineNumber;
    }
    toJSON() {
        return this;
    }
    constructor(startLineNumber, startColumn, endLineNumber, endColumn){
        /**
	 * Line number on which the range starts (starts at 1).
	 */ range_define_property(this, "startLineNumber", void 0);
        /**
	 * Column on which the range starts in line `startLineNumber` (starts at 1).
	 */ range_define_property(this, "startColumn", void 0);
        /**
	 * Line number on which the range ends.
	 */ range_define_property(this, "endLineNumber", void 0);
        /**
	 * Column on which the range ends in line `endLineNumber`.
	 */ range_define_property(this, "endColumn", void 0);
        if (startLineNumber > endLineNumber || startLineNumber === endLineNumber && startColumn > endColumn) {
            this.startLineNumber = endLineNumber;
            this.startColumn = endColumn;
            this.endLineNumber = startLineNumber;
            this.endColumn = startColumn;
        } else {
            this.startLineNumber = startLineNumber;
            this.startColumn = startColumn;
            this.endLineNumber = endLineNumber;
            this.endColumn = endColumn;
        }
    }
}

;// CONCATENATED MODULE: ./src/vs/editor/common/diff/algorithms/diffAlgorithm.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ function diffAlgorithm_define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}


class DiffAlgorithmResult {
    static trivial(seq1, seq2) {
        return new DiffAlgorithmResult([
            new SequenceDiff(new OffsetRange(0, seq1.length), new OffsetRange(0, seq2.length))
        ], false);
    }
    static trivialTimedOut(seq1, seq2) {
        return new DiffAlgorithmResult([
            new SequenceDiff(new OffsetRange(0, seq1.length), new OffsetRange(0, seq2.length))
        ], true);
    }
    constructor(diffs, hitTimeout){
        diffAlgorithm_define_property(this, "diffs", void 0);
        diffAlgorithm_define_property(this, "hitTimeout", void 0);
        this.diffs = diffs;
        this.hitTimeout = hitTimeout;
    }
}
class SequenceDiff {
    reverse() {
        return new SequenceDiff(this.seq2Range, this.seq1Range);
    }
    toString() {
        return `${this.seq1Range} <-> ${this.seq2Range}`;
    }
    join(other) {
        return new SequenceDiff(this.seq1Range.join(other.seq1Range), this.seq2Range.join(other.seq2Range));
    }
    constructor(seq1Range, seq2Range){
        diffAlgorithm_define_property(this, "seq1Range", void 0);
        diffAlgorithm_define_property(this, "seq2Range", void 0);
        this.seq1Range = seq1Range;
        this.seq2Range = seq2Range;
    }
}
class InfiniteTimeout {
    isValid() {
        return true;
    }
}
diffAlgorithm_define_property(InfiniteTimeout, "instance", new InfiniteTimeout());
class DateTimeout {
    // Recommendation: Set a log-point `{this.disable()}` in the body
    isValid() {
        const valid = Date.now() - this.startTime < this.timeout;
        if (!valid && this.valid) {
            this.valid = false; // timeout reached
            // eslint-disable-next-line no-debugger
            debugger; // WARNING: Most likely debugging caused the timeout. Call `this.disable()` to continue without timing out.
        }
        return this.valid;
    }
    disable() {
        this.timeout = Number.MAX_SAFE_INTEGER;
        this.isValid = ()=>true;
        this.valid = true;
    }
    constructor(timeout){
        diffAlgorithm_define_property(this, "timeout", void 0);
        diffAlgorithm_define_property(this, "startTime", void 0);
        diffAlgorithm_define_property(this, "valid", void 0);
        this.timeout = timeout;
        this.startTime = Date.now();
        this.valid = true;
        if (timeout <= 0) {
            throw new errors_BugIndicatingError('timeout must be positive');
        }
    }
}

;// CONCATENATED MODULE: ./src/vs/editor/common/diff/algorithms/utils.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ function utils_define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class Array2D {
    get(x, y) {
        return this.array[x + y * this.width];
    }
    set(x, y, value) {
        this.array[x + y * this.width] = value;
    }
    constructor(width, height){
        utils_define_property(this, "width", void 0);
        utils_define_property(this, "height", void 0);
        utils_define_property(this, "array", void 0);
        this.width = width;
        this.height = height;
        this.array = [];
        this.array = new Array(width * height);
    }
}

;// CONCATENATED MODULE: ./src/vs/editor/common/diff/algorithms/dynamicProgrammingDiffing.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ 


/**
 * A O(MN) diffing algorithm that supports a score function.
 * The algorithm can be improved by processing the 2d array diagonally.
*/ class DynamicProgrammingDiffing {
    compute(sequence1, sequence2, timeout = InfiniteTimeout.instance, equalityScore) {
        if (sequence1.length === 0 || sequence2.length === 0) {
            return DiffAlgorithmResult.trivial(sequence1, sequence2);
        }
        /**
		 * lcsLengths.get(i, j): Length of the longest common subsequence of sequence1.substring(0, i + 1) and sequence2.substring(0, j + 1).
		 */ const lcsLengths = new Array2D(sequence1.length, sequence2.length);
        const directions = new Array2D(sequence1.length, sequence2.length);
        const lengths = new Array2D(sequence1.length, sequence2.length);
        // ==== Initializing lcsLengths ====
        for(let s1 = 0; s1 < sequence1.length; s1++){
            for(let s2 = 0; s2 < sequence2.length; s2++){
                if (!timeout.isValid()) {
                    return DiffAlgorithmResult.trivialTimedOut(sequence1, sequence2);
                }
                const horizontalLen = s1 === 0 ? 0 : lcsLengths.get(s1 - 1, s2);
                const verticalLen = s2 === 0 ? 0 : lcsLengths.get(s1, s2 - 1);
                let extendedSeqScore;
                if (sequence1.getElement(s1) === sequence2.getElement(s2)) {
                    if (s1 === 0 || s2 === 0) {
                        extendedSeqScore = 0;
                    } else {
                        extendedSeqScore = lcsLengths.get(s1 - 1, s2 - 1);
                    }
                    if (s1 > 0 && s2 > 0 && directions.get(s1 - 1, s2 - 1) === 3) {
                        // Prefer consecutive diagonals
                        extendedSeqScore += lengths.get(s1 - 1, s2 - 1);
                    }
                    extendedSeqScore += equalityScore ? equalityScore(s1, s2) : 1;
                } else {
                    extendedSeqScore = -1;
                }
                const newValue = Math.max(horizontalLen, verticalLen, extendedSeqScore);
                if (newValue === extendedSeqScore) {
                    // Prefer diagonals
                    const prevLen = s1 > 0 && s2 > 0 ? lengths.get(s1 - 1, s2 - 1) : 0;
                    lengths.set(s1, s2, prevLen + 1);
                    directions.set(s1, s2, 3);
                } else if (newValue === horizontalLen) {
                    lengths.set(s1, s2, 0);
                    directions.set(s1, s2, 1);
                } else if (newValue === verticalLen) {
                    lengths.set(s1, s2, 0);
                    directions.set(s1, s2, 2);
                }
                lcsLengths.set(s1, s2, newValue);
            }
        }
        // ==== Backtracking ====
        const result = [];
        let lastAligningPosS1 = sequence1.length;
        let lastAligningPosS2 = sequence2.length;
        function reportDecreasingAligningPositions(s1, s2) {
            if (s1 + 1 !== lastAligningPosS1 || s2 + 1 !== lastAligningPosS2) {
                result.push(new SequenceDiff(new OffsetRange(s1 + 1, lastAligningPosS1), new OffsetRange(s2 + 1, lastAligningPosS2)));
            }
            lastAligningPosS1 = s1;
            lastAligningPosS2 = s2;
        }
        let s1 = sequence1.length - 1;
        let s2 = sequence2.length - 1;
        while(s1 >= 0 && s2 >= 0){
            if (directions.get(s1, s2) === 3) {
                reportDecreasingAligningPositions(s1, s2);
                s1--;
                s2--;
            } else {
                if (directions.get(s1, s2) === 1) {
                    s1--;
                } else {
                    s2--;
                }
            }
        }
        reportDecreasingAligningPositions(-1, -1);
        result.reverse();
        return new DiffAlgorithmResult(result, false);
    }
}

;// CONCATENATED MODULE: ./src/vs/editor/common/diff/algorithms/joinSequenceDiffs.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ 

function optimizeSequenceDiffs(sequence1, sequence2, sequenceDiffs) {
    let result = sequenceDiffs;
    result = joinSequenceDiffs(sequence1, sequence2, result);
    result = shiftSequenceDiffs(sequence1, sequence2, result);
    return result;
}
function smoothenSequenceDiffs(sequence1, sequence2, sequenceDiffs) {
    const result = [];
    for (const s of sequenceDiffs){
        const last = result[result.length - 1];
        if (!last) {
            result.push(s);
            continue;
        }
        if (s.seq1Range.start - last.seq1Range.endExclusive <= 2 || s.seq2Range.start - last.seq2Range.endExclusive <= 2) {
            result[result.length - 1] = new SequenceDiff(last.seq1Range.join(s.seq1Range), last.seq2Range.join(s.seq2Range));
        } else {
            result.push(s);
        }
    }
    return result;
}
/**
 * This function fixes issues like this:
 * ```
 * import { Baz, Bar } from "foo";
 * ```
 * <->
 * ```
 * import { Baz, Bar, Foo } from "foo";
 * ```
 * Computed diff: [ {Add "," after Bar}, {Add "Foo " after space} }
 * Improved diff: [{Add ", Foo" after Bar}]
 */ function joinSequenceDiffs(sequence1, sequence2, sequenceDiffs) {
    const result = [];
    if (sequenceDiffs.length > 0) {
        result.push(sequenceDiffs[0]);
    }
    for(let i = 1; i < sequenceDiffs.length; i++){
        const lastResult = result[result.length - 1];
        const cur = sequenceDiffs[i];
        if (cur.seq1Range.isEmpty) {
            let all = true;
            const length = cur.seq1Range.start - lastResult.seq1Range.endExclusive;
            for(let i = 1; i <= length; i++){
                if (sequence2.getElement(cur.seq2Range.start - i) !== sequence2.getElement(cur.seq2Range.endExclusive - i)) {
                    all = false;
                    break;
                }
            }
            if (all) {
                // Merge previous and current diff
                result[result.length - 1] = new SequenceDiff(lastResult.seq1Range, new OffsetRange(lastResult.seq2Range.start, cur.seq2Range.endExclusive - length));
                continue;
            }
        }
        result.push(cur);
    }
    return result;
}
// align character level diffs at whitespace characters
// import { IBar } from "foo";
// import { I[Arr, I]Bar } from "foo";
// ->
// import { [IArr, ]IBar } from "foo";
// import { ITransaction, observableValue, transaction } from 'vs/base/common/observable';
// import { ITransaction, observable[FromEvent, observable]Value, transaction } from 'vs/base/common/observable';
// ->
// import { ITransaction, [observableFromEvent, ]observableValue, transaction } from 'vs/base/common/observable';
// collectBrackets(level + 1, levelPerBracketType);
// collectBrackets(level + 1, levelPerBracket[ + 1, levelPerBracket]Type);
// ->
// collectBrackets(level + 1, [levelPerBracket + 1, ]levelPerBracketType);
function shiftSequenceDiffs(sequence1, sequence2, sequenceDiffs) {
    if (!sequence1.getBoundaryScore || !sequence2.getBoundaryScore) {
        return sequenceDiffs;
    }
    for(let i = 0; i < sequenceDiffs.length; i++){
        const diff = sequenceDiffs[i];
        if (diff.seq1Range.isEmpty) {
            const seq2PrevEndExclusive = i > 0 ? sequenceDiffs[i - 1].seq2Range.endExclusive : -1;
            const seq2NextStart = i + 1 < sequenceDiffs.length ? sequenceDiffs[i + 1].seq2Range.start : sequence2.length;
            sequenceDiffs[i] = shiftDiffToBetterPosition(diff, sequence1, sequence2, seq2NextStart, seq2PrevEndExclusive);
        } else if (diff.seq2Range.isEmpty) {
            const seq1PrevEndExclusive = i > 0 ? sequenceDiffs[i - 1].seq1Range.endExclusive : -1;
            const seq1NextStart = i + 1 < sequenceDiffs.length ? sequenceDiffs[i + 1].seq1Range.start : sequence1.length;
            sequenceDiffs[i] = shiftDiffToBetterPosition(diff.reverse(), sequence2, sequence1, seq1NextStart, seq1PrevEndExclusive).reverse();
        }
    }
    return sequenceDiffs;
}
function shiftDiffToBetterPosition(diff, sequence1, sequence2, seq2NextStart, seq2PrevEndExclusive) {
    const maxShiftLimit = 20; // To prevent performance issues
    // don't touch previous or next!
    let deltaBefore = 1;
    while(diff.seq2Range.start - deltaBefore > seq2PrevEndExclusive && sequence2.getElement(diff.seq2Range.start - deltaBefore) === sequence2.getElement(diff.seq2Range.endExclusive - deltaBefore) && deltaBefore < maxShiftLimit){
        deltaBefore++;
    }
    deltaBefore--;
    let deltaAfter = 0;
    while(diff.seq2Range.start + deltaAfter < seq2NextStart && sequence2.getElement(diff.seq2Range.start + deltaAfter) === sequence2.getElement(diff.seq2Range.endExclusive + deltaAfter) && deltaAfter < maxShiftLimit){
        deltaAfter++;
    }
    if (deltaBefore === 0 && deltaAfter === 0) {
        return diff;
    }
    // Visualize `[sequence1.text, diff.seq1Range.start + deltaAfter]`
    // and `[sequence2.text, diff.seq2Range.start + deltaAfter, diff.seq2Range.endExclusive + deltaAfter]`
    let bestDelta = 0;
    let bestScore = -1;
    // find best scored delta
    for(let delta = -deltaBefore; delta <= deltaAfter; delta++){
        const seq2OffsetStart = diff.seq2Range.start + delta;
        const seq2OffsetEndExclusive = diff.seq2Range.endExclusive + delta;
        const seq1Offset = diff.seq1Range.start + delta;
        const score = sequence1.getBoundaryScore(seq1Offset) + sequence2.getBoundaryScore(seq2OffsetStart) + sequence2.getBoundaryScore(seq2OffsetEndExclusive);
        if (score > bestScore) {
            bestScore = score;
            bestDelta = delta;
        }
    }
    if (bestDelta !== 0) {
        return new SequenceDiff(diff.seq1Range.delta(bestDelta), diff.seq2Range.delta(bestDelta));
    }
    return diff;
}

;// CONCATENATED MODULE: ./src/vs/editor/common/diff/algorithms/myersDiffAlgorithm.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ function myersDiffAlgorithm_define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}


/**
 * An O(ND) diff algorithm that has a quadratic space worst-case complexity.
*/ class MyersDiffAlgorithm {
    compute(seq1, seq2, timeout = InfiniteTimeout.instance) {
        // These are common special cases.
        // The early return improves performance dramatically.
        if (seq1.length === 0 || seq2.length === 0) {
            return DiffAlgorithmResult.trivial(seq1, seq2);
        }
        function getXAfterSnake(x, y) {
            while(x < seq1.length && y < seq2.length && seq1.getElement(x) === seq2.getElement(y)){
                x++;
                y++;
            }
            return x;
        }
        let d = 0;
        // V[k]: X value of longest d-line that ends in diagonal k.
        // d-line: path from (0,0) to (x,y) that uses exactly d non-diagonals.
        // diagonal k: Set of points (x,y) with x-y = k.
        const V = new FastInt32Array();
        V.set(0, getXAfterSnake(0, 0));
        const paths = new FastArrayNegativeIndices();
        paths.set(0, V.get(0) === 0 ? null : new SnakePath(null, 0, 0, V.get(0)));
        let k = 0;
        loop: while(true){
            d++;
            for(k = -d; k <= d; k += 2){
                if (!timeout.isValid()) {
                    return DiffAlgorithmResult.trivialTimedOut(seq1, seq2);
                }
                const maxXofDLineTop = k === d ? -1 : V.get(k + 1); // We take a vertical non-diagonal
                const maxXofDLineLeft = k === -d ? -1 : V.get(k - 1) + 1; // We take a horizontal non-diagonal (+1 x)
                const x = Math.min(Math.max(maxXofDLineTop, maxXofDLineLeft), seq1.length);
                const y = x - k;
                const newMaxX = getXAfterSnake(x, y);
                V.set(k, newMaxX);
                const lastPath = x === maxXofDLineTop ? paths.get(k + 1) : paths.get(k - 1);
                paths.set(k, newMaxX !== x ? new SnakePath(lastPath, x, y, newMaxX - x) : lastPath);
                if (V.get(k) === seq1.length && V.get(k) - k === seq2.length) {
                    break loop;
                }
            }
        }
        let path = paths.get(k);
        const result = [];
        let lastAligningPosS1 = seq1.length;
        let lastAligningPosS2 = seq2.length;
        while(true){
            const endX = path ? path.x + path.length : 0;
            const endY = path ? path.y + path.length : 0;
            if (endX !== lastAligningPosS1 || endY !== lastAligningPosS2) {
                result.push(new SequenceDiff(new OffsetRange(endX, lastAligningPosS1), new OffsetRange(endY, lastAligningPosS2)));
            }
            if (!path) {
                break;
            }
            lastAligningPosS1 = path.x;
            lastAligningPosS2 = path.y;
            path = path.prev;
        }
        result.reverse();
        return new DiffAlgorithmResult(result, false);
    }
}
class SnakePath {
    constructor(prev, x, y, length){
        myersDiffAlgorithm_define_property(this, "prev", void 0);
        myersDiffAlgorithm_define_property(this, "x", void 0);
        myersDiffAlgorithm_define_property(this, "y", void 0);
        myersDiffAlgorithm_define_property(this, "length", void 0);
        this.prev = prev;
        this.x = x;
        this.y = y;
        this.length = length;
    }
}
/**
 * An array that supports fast negative indices.
*/ class FastInt32Array {
    get(idx) {
        if (idx < 0) {
            idx = -idx - 1;
            return this.negativeArr[idx];
        } else {
            return this.positiveArr[idx];
        }
    }
    set(idx, value) {
        if (idx < 0) {
            idx = -idx - 1;
            if (idx >= this.negativeArr.length) {
                const arr = this.negativeArr;
                this.negativeArr = new Int32Array(arr.length * 2);
                this.negativeArr.set(arr);
            }
            this.negativeArr[idx] = value;
        } else {
            if (idx >= this.positiveArr.length) {
                const arr = this.positiveArr;
                this.positiveArr = new Int32Array(arr.length * 2);
                this.positiveArr.set(arr);
            }
            this.positiveArr[idx] = value;
        }
    }
    constructor(){
        myersDiffAlgorithm_define_property(this, "positiveArr", new Int32Array(10));
        myersDiffAlgorithm_define_property(this, "negativeArr", new Int32Array(10));
    }
}
/**
 * An array that supports fast negative indices.
*/ class FastArrayNegativeIndices {
    get(idx) {
        if (idx < 0) {
            idx = -idx - 1;
            return this.negativeArr[idx];
        } else {
            return this.positiveArr[idx];
        }
    }
    set(idx, value) {
        if (idx < 0) {
            idx = -idx - 1;
            this.negativeArr[idx] = value;
        } else {
            this.positiveArr[idx] = value;
        }
    }
    constructor(){
        myersDiffAlgorithm_define_property(this, "positiveArr", []);
        myersDiffAlgorithm_define_property(this, "negativeArr", []);
    }
}

;// CONCATENATED MODULE: ./src/vs/editor/common/diff/linesDiffComputer.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ function linesDiffComputer_define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class LinesDiff {
    constructor(changes, hitTimeout){
        linesDiffComputer_define_property(this, "changes", void 0);
        linesDiffComputer_define_property(this, "hitTimeout", void 0);
        this.changes = changes;
        this.hitTimeout = hitTimeout;
    }
}
/**
 * Maps a line range in the original text model to a line range in the modified text model.
 */ class LineRangeMapping {
    toString() {
        return `{${this.originalRange.toString()}->${this.modifiedRange.toString()}}`;
    }
    get changedLineCount() {
        return Math.max(this.originalRange.length, this.modifiedRange.length);
    }
    constructor(originalRange, modifiedRange, innerChanges){
        /**
	 * The line range in the original text model.
	 */ linesDiffComputer_define_property(this, "originalRange", void 0);
        /**
	 * The line range in the modified text model.
	 */ linesDiffComputer_define_property(this, "modifiedRange", void 0);
        /**
	 * If inner changes have not been computed, this is set to undefined.
	 * Otherwise, it represents the character-level diff in this line range.
	 * The original range of each range mapping should be contained in the original line range (same for modified), exceptions are new-lines.
	 * Must not be an empty array.
	 */ linesDiffComputer_define_property(this, "innerChanges", void 0);
        this.originalRange = originalRange;
        this.modifiedRange = modifiedRange;
        this.innerChanges = innerChanges;
    }
}
/**
 * Maps a range in the original text model to a range in the modified text model.
 */ class RangeMapping {
    toString() {
        return `{${this.originalRange.toString()}->${this.modifiedRange.toString()}}`;
    }
    constructor(originalRange, modifiedRange){
        /**
	 * The original range.
	 */ linesDiffComputer_define_property(this, "originalRange", void 0);
        /**
	 * The modified range.
	 */ linesDiffComputer_define_property(this, "modifiedRange", void 0);
        this.originalRange = originalRange;
        this.modifiedRange = modifiedRange;
    }
}

;// CONCATENATED MODULE: ./src/vs/editor/common/diff/standardLinesDiffComputer.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/ function standardLinesDiffComputer_define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}











class StandardLinesDiffComputer {
    computeDiff(originalLines, modifiedLines, options) {
        const timeout = options.maxComputationTimeMs === 0 ? InfiniteTimeout.instance : new DateTimeout(options.maxComputationTimeMs);
        const considerWhitespaceChanges = !options.ignoreTrimWhitespace;
        const perfectHashes = new Map();
        function getOrCreateHash(text) {
            let hash = perfectHashes.get(text);
            if (hash === undefined) {
                hash = perfectHashes.size;
                perfectHashes.set(text, hash);
            }
            return hash;
        }
        const srcDocLines = originalLines.map((l)=>getOrCreateHash(l.trim()));
        const tgtDocLines = modifiedLines.map((l)=>getOrCreateHash(l.trim()));
        const sequence1 = new LineSequence(srcDocLines, originalLines);
        const sequence2 = new LineSequence(tgtDocLines, modifiedLines);
        const lineAlignmentResult = (()=>{
            if (sequence1.length + sequence2.length < 1500) {
                // Use the improved algorithm for small files
                return this.dynamicProgrammingDiffing.compute(sequence1, sequence2, timeout, (offset1, offset2)=>originalLines[offset1] === modifiedLines[offset2] ? modifiedLines[offset2].length === 0 ? 0.1 : 1 + Math.log(1 + modifiedLines[offset2].length) : 0.99);
            }
            return this.myersDiffingAlgorithm.compute(sequence1, sequence2);
        })();
        let lineAlignments = lineAlignmentResult.diffs;
        let hitTimeout = lineAlignmentResult.hitTimeout;
        lineAlignments = optimizeSequenceDiffs(sequence1, sequence2, lineAlignments);
        const alignments = [];
        const scanForWhitespaceChanges = (equalLinesCount)=>{
            if (!considerWhitespaceChanges) {
                return;
            }
            for(let i = 0; i < equalLinesCount; i++){
                const seq1Offset = seq1LastStart + i;
                const seq2Offset = seq2LastStart + i;
                if (originalLines[seq1Offset] !== modifiedLines[seq2Offset]) {
                    // This is because of whitespace changes, diff these lines
                    const characterDiffs = this.refineDiff(originalLines, modifiedLines, new SequenceDiff(new OffsetRange(seq1Offset, seq1Offset + 1), new OffsetRange(seq2Offset, seq2Offset + 1)), timeout, considerWhitespaceChanges);
                    for (const a of characterDiffs.mappings){
                        alignments.push(a);
                    }
                    if (characterDiffs.hitTimeout) {
                        hitTimeout = true;
                    }
                }
            }
        };
        let seq1LastStart = 0;
        let seq2LastStart = 0;
        for (const diff of lineAlignments){
            assertFn(()=>diff.seq1Range.start - seq1LastStart === diff.seq2Range.start - seq2LastStart);
            const equalLinesCount = diff.seq1Range.start - seq1LastStart;
            scanForWhitespaceChanges(equalLinesCount);
            seq1LastStart = diff.seq1Range.endExclusive;
            seq2LastStart = diff.seq2Range.endExclusive;
            const characterDiffs = this.refineDiff(originalLines, modifiedLines, diff, timeout, considerWhitespaceChanges);
            if (characterDiffs.hitTimeout) {
                hitTimeout = true;
            }
            for (const a of characterDiffs.mappings){
                alignments.push(a);
            }
        }
        scanForWhitespaceChanges(originalLines.length - seq1LastStart);
        const changes = lineRangeMappingFromRangeMappings(alignments, originalLines, modifiedLines);
        return new LinesDiff(changes, hitTimeout);
    }
    refineDiff(originalLines, modifiedLines, diff, timeout, considerWhitespaceChanges) {
        const sourceSlice = new Slice(originalLines, diff.seq1Range, considerWhitespaceChanges);
        const targetSlice = new Slice(modifiedLines, diff.seq2Range, considerWhitespaceChanges);
        const diffResult = sourceSlice.length + targetSlice.length < 500 ? this.dynamicProgrammingDiffing.compute(sourceSlice, targetSlice, timeout) : this.myersDiffingAlgorithm.compute(sourceSlice, targetSlice, timeout);
        let diffs = diffResult.diffs;
        diffs = optimizeSequenceDiffs(sourceSlice, targetSlice, diffs);
        diffs = coverFullWords(sourceSlice, targetSlice, diffs);
        diffs = smoothenSequenceDiffs(sourceSlice, targetSlice, diffs);
        const result = diffs.map((d)=>new RangeMapping(sourceSlice.translateRange(d.seq1Range), targetSlice.translateRange(d.seq2Range)));
        // Assert: result applied on original should be the same as diff applied to original
        return {
            mappings: result,
            hitTimeout: diffResult.hitTimeout
        };
    }
    constructor(){
        standardLinesDiffComputer_define_property(this, "dynamicProgrammingDiffing", new DynamicProgrammingDiffing());
        standardLinesDiffComputer_define_property(this, "myersDiffingAlgorithm", new MyersDiffAlgorithm());
    }
}
function coverFullWords(sequence1, sequence2, sequenceDiffs) {
    const additional = [];
    let lastModifiedWord = undefined;
    function maybePushWordToAdditional() {
        if (!lastModifiedWord) {
            return;
        }
        const originalLength1 = lastModifiedWord.s1Range.length - lastModifiedWord.deleted;
        const originalLength2 = lastModifiedWord.s2Range.length - lastModifiedWord.added;
        if (originalLength1 !== originalLength2) {
        // TODO figure out why this happens
        }
        if (Math.max(lastModifiedWord.deleted, lastModifiedWord.added) + (lastModifiedWord.count - 1) > originalLength1) {
            additional.push(new SequenceDiff(lastModifiedWord.s1Range, lastModifiedWord.s2Range));
        }
        lastModifiedWord = undefined;
    }
    for (const s of sequenceDiffs){
        function processWord(s1Range, s2Range) {
            if (!lastModifiedWord || !lastModifiedWord.s1Range.containsRange(s1Range) || !lastModifiedWord.s2Range.containsRange(s2Range)) {
                if (lastModifiedWord && !(lastModifiedWord.s1Range.endExclusive < s1Range.start && lastModifiedWord.s2Range.endExclusive < s2Range.start)) {
                    const s1Added = OffsetRange.tryCreate(lastModifiedWord.s1Range.endExclusive, s1Range.start);
                    const s2Added = OffsetRange.tryCreate(lastModifiedWord.s2Range.endExclusive, s2Range.start);
                    var _s1Added_length;
                    lastModifiedWord.deleted += (_s1Added_length = s1Added === null || s1Added === void 0 ? void 0 : s1Added.length) !== null && _s1Added_length !== void 0 ? _s1Added_length : 0;
                    var _s2Added_length;
                    lastModifiedWord.added += (_s2Added_length = s2Added === null || s2Added === void 0 ? void 0 : s2Added.length) !== null && _s2Added_length !== void 0 ? _s2Added_length : 0;
                    lastModifiedWord.s1Range = lastModifiedWord.s1Range.join(s1Range);
                    lastModifiedWord.s2Range = lastModifiedWord.s2Range.join(s2Range);
                } else {
                    maybePushWordToAdditional();
                    lastModifiedWord = {
                        added: 0,
                        deleted: 0,
                        count: 0,
                        s1Range: s1Range,
                        s2Range: s2Range
                    };
                }
            }
            const changedS1 = s1Range.intersect(s.seq1Range);
            const changedS2 = s2Range.intersect(s.seq2Range);
            lastModifiedWord.count++;
            var _changedS1_length;
            lastModifiedWord.deleted += (_changedS1_length = changedS1 === null || changedS1 === void 0 ? void 0 : changedS1.length) !== null && _changedS1_length !== void 0 ? _changedS1_length : 0;
            var _changedS2_length;
            lastModifiedWord.added += (_changedS2_length = changedS2 === null || changedS2 === void 0 ? void 0 : changedS2.length) !== null && _changedS2_length !== void 0 ? _changedS2_length : 0;
        }
        const w1Before = sequence1.findWordContaining(s.seq1Range.start - 1);
        const w2Before = sequence2.findWordContaining(s.seq2Range.start - 1);
        const w1After = sequence1.findWordContaining(s.seq1Range.endExclusive);
        const w2After = sequence2.findWordContaining(s.seq2Range.endExclusive);
        if (w1Before && w1After && w2Before && w2After && w1Before.equals(w1After) && w2Before.equals(w2After)) {
            processWord(w1Before, w2Before);
        } else {
            if (w1Before && w2Before) {
                processWord(w1Before, w2Before);
            }
            if (w1After && w2After) {
                processWord(w1After, w2After);
            }
        }
    }
    maybePushWordToAdditional();
    const merged = mergeSequenceDiffs(sequenceDiffs, additional);
    return merged;
}
function mergeSequenceDiffs(sequenceDiffs1, sequenceDiffs2) {
    const result = [];
    while(sequenceDiffs1.length > 0 || sequenceDiffs2.length > 0){
        const sd1 = sequenceDiffs1[0];
        const sd2 = sequenceDiffs2[0];
        let next;
        if (sd1 && (!sd2 || sd1.seq1Range.start < sd2.seq1Range.start)) {
            next = sequenceDiffs1.shift();
        } else {
            next = sequenceDiffs2.shift();
        }
        if (result.length > 0 && result[result.length - 1].seq1Range.endExclusive >= next.seq1Range.start) {
            result[result.length - 1] = result[result.length - 1].join(next);
        } else {
            result.push(next);
        }
    }
    return result;
}
function lineRangeMappingFromRangeMappings(alignments, originalLines, modifiedLines) {
    const changes = [];
    for (const g of group(alignments.map((a)=>getLineRangeMapping(a, originalLines, modifiedLines)), (a1, a2)=>a1.originalRange.overlapOrTouch(a2.originalRange) || a1.modifiedRange.overlapOrTouch(a2.modifiedRange))){
        const first = g[0];
        const last = g[g.length - 1];
        changes.push(new LineRangeMapping(first.originalRange.join(last.originalRange), first.modifiedRange.join(last.modifiedRange), g.map((a)=>a.innerChanges[0])));
    }
    assertFn(()=>{
        return checkAdjacentItems(changes, (m1, m2)=>m2.originalRange.startLineNumber - m1.originalRange.endLineNumberExclusive === m2.modifiedRange.startLineNumber - m1.modifiedRange.endLineNumberExclusive && // There has to be an unchanged line in between (otherwise both diffs should have been joined)
            m1.originalRange.endLineNumberExclusive < m2.originalRange.startLineNumber && m1.modifiedRange.endLineNumberExclusive < m2.modifiedRange.startLineNumber);
    });
    return changes;
}
function getLineRangeMapping(rangeMapping, originalLines, modifiedLines) {
    let lineStartDelta = 0;
    let lineEndDelta = 0;
    // rangeMapping describes the edit that replaces `rangeMapping.originalRange` with `newText := getText(modifiedLines, rangeMapping.modifiedRange)`.
    // original: xxx[ \n <- this line is not modified
    // modified: xxx[ \n
    if (rangeMapping.modifiedRange.startColumn - 1 >= modifiedLines[rangeMapping.modifiedRange.startLineNumber - 1].length && rangeMapping.originalRange.startColumn - 1 >= originalLines[rangeMapping.originalRange.startLineNumber - 1].length) {
        lineStartDelta = 1; // +1 is always possible, as startLineNumber < endLineNumber + 1
    }
    // original: ]xxx \n <- this line is not modified
    // modified: ]xx  \n
    if (rangeMapping.modifiedRange.endColumn === 1 && rangeMapping.originalRange.endColumn === 1 && rangeMapping.originalRange.startLineNumber + lineStartDelta <= rangeMapping.originalRange.endLineNumber && rangeMapping.modifiedRange.startLineNumber + lineStartDelta <= rangeMapping.modifiedRange.endLineNumber) {
        lineEndDelta = -1; // We can only do this if the range is not empty yet
    }
    const originalLineRange = new LineRange(rangeMapping.originalRange.startLineNumber + lineStartDelta, rangeMapping.originalRange.endLineNumber + 1 + lineEndDelta);
    const modifiedLineRange = new LineRange(rangeMapping.modifiedRange.startLineNumber + lineStartDelta, rangeMapping.modifiedRange.endLineNumber + 1 + lineEndDelta);
    return new LineRangeMapping(originalLineRange, modifiedLineRange, [
        rangeMapping
    ]);
}
function* group(items, shouldBeGrouped) {
    let currentGroup;
    let last;
    for (const item of items){
        if (last !== undefined && shouldBeGrouped(last, item)) {
            currentGroup.push(item);
        } else {
            if (currentGroup) {
                yield currentGroup;
            }
            currentGroup = [
                item
            ];
        }
        last = item;
    }
    if (currentGroup) {
        yield currentGroup;
    }
}
class LineSequence {
    getElement(offset) {
        return this.trimmedHash[offset];
    }
    get length() {
        return this.trimmedHash.length;
    }
    getBoundaryScore(length) {
        const indentationBefore = length === 0 ? 0 : getIndentation(this.lines[length - 1]);
        const indentationAfter = length === this.lines.length ? 0 : getIndentation(this.lines[length]);
        return 1000 - (indentationBefore + indentationAfter);
    }
    constructor(trimmedHash, lines){
        standardLinesDiffComputer_define_property(this, "trimmedHash", void 0);
        standardLinesDiffComputer_define_property(this, "lines", void 0);
        this.trimmedHash = trimmedHash;
        this.lines = lines;
    }
}
function getIndentation(str) {
    let i = 0;
    while(i < str.length && (str.charCodeAt(i) === CharCode.Space || str.charCodeAt(i) === CharCode.Tab)){
        i++;
    }
    return i;
}
class Slice {
    toString() {
        return `Slice: "${this.text}"`;
    }
    get text() {
        return [
            ...this.elements
        ].map((e)=>String.fromCharCode(e)).join('');
    }
    getElement(offset) {
        return this.elements[offset];
    }
    get length() {
        return this.elements.length;
    }
    getBoundaryScore(length) {
        //   a   b   c   ,           d   e   f
        // 11  0   0   12  15  6   13  0   0   11
        const prevCategory = getCategory(length > 0 ? this.elements[length - 1] : -1);
        const nextCategory = getCategory(length < this.elements.length ? this.elements[length] : -1);
        if (prevCategory === 6 && nextCategory === 7) {
            // don't break between \r and \n
            return 0;
        }
        let score = 0;
        if (prevCategory !== nextCategory) {
            score += 10;
            if (nextCategory === 1) {
                score += 1;
            }
        }
        score += getCategoryBoundaryScore(prevCategory);
        score += getCategoryBoundaryScore(nextCategory);
        return score;
    }
    translateOffset(offset) {
        // find smallest i, so that lineBreakOffsets[i] <= offset using binary search
        if (this.lineRange.isEmpty) {
            return new Position(this.lineRange.start + 1, 1);
        }
        let i = 0;
        let j = this.firstCharOffsetByLineMinusOne.length;
        while(i < j){
            const k = Math.floor((i + j) / 2);
            if (this.firstCharOffsetByLineMinusOne[k] > offset) {
                j = k;
            } else {
                i = k + 1;
            }
        }
        const offsetOfPrevLineBreak = i === 0 ? 0 : this.firstCharOffsetByLineMinusOne[i - 1];
        return new Position(this.lineRange.start + i + 1, offset - offsetOfPrevLineBreak + 1 + this.offsetByLine[i]);
    }
    translateRange(range) {
        return Range.fromPositions(this.translateOffset(range.start), this.translateOffset(range.endExclusive));
    }
    /**
	 * Finds the word that contains the character at the given offset
	 */ findWordContaining(offset) {
        if (offset < 0 || offset >= this.elements.length) {
            return undefined;
        }
        if (!isWordChar(this.elements[offset])) {
            return undefined;
        }
        // find start
        let start = offset;
        while(start > 0 && isWordChar(this.elements[start - 1])){
            start--;
        }
        // find end
        let end = offset;
        while(end < this.elements.length && isWordChar(this.elements[end])){
            end++;
        }
        return new OffsetRange(start, end);
    }
    constructor(lines, lineRange, considerWhitespaceChanges){
        standardLinesDiffComputer_define_property(this, "lines", void 0);
        standardLinesDiffComputer_define_property(this, "considerWhitespaceChanges", void 0);
        standardLinesDiffComputer_define_property(this, "elements", void 0);
        standardLinesDiffComputer_define_property(this, "firstCharOffsetByLineMinusOne", void 0);
        standardLinesDiffComputer_define_property(this, "lineRange", void 0);
        // To account for trimming
        standardLinesDiffComputer_define_property(this, "offsetByLine", void 0);
        this.lines = lines;
        this.considerWhitespaceChanges = considerWhitespaceChanges;
        this.elements = [];
        this.firstCharOffsetByLineMinusOne = [];
        this.offsetByLine = [];
        // This slice has to have lineRange.length many \n! (otherwise diffing against an empty slice will be problematic)
        // (Unless it covers the entire document, in that case the other slice also has to cover the entire document ands it's okay)
        // If the slice covers the end, but does not start at the beginning, we include just the \n of the previous line.
        let trimFirstLineFully = false;
        if (lineRange.start > 0 && lineRange.endExclusive >= lines.length) {
            lineRange = new OffsetRange(lineRange.start - 1, lineRange.endExclusive);
            trimFirstLineFully = true;
        }
        this.lineRange = lineRange;
        for(let i = this.lineRange.start; i < this.lineRange.endExclusive; i++){
            let line = lines[i];
            let offset = 0;
            if (trimFirstLineFully) {
                offset = line.length;
                line = '';
                trimFirstLineFully = false;
            } else if (!considerWhitespaceChanges) {
                const trimmedStartLine = line.trimStart();
                offset = line.length - trimmedStartLine.length;
                line = trimmedStartLine.trimEnd();
            }
            this.offsetByLine.push(offset);
            for(let i = 0; i < line.length; i++){
                this.elements.push(line.charCodeAt(i));
            }
            // Don't add an \n that does not exist in the document.
            if (i < lines.length - 1) {
                this.elements.push('\n'.charCodeAt(0));
                this.firstCharOffsetByLineMinusOne[i - this.lineRange.start] = this.elements.length;
            }
        }
        // To account for the last line
        this.offsetByLine.push(0);
    }
}
function isWordChar(charCode) {
    return charCode >= CharCode.a && charCode <= CharCode.z || charCode >= CharCode.A && charCode <= CharCode.Z || charCode >= CharCode.Digit0 && charCode <= CharCode.Digit9;
}
var CharBoundaryCategory;
(function(CharBoundaryCategory) {
    CharBoundaryCategory[CharBoundaryCategory["WordLower"] = 0] = "WordLower";
    CharBoundaryCategory[CharBoundaryCategory["WordUpper"] = 1] = "WordUpper";
    CharBoundaryCategory[CharBoundaryCategory["WordNumber"] = 2] = "WordNumber";
    CharBoundaryCategory[CharBoundaryCategory["End"] = 3] = "End";
    CharBoundaryCategory[CharBoundaryCategory["Other"] = 4] = "Other";
    CharBoundaryCategory[CharBoundaryCategory["Space"] = 5] = "Space";
    CharBoundaryCategory[CharBoundaryCategory["LineBreakCR"] = 6] = "LineBreakCR";
    CharBoundaryCategory[CharBoundaryCategory["LineBreakLF"] = 7] = "LineBreakLF";
})(CharBoundaryCategory || (CharBoundaryCategory = {}));
const score = {
    [0]: 0,
    [1]: 0,
    [2]: 0,
    [3]: 10,
    [4]: 2,
    [5]: 3,
    [6]: 10,
    [7]: 10
};
function getCategoryBoundaryScore(category) {
    return score[category];
}
function getCategory(charCode) {
    if (charCode === CharCode.LineFeed) {
        return 7;
    } else if (charCode === CharCode.CarriageReturn) {
        return 6;
    } else if (isSpace(charCode)) {
        return 5;
    } else if (charCode >= CharCode.a && charCode <= CharCode.z) {
        return 0;
    } else if (charCode >= CharCode.A && charCode <= CharCode.Z) {
        return 1;
    } else if (charCode >= CharCode.Digit0 && charCode <= CharCode.Digit9) {
        return 2;
    } else if (charCode === -1) {
        return 3;
    } else {
        return 4;
    }
}
function isSpace(charCode) {
    return charCode === CharCode.Space || charCode === CharCode.Tab;
}

;// CONCATENATED MODULE: ./src/index.ts

function computeDiff(originalLines, modifiedLines, options) {
    var _diffComputer_computeDiff;
    let diffComputer = new StandardLinesDiffComputer();
    return (_diffComputer_computeDiff = diffComputer.computeDiff(originalLines, modifiedLines, options)) === null || _diffComputer_computeDiff === void 0 ? void 0 : _diffComputer_computeDiff.changes.map((changes)=>{
        let originalStartLineNumber;
        let originalEndLineNumber;
        let modifiedStartLineNumber;
        let modifiedEndLineNumber;
        let innerChanges = changes.innerChanges;
        originalStartLineNumber = changes.originalRange.startLineNumber - 1;
        originalEndLineNumber = changes.originalRange.endLineNumberExclusive - 2;
        modifiedStartLineNumber = changes.modifiedRange.startLineNumber - 1;
        modifiedEndLineNumber = changes.modifiedRange.endLineNumberExclusive - 2;
        return {
            origStart: originalStartLineNumber,
            origEnd: originalEndLineNumber,
            editStart: modifiedStartLineNumber,
            editEnd: modifiedEndLineNumber,
            charChanges: innerChanges === null || innerChanges === void 0 ? void 0 : innerChanges.map((m)=>({
                    originalStartLineNumber: m.originalRange.startLineNumber - 1,
                    originalStartColumn: m.originalRange.startColumn - 1,
                    originalEndLineNumber: m.originalRange.endLineNumber - 1,
                    originalEndColumn: m.originalRange.endColumn - 1,
                    modifiedStartLineNumber: m.modifiedRange.startLineNumber - 1,
                    modifiedStartColumn: m.modifiedRange.startColumn - 1,
                    modifiedEndLineNumber: m.modifiedRange.endLineNumber - 1,
                    modifiedEndColumn: m.modifiedRange.endColumn - 1
                }))
        };
    });
}

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=bundle.vscode_diff.js.map
