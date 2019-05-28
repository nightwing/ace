
"use strict";

/*
 * I hate doing this, but we need some way to determine if the user is on a Mac
 * The reason is that users have different expectations of their key combinations.
 *
 * Take copy as an example, Mac people expect to use CMD or APPLE + C
 * Windows folks expect to use CTRL + C
 */
export const OS = {
    LINUX: "LINUX",
    MAC: "MAC",
    WINDOWS: "WINDOWS"
};

/*
 * Return an exports.OS constant
 */
export const getOS = function() {
    if (exports.isMac) {
        return exports.OS.MAC;
    } else if (exports.isLinux) {
        return exports.OS.LINUX;
    } else {
        return exports.OS.WINDOWS;
    }
};

// this can be called in non browser environments (e.g. from ace/requirejs/text)
var _navigator = typeof navigator == "object" ? navigator : {};

var os = (/mac|win|linux/i.exec(_navigator.platform) || ["other"])[0].toLowerCase();
var ua = _navigator.userAgent || "";
var appName = _navigator.appName || "";

// Is the user using a browser that identifies itself as Windows
export const isWin = os == "win";

// Is the user using a browser that identifies itself as Mac OS
export const isMac = os == "mac";

// Is the user using a browser that identifies itself as Linux
export const isLinux = os == "linux";

// Windows Store JavaScript apps (aka Metro apps written in HTML5 and JavaScript) do not use the "Microsoft Internet Explorer" string in their user agent, but "MSAppHost" instead.
export const isIE = (appName == "Microsoft Internet Explorer" || appName.indexOf("MSAppHost") >= 0)
? parseFloat((ua.match(/(?:MSIE |Trident\/[0-9]+[\.0-9]+;.*rv:)([0-9]+[\.0-9]+)/)||[])[1])
: parseFloat((ua.match(/(?:Trident\/[0-9]+[\.0-9]+;.*rv:)([0-9]+[\.0-9]+)/)||[])[1]); // for ie

export const isOldIE = exports.isIE && exports.isIE < 9;

// Is this Firefox or related?
export const isGecko = exports.isMozilla = ua.match(/ Gecko\/\d+/);

// Is this Opera 
export const isOpera = typeof opera == "object" && Object.prototype.toString.call(window.opera) == "[object Opera]";

// Is the user using a browser that identifies itself as WebKit 
export const isWebKit = parseFloat(ua.split("WebKit/")[1]) || undefined;

export const isChrome = parseFloat(ua.split(" Chrome/")[1]) || undefined;
export const isEdge = parseFloat(ua.split(" Edge/")[1]) || undefined;
export const isAIR = ua.indexOf("AdobeAIR") >= 0;
export const isIPad = ua.indexOf("iPad") >= 0;
export const isAndroid = ua.indexOf("Android") >= 0;
export const isChromeOS = ua.indexOf(" CrOS ") >= 0;
export const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

if (exports.isIOS) exports.isMac = true;

export const isMobile = exports.isIPad || exports.isAndroid;
