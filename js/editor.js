///<reference path='../typings/jquery/jquery.d.ts' />
///<reference path='./config.ts' />
///<reference path='./lib.ts' />
var Debug = {};

$(function () {
    var component = new Playground.PlaygroundEditor({
        query: "bun-editor",
        syntax: "typescript",
        checker: true
    }, {
        query: "output-viewer",
        readOnly: true
    });

    Debug.component = component;

    var bunEditor = component.codeEditor;
    var outputViewer = component.outputViewer;

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
        Playground.ClearHighlightLines(bunEditor.getSession());
    });

    $("#translate").click(function (ev) {
        component.getGeneratedCode();
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

    component.createTargetChanger("#generator-selector");
    component.createSampleSelector("#sample-selector");

    if (location.hash != "" && location.hash != null) {
        var url = location.hash;
        url = url.substring(1, url.length);
        $.ajax({
            type: "GET",
            url: "/p/" + url,
            success: function (res) {
                bunEditor.setValue(res);
                bunEditor.clearSelection();
                component.getGeneratedCode();
                location.hash = url;
            },
            error: function () {
                console.log("error");
            }
        });
    } else {
        component.getGeneratedCode();
    }
});
