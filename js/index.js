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

    $("#fullscreen").click(function (ev) {
        $.ajax({
            type: "POST",
            url: "/share",
            data: JSON.stringify({ source: bunEditor.getValue() }),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function (res) {
                if (res.url) {
                    location.href = "/editor.html#" + res.url;
                } else {
                    console.log("error");
                }
            },
            error: function () {
                console.log("error");
            }
        });
    });

    Playground.CreateTargetChanger("#generator-selector", bunEditor, outputViewer);
    Playground.CreateSampleSelector("#sample-selector", GetSample);

    GenerateServer();
});
