///<reference path='../typings/jquery/jquery.d.ts' />
///<reference path='./config.ts' />
///<reference path='./lib.ts' />
var Debug = {};

$(function () {
    var bunEditor = Playground.CreateEditor("bun-editor", { syntax: "typescript", checker: true });
    var outputViewer = Playground.CreateEditor("output-viewer", { readOnly: true });

    Debug.bunEditor = bunEditor;
    Debug.outputViewer = outputViewer;

    var GetSample = Playground.GetSampleFunction(bunEditor);
    var GenerateCode = Playground.GetGenerateFunction(bunEditor, outputViewer);

    var $UrlDisplay = $("#url-display");

    function showUrlDisplay() {
        $UrlDisplay.show();
        $UrlDisplay.val(location.protocol + "//" + location.host + "/editor.html" + location.hash);
        $UrlDisplay.focus();
        $UrlDisplay.select();
    }

    function hideUrlDisplay() {
        $UrlDisplay.val("");
        $UrlDisplay.hide();
    }

    bunEditor.on('change', function (cm, obj) {
        location.hash = '';
        hideUrlDisplay();
    });

    $("#compile").click(function (ev) {
        GenerateCode();
    });

    $("#share").click(function (ev) {
        $.ajax({
            type: "POST",
            url: "/share",
            data: JSON.stringify({ source: bunEditor.getValue() }),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function (res) {
                if (res.url) {
                    location.hash = res.url;
                    showUrlDisplay();
                } else {
                    console.log("error");
                }
            },
            error: function () {
                console.log("error");
            }
        });
    });

    Playground.CreateTargetChanger("#generator-selector", bunEditor, outputViewer, GenerateCode);
    Playground.CreateSampleSelector("#sample-selector", GetSample);

    if (location.hash != "" && location.hash != null) {
        var url = location.hash;
        url = url.substring(1, url.length);
        $.ajax({
            type: "GET",
            url: "/p/" + url,
            success: function (res) {
                bunEditor.setValue(res);
                bunEditor.clearSelection();
                GenerateCode();
                location.hash = url;
            },
            error: function () {
                console.log("error");
            }
        });
    } else {
        GenerateCode();
    }
});
