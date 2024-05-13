"use strict";

class Scope extends String {
    /**
     * @param {string} name
     * @param {Scope} [parent]
     */
    constructor(name, parent) {
        super(name.toString());
        this.name = name.toString();
        // if (typeof name != "string")
        this.value = name;
        this.children = {};
        this.parent = parent;
    }
    toString() {
        return this.name;
    }
    /**
     * @param {string} name
     * @param {string|undefined} [extraId]
     */
    get(name, extraId) {
        var id = name.toString() + (extraId || "");
        return this.children[id] || (
            this.children[id] = new Scope(name, this)
        );
    }
    find(states) {
        var s = this;
        while (s && !states[s.name]) {
            s = s.parent;
        }
        return states[s ? s.name : "start"];
    }
    // replace(a, b) {
    //     return this.name.replace(a, b);
    // }
    // indexOf(a, b) {
    //     return this.name.indexOf(a, b);
    // }
    /**
     * @param {string} states
     */
    hasParent(states) {
        var s = this;
        while (s && states !== s.name) {
            s = s.parent;
        }
        return s ? 1 : -1;
    }
    count() {
        var s = 1;
        for (var i in this.children) s += this.children[i].count();
        return s;
    }
    /**
     *
     * @returns {string[]}
     */
    getAllScopeNames() {
        var scopeNames = [];
        var self = this;
        do {
            scopeNames.push(self.name);
        } while (self = self.parent);
        return scopeNames;
    }

    toPrettyString() {
        var iter = function (scope, indent) {
            var children = Object.keys(scope.children)
            if (!children.length) return indent + scope.name;
            var v = indent + "+" + scope.name + "("+ scope.count() + ")"
            return v + "\n" + children.map(function(ch) {
                return iter(scope.children[ch], indent + "| ")        
            }).join("\n")
        }
        return iter(this, "");
    }

    $toArray() {
        var stack = [];
        var scope = this;
        while (scope.parent) {
            stack.push(scope.value);
            scope = scope.parent;
        }
        return stack;
    }
} 

exports.Scope = Scope;