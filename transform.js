#!/usr/bin/env node
var fs = require("fs");
var Path = require("path")
        
transformFolder("src");
transformFolder("demo");

function transformFolder(path) {
    add(path);
     
    function add(path) {
        try {
            var stat = fs.statSync(path);
        } catch (e) {
            return;
        }
        if (stat.isFile() && /\.js$/.test(path)) {
            //if (/\/_test\//.test(path))
            //    return;
            console.log(path)
            
            var value = fs.readFileSync(path, "utf8");
            
            
            var value1 = value.replace(/(var|let|const) (\w+) = require\(["']([^"']+)["']\).(\w+)/g, function(_, vAr, name, path, origName) {
                // console.log(vAr,  name, path, origName)
                // console.log(`{${vAr}} {${name}} = require("${path}")`)
                
                if (name == origName)
                    return `${vAr} {${name}} = require("${path}")`
                return `${vAr} {${origName}: ${name}} = require("${path}")`
                return _;
            })
            if (isValidJS(value1)) {
                fs.writeFileSync(path, value1, "utf8");
            }
            
            var addExportDefault
            value = value1.replace(/(var|let|const)\s+([{}:,\s\w]+)\s+=\s+require\(["']([^"']+)["']\)/g, function(_, vAr, name, path) {
                path = path.replace(/\.jsm?$|$/, ".jsm")
                
                name = name.replace(/\s*:\s*/g, " as ")
                
                if (name[0] !== "{" && name != "config" 
                    && !/\.css\.jsm$/.test(path)
                    && !/\bkeys\.jsm$/.test(path)
                ) {
                    name = " * as " + name
                }
                return `import ${name} from "${path}"`
                 
            }).replace(/exports.(\w+)\s+=\s+([a-zA-Z]\w+);/g, function(_, a, b) {
                if (/^(true|false)$/.test(b)) return _
                return `export {${b} as ${a}}`
            }).replace(/var (\w+) = exports.\1 = /g, function(_, a) {
                return `export var ${a} = `
            }).replace(/module.exports = exports =/g, function(_, a) {
                addExportDefault = true
                return `var exports =`
            }).replace(/module.exports = /g, function(_, a) {
                addExportDefault = true
                return `var exports =`
            }).replace(/^exports.(\w+) = (function|\[|`)/gm, function(_, a, b) {
                return `export var ${a} = exports.${a} = ${b}`
            }).replace(/^\s*require\(["']([^"']+)["']\);/gm, function(_, path) {
                path = path.replace(/\.jsm?$|$/, ".jsm")
                return `import "${path}";`
            }).replace(/^\s*require\(["'](..?\/config)["']\)\.defineOptions/gm, function(_, path) {
                path = path.replace(/\.jsm?$|$/, ".jsm")
                return `import config from "${path}";\nconfig.defineOptions`
            }).replace(/^\s*require\(["'](\.\/lib\/dom)["']\)\.importCssString/gm, function(_, path) {
                path = path.replace(/\.jsm?$|$/, ".jsm")
                return `import dom from "${path}";\dom.importCssString`
            })
            
            if (addExportDefault)
                value += "export default exports";
            
            if (!/export default/.test(value)) {
                var replaced
                value = value.replace(/"use strict";\n/, function(_) {
                    replaced = true
                    return _ + "\n" + `\nvar exports = {};\nexport default exports;\n`
                })
                if (!replaced) {
                    value = value.replace(/^/, function(_) {
                        replaced = true
                        return `\nvar exports = {};\nexport default exports;\n`
                    })
                }
            }
 
            fs.writeFileSync(path + "m", value, "utf8");
        }
        else if (stat.isDirectory()) {
            if (/node_modules/.test(path)) return;
            if (/demo\/webpack/.test(path)) return;
            var files = fs.readdirSync(path).sort();
            files.forEach(function(name) {
                if (!/[#\s]/.test(name))
                    add(path + "/" + name)
            });
        }
    }
}

function isIndented(v) {
    return v.split("\n").every(function(l) {
        return /^ {4}|^\s*$/.test(l)
    });
}

function isValidJS(str) {
    try {
        // evaluated code can only create variables in this function
        eval("throw 0;" + str);
    } catch(e) {
        if (e === 0)
            return true;
        console.log(e)
        // console.log(str)
    }
    return false;
};