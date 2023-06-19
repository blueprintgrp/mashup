"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateEqualityExpression = exports.evaluateMemberExpression = exports.evaluateCallExpression = exports.evaluateObjectExpression = exports.evaluateAssignment = exports.evaluateIdentifier = exports.evaluateBinaryExpression = exports.evaluateStringBinaryExpression = exports.evaluateNumericBinaryExpression = void 0;
var lexer_1 = require("../../frontend/lexer");
var environment_1 = require("../environment");
var interpreter_1 = require("../interpreter");
function evaluateNumericBinaryExpression(leftHandSide, rightHandSide, operator) {
    var result;
    if (operator == '+')
        result = leftHandSide.value + rightHandSide.value;
    else if (operator == '-')
        result = leftHandSide.value - rightHandSide.value;
    else if (operator == '*')
        result = leftHandSide.value * rightHandSide.value;
    else if (operator == '/')
        result = leftHandSide.value / rightHandSide.value; // TODO: Divison by zero checks
    else
        result = leftHandSide.value % rightHandSide.value;
    return { value: result, type: 'number' };
}
exports.evaluateNumericBinaryExpression = evaluateNumericBinaryExpression;
function evaluateStringBinaryExpression(leftHandSide, rightHandSide, operator) {
    var result;
    if (operator == '+')
        result = leftHandSide.value + rightHandSide.value;
    else
        throw "Cannot use operator \"".concat(operator, "\" in string binary expression.");
    return { value: result, type: 'string' };
}
exports.evaluateStringBinaryExpression = evaluateStringBinaryExpression;
function evaluateBinaryExpression(binop, env) {
    var leftHandSide = (0, interpreter_1.evaluate)(binop.left, env);
    var rightHandSide = (0, interpreter_1.evaluate)(binop.right, env);
    if (leftHandSide.type == 'number' && rightHandSide.type == 'number') {
        return evaluateNumericBinaryExpression(leftHandSide, rightHandSide, binop.operator);
    }
    else if (leftHandSide.type == 'string' && rightHandSide.type == 'string') {
        return evaluateStringBinaryExpression(leftHandSide, rightHandSide, binop.operator);
    }
    // One or both are NULL
    return { type: 'null', value: 'null' };
}
exports.evaluateBinaryExpression = evaluateBinaryExpression;
function evaluateIdentifier(ident, env) {
    var val = env.lookupVar(ident.symbol);
    return val;
}
exports.evaluateIdentifier = evaluateIdentifier;
function evaluateAssignment(node, env) {
    if (node.assigne.kind !== 'Identifier')
        throw "Invalid left hand side in assignment expression ".concat(JSON.stringify(node.assigne), ".");
    var varname = (node.assigne).symbol;
    return env.assignVar(varname, (0, interpreter_1.evaluate)(node.value, env));
}
exports.evaluateAssignment = evaluateAssignment;
function evaluateObjectExpression(obj, env) {
    var object = { type: 'object', properties: new Map() };
    for (var _i = 0, _a = obj.properties; _i < _a.length; _i++) {
        var _b = _a[_i], key = _b.key, value = _b.value;
        var runtimeValue = (value == undefined) ? env.lookupVar(key) : (0, interpreter_1.evaluate)(value, env);
        object.properties.set(key, runtimeValue);
    }
    return object;
}
exports.evaluateObjectExpression = evaluateObjectExpression;
function evaluateCallExpression(expression, env) {
    var args = expression.args.map(function (arg) { return (0, interpreter_1.evaluate)(arg, env); });
    var fun = (0, interpreter_1.evaluate)(expression.caller, env);
    if (fun.type == 'stdfun') {
        var result = fun.call(args, env);
        return result;
    }
    if (fun.type == 'function') {
        var func = fun;
        var scope = new environment_1.default(func.declarationEnv);
        for (var i = 0; i < func.parameters.length; i++) {
            // TODO: Check the bounds here
            // verify arity of function
            var varname = func.parameters[i];
            scope.declareVar(varname, args[i], false);
        }
        var result = { type: 'null', value: 'null' };
        // evaluate the function body line by line
        for (var _i = 0, _a = func.body; _i < _a.length; _i++) {
            var statement = _a[_i];
            result = (0, interpreter_1.evaluate)(statement, scope);
        }
        return result;
    }
    throw 'Cannot call value that is not a function: ' + JSON.stringify(fun);
}
exports.evaluateCallExpression = evaluateCallExpression;
function evaluateMemberExpression(expression, env) {
    var object = (0, interpreter_1.evaluate)(expression.object, env);
    var property = expression.property.symbol;
    if (object.type === 'object') {
        var objValue = object;
        var propertyValue = objValue.properties.get(property);
        if (propertyValue !== undefined) {
            return propertyValue;
        }
        else {
            throw "Property \"".concat(property, "\" does not exist on object.");
        }
    }
    else {
        throw 'Cannot access property on non-object value.';
    }
}
exports.evaluateMemberExpression = evaluateMemberExpression;
function evaluateEqualityExpression(expression, env) {
    var left = (0, interpreter_1.evaluate)(expression.left, env);
    var right = (0, interpreter_1.evaluate)(expression.right, env);
    var operator = expression.operator;
    if (isTruthy(left, operator, right)) {
        return { type: 'boolean', value: true };
    }
    else {
        return { type: 'boolean', value: false };
    }
}
exports.evaluateEqualityExpression = evaluateEqualityExpression;
function isTruthy(left, operator, right) {
    switch (operator) {
        case lexer_1.TokenType.DoubleEquals:
            if (left.value == right.value)
                return true;
            else
                return false;
        case lexer_1.TokenType.NotEqual:
            if (left.value != right.value)
                return true;
            else
                return false;
    }
}
