"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
var compileRegex = {
    lineSplit: /\n\n|\r\n\r\n/,
    sectionSplit: /\n|\r\n/,
    parameterSet: /\((.*)\)/,
    paramterSplit: /,(?=(?:[^"]*"[^"]*")*[^"]*$)/g
};
function compile(originCode) {
    var codeSections = originCode.split(compileRegex.lineSplit);
    codeSections.forEach(function (eachSection) {
        var splitedCodeLine = eachSection.split(compileRegex.sectionSplit);
        var eachCommand = new Array();
        var codeLines = new Array();
        splitedCodeLine.forEach(function (eachLine) {
            var paramRegex = compileRegex.parameterSet;
            console.log(eachLine);
            if (eachLine.length <= 0) {
                console.log('its empty string');
                return;
            }
            var parameterSet = paramRegex.exec(eachLine)[1];
            var parameters = parameterSet.split(compileRegex.paramterSplit);
            var command = eachLine.replace(paramRegex, "");
            var trimedParameters = function (parameters) { return parameters.map(function (element) { if (element == null || element == 'null' || element == "null") {
                return null;
            } element = element.trim(); if (element === "") {
                return null;
            } return element; }); };
            var codeLineObj = new Command(command.trim().toLowerCase(), trimedParameters(parameters));
            if (defineCommandList.has(codeLineObj.command)) {
                defines.push(codeLineObj);
            }
            else {
                codeLines.push(codeLineObj);
            }
        });
        scriptHandler.scriptSections.push(codeLines);
    });
}
exports.compile = compile;
