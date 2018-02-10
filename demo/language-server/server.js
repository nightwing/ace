#!/usr/bin/env node

process.chdir(__dirname + "/../..");

var childProcess = require("child_process");
var statics = require("../../static.js");
var WebSocket = require("ws");
var wss = new WebSocket.Server({ 
    server: statics.server, 
    path: "/~ws"
});

var sockets = [];
function remove(ws) {
    var i = sockets.indexOf(ws);
    if (i != -1) sockets.splice(i, 1);
}
wss.on('connection', function connection(ws) {
    sockets.push(ws);
    ws.on("error", function(err) {
        remove(ws);
        console.log(err);
    });
    ws.on("close", function(err) {
        remove(ws);
        console.log(err);
    });
    ws.on('message', function incoming(message) {
        console.log(">>" + JSON.stringify(JSON.parse(message), null, 4))
        lspProcess.send(JSON.parse(message));
    });
});
function broadcast(message) {
    var m = JSON.stringify(message)
    sockets.forEach(function(ws) {
        ws.send(m);
    });
}


var lspProcess = childProcess.fork(__dirname + "/node_modules/.bin/css-languageserver", [
    "--node-ipc" 
], {
    stdio: "inherit"
});
var messageId = 1;
lspProcess.on('message', function(json) {
    broadcast(json);
});

function send(method, params) {
    var message = {
        jsonrpc: "2.0",
        id: messageId++,
        method: method,
        params: params
    };
    lspProcess.send(message);
}

function initialize() {
    send("initialize", {
        rootPath: process.cwd(),
        processId: process.pid,
        capabilities: {
            "workspace": {
                "applyEdit": true,
                "didChangeConfiguration": { "dynamicRegistration": true },
                "didChangeWatchedFiles": { "dynamicRegistration": true },
                "symbol": { "dynamicRegistration": true },
                "executeCommand": { "dynamicRegistration": true },
                "configuration": true
            },
            "textDocument": {
                "synchronization": {
                    "dynamicRegistration": true,
                    "willSave": true,
                    "willSaveWaitUntil": true,
                    "didSave": true
                },
                "completion": {
                    "dynamicRegistration": true,
                    "completionItem": { "snippetSupport": true, "commitCharactersSupport": true }
                },
                "hover": { "dynamicRegistration": true },
                "signatureHelp": { "dynamicRegistration": true },
                "definition": { "dynamicRegistration": true },
                "references": { "dynamicRegistration": true },
                "documentHighlight": { "dynamicRegistration": true },
                "documentSymbol": { "dynamicRegistration": true },
                "codeAction": { "dynamicRegistration": true },
                "codeLens": { "dynamicRegistration": true },
                "formatting": { "dynamicRegistration": true },
                "rangeFormatting": { "dynamicRegistration": true },
                "onTypeFormatting": { "dynamicRegistration": true },
                "rename": { "dynamicRegistration": true },
                "documentLink": { "dynamicRegistration": true }
            }
        },
        
        
        initializationOptions: {},
        trace: "off"
    });
}


// {
//         "rootUri": "file:///f%3A/ace",
//     }


lspProcess.on('message', function (json) {
    console.log(JSON.stringify(json, null, 4));
});
initialize();




