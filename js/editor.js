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
    }, {
        query: "peg-editor",
        syntax: "typescript",
        checker: true
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
    component.createPegSelector("#peg-selector");

    if (location.hash != "" && location.hash != null) {
        var url = location.hash;
        url = url.substring(1, url.length);
        $.ajax({
            type: "GET",
            url: "/p/" + url,
            success: function (res) {
                bunEditor.setValue(res);
                bunEditor.clearSelection();
                component.getPegBody("konoha", function () {
                    component.getGeneratedCode();
                });
                location.hash = url;
            },
            error: function () {
                console.log("error");
            }
        });
    } else {
        component.getPegBody("konoha", function () {
            component.getGeneratedCode();
        });
    }

    var $togglePegBar = $("#peg-source-toggle");
    var $toggleInputBar = $("#input-source-toggle");
    var toggleEventFunc = function () {
        if ($togglePegBar.attr("class") == "") {
            $togglePegBar.children()[0].className = "glyphicon glyphicon-chevron-up";
            //$("#peg-selector")[0].disabled = true;
        } else {
            $togglePegBar.children()[0].className = "glyphicon glyphicon-chevron-down";
            //$("#peg-selector")[0].disabled = false;
        }
        if ($toggleInputBar.attr("class") == "") {
            $toggleInputBar.children()[0].className = "glyphicon glyphicon-chevron-up";
            //$("#sample-selector")[0].disabled = false;
        } else {
            $toggleInputBar.children()[0].className = "glyphicon glyphicon-chevron-down";
            //$("#sample-selector")[0].disabled = true;
        }
    };
    $togglePegBar.click(function (e) {
        setTimeout(toggleEventFunc, 150);
    });
    $toggleInputBar.click(function (e) {
        setTimeout(toggleEventFunc, 150);
    });
});
