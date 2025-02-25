var fs = require("fs"); 

function replaceInFiles(path, fn) {
    if (Array.isArray(path)) {
        path.forEach(function(x) {
            replaceInFiles(x, fn);
        });
        return;
    }
    var stat = fs.lstatSync(path);
    if (stat.isDirectory()) {
        var files = fs.readdirSync(path);
        files.forEach(function (x) {
            if (x == "node_modules" || x == ".git") return;
            replaceInFiles(path + "/" + x, fn);
        });
    } else if (stat.isFile()) {
        var text = fs.readFileSync(path, "utf8");
        var newText = fn(text, path);
        if (newText != text && typeof newText == "string") {
            console.log(path);
            fs.writeFileSync(path, newText, "utf8");
        }
    }
}


replaceInFiles("./src", function(code, path) {
    if (/_test.js/.test(path)) return;

    return code.replace(/(?:var|let|const) +(\w+)\s*=\s*require\("([^'"]*)"\).(\w+)/g, function(_, name, path, origName) {
        if (name == origName) {
            return `import { ${name} } from "${path}.js"`;
        } else {
            return `import { ${origName} as ${name} } from "${path}.js"`;
        }
        return _;
    });
});