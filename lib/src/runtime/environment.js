"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGlobalEnvironment = void 0;
var util = require("node:util");
function createGlobalEnvironment() {
    var env = new Environment();
    // Standard Variables
    env.declareVar('true', { value: true, type: 'boolean' }, true);
    env.declareVar('false', { value: false, type: 'boolean' }, true);
    env.declareVar('null', { value: 'null', type: 'null' }, true);
    // Standard Functions
    function println(args, scope) {
        var log = [];
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var arg = args_1[_i];
            switch (arg.type) {
                case 'number':
                    log.push((arg.value));
                    continue;
                case 'string':
                    log.push(arg.value);
                    continue;
                case 'boolean':
                    log.push((arg.value));
                    continue;
                case 'null':
                    log.push((arg.value));
                    continue;
                default:
                    log.push(arg);
            }
        }
        console.log(util.format.apply(this, log));
        return { type: 'null', value: 'null' };
    }
    function terminate(args, scope) {
        if (args[0] == undefined || args[0].type != 'number') {
            console.log("Process exited with exit code: 1");
            process.exit(1);
        }
        else {
            console.log("Process exited with exit code: 0");
            process.exit(0);
        }
        return { type: 'null', value: 'null' };
    }
    env.declareVar('println', { type: 'stdfun', call: println }, true);
    env.declareVar('terminate', { type: 'stdfun', call: terminate }, true);
    return env;
}
exports.createGlobalEnvironment = createGlobalEnvironment;
var Environment = /** @class */ (function () {
    function Environment(parentENV) {
        var global = parentENV ? true : false;
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }
    Environment.prototype.declareVar = function (varname, value, constant) {
        if (this.variables.has(varname)) {
            throw "Cannot declare variable ".concat(varname, ". As it already is defined.");
        }
        this.variables.set(varname, value);
        if (constant) {
            this.constants.add(varname);
        }
        return value;
    };
    Environment.prototype.assignVar = function (varname, value) {
        var env = this.resolve(varname);
        if (env.constants.has(varname)) {
            throw "Cannot reasign to variable ".concat(varname, " as it's declared as a constant.");
        }
        env.variables.set(varname, value);
        return value;
    };
    Environment.prototype.lookupVar = function (varname) {
        var env = this.resolve(varname);
        return env.variables.get(varname);
    };
    Environment.prototype.resolve = function (varname) {
        if (this.variables.has(varname))
            return this;
        if (this.parent == undefined)
            throw "Cannot resolve ".concat(varname, " as it does not exist.");
        return this.parent.resolve(varname);
    };
    return Environment;
}());
exports.default = Environment;
