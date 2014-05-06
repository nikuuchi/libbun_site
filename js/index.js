///<reference path='../typings/jquery/jquery.d.ts' />
///<reference path='./lib.ts' />
var Debug = {};

$(function () {
    var bunEditor = Playground.CreateEditor("bun-editor", { syntax: "typescript", checker: false, line: false });
    var outputViewer = Playground.CreateEditor("output-viewer", { readOnly: true, checker: false, line: false });

    Debug.bunEditor = bunEditor;
    Debug.outputViewer = outputViewer;

    var GetSample = Playground.GetSampleFunction(bunEditor);
    var GenerateServer = Playground.GetGenerateFunction(bunEditor, outputViewer);

    $("#compile").click(function (ev) {
        GenerateServer();
    });

    Playground.CreateTargetChanger("#generator-selector", bunEditor, outputViewer);
    Playground.CreateSampleSelector("#sample-selector", GetSample);

    GenerateServer();
});
