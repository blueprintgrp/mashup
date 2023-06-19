"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateIfStatement = exports.evaluateFunctionDeclaration = exports.evaluateVariableDeclaration = exports.evaluateProgram = void 0;
var interpreter_1 = require("../interpreter");
function evaluateProgram(program, env) {
    var lastEvaluated = { type: 'null', value: 'null' };
    for (var _i = 0, _a = program.body; _i < _a.length; _i++) {
        var statement = _a[_i];
        lastEvaluated = (0, interpreter_1.evaluate)(statement, env);
    }
    return lastEvaluated;
}
exports.evaluateProgram = evaluateProgram;
function evaluateVariableDeclaration(declaration, env) {
    var value = declaration.value ? (0, interpreter_1.evaluate)(declaration.value, env) : { value: 'null', type: 'null' };
    return env.declareVar(declaration.identifier, value, declaration.constant);
}
exports.evaluateVariableDeclaration = evaluateVariableDeclaration;
function evaluateFunctionDeclaration(declaration, env) {
    var fun = {
        type: 'function',
        name: declaration.name,
        parameters: declaration.parameters,
        declarationEnv: env,
        body: declaration.body
    };
    return env.declareVar(declaration.name, fun, true);
}
exports.evaluateFunctionDeclaration = evaluateFunctionDeclaration;
function evaluateIfStatement(statement, env) {
    var conditional = (0, interpreter_1.evaluate)(statement.conditional, env);
    if (conditional.type == 'boolean') {
        var result = conditional;
        var runtimeVal = result;
        if (isTruthy(runtimeVal)) {
            if (Array.isArray(statement.consequent)) {
                // Evaluate each statement in the consequent array
                for (var _i = 0, _a = statement.consequent; _i < _a.length; _i++) {
                    var consequentStatement = _a[_i];
                    (0, interpreter_1.evaluate)(consequentStatement, env);
                }
            }
            else {
                // Evaluate the single consequent statement
                return (0, interpreter_1.evaluate)(statement.consequent, env);
            }
        }
        else {
            if (statement.alternate) {
                if (Array.isArray(statement.alternate)) {
                    // Evaluate each statement in the alternate array
                    for (var _b = 0, _c = statement.alternate; _b < _c.length; _b++) {
                        var alternateStatement = _c[_b];
                        (0, interpreter_1.evaluate)(alternateStatement, env);
                    }
                }
                else {
                    // Evaluate the single alternate statement
                    return (0, interpreter_1.evaluate)(statement.alternate, env);
                }
            }
        }
    }
    else {
        if (isTruthy(conditional)) {
            if (Array.isArray(statement.consequent)) {
                // Evaluate each statement in the consequent array
                for (var _d = 0, _e = statement.consequent; _d < _e.length; _d++) {
                    var consequentStatement = _e[_d];
                    (0, interpreter_1.evaluate)(consequentStatement, env);
                }
            }
            else {
                // Evaluate the single consequent statement
                return (0, interpreter_1.evaluate)(statement.consequent, env);
            }
        }
        else {
            if (statement.alternate) {
                if (Array.isArray(statement.alternate)) {
                    // Evaluate each statement in the alternate array
                    for (var _f = 0, _g = statement.alternate; _f < _g.length; _f++) {
                        var alternateStatement = _g[_f];
                        (0, interpreter_1.evaluate)(alternateStatement, env);
                    }
                }
                else {
                    // Evaluate the single alternate statement
                    return (0, interpreter_1.evaluate)(statement.alternate, env);
                }
            }
        }
    }
    return { type: 'null', value: 'null' };
}
exports.evaluateIfStatement = evaluateIfStatement;
function isTruthy(conditional) {
    if (conditional.type == 'boolean') {
        var bool = conditional.value;
        if (bool)
            return true;
        else
            return false;
    }
    if (conditional) {
        return true;
    }
    else {
        return false;
    }
}
