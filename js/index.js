///<reference path='../typings/jquery/jquery.d.ts' />
///<reference path='./lib.ts' />
var Debug = {};

$(function () {
    var component = new Playground.PlaygroundEditor({
        query: "bun-editor",
        syntax: "typescript",
        checker: false,
        line: false
    }, {
        query: "output-viewer",
        readOnly: true,
        checker: false,
        line: false
    });

    Debug.component = component;

    $("#translate").click(function (ev) {
        component.getGeneratedCode();
    });

    $("#fullscreen").click(function (ev) {
        $.ajax({
            type: "POST",
            url: "/share",
            data: JSON.stringify({ source: component.codeEditor.getValue() }),
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

    component.createTargetChanger("#generator-selector");
    component.createSampleSelector("#sample-selector");

    component.getGeneratedCode();
});
