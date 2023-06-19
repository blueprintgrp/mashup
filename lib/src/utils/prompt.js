"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readline = require("readline-sync");
function default_1(prefix) {
    if (prefix === void 0) { prefix = '>'; }
    var result = readline.question("".concat(prefix, " "));
    return result;
}
exports.default = default_1;
