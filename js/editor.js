///<reference path='../typings/jquery/jquery.d.ts' />
///<reference path='./config.ts' />
///<reference path='./lib.ts' />
var Debug = {};

$(function () {
    var bunEditor = Playground.CreateEditor("bun-editor", { syntax: "typescript" });
    var outputViewer = Playground.CreateEditor("output-viewer", { readOnly: true });

    Debug.bunEditor = bunEditor;
    Debug.outputViewer = outputViewer;

    var GetSample = function (sampleName) {
        $.ajax({
            type: "GET",
            url: "/samples/" + sampleName + ".bun",
            success: function (res) {
                bunEditor.setValue(res);
                bunEditor.clearSelection();
            },
            error: function () {
                console.log("error");
            }
        });
    };

    var GenerateServer = function () {
        $.ajax({
            type: "POST",
            url: "/compile",
            data: JSON.stringify({ source: bunEditor.getValue(), target: Playground.CodeGenTarget }),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function (res) {
                outputViewer.setValue(res.source);
                outputViewer.clearSelection();
            },
            error: function () {
                console.log("error");
            }
        });
    };

    //FIXME use button
    var timer = null;
    bunEditor.on("change", function (cm, obj) {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(GenerateServer, 400);
    });

    Playground.CreateTargetChanger("#generator-selector", bunEditor, GenerateServer);

    Playground.CreateSampleSelector("#sample-selector", GetSample);

    $("#Target-JavaScript-li").addClass("active");
    GenerateServer();
});
