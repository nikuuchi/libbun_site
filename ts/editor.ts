///<reference path='../typings/jquery/jquery.d.ts' />
///<reference path='./config.ts' />
///<reference path='./lib.ts' />

var Debug: any = {};

$(() => {
    var bunEditor = Playground.CreateEditor("bun-editor", { syntax: "typescript" });
    var outputViewer = Playground.CreateEditor("output-viewer", { readOnly: true });

    Debug.bunEditor = bunEditor;
    Debug.outputViewer = outputViewer;

    var GetSample = Playground.GetSampleFunction(bunEditor);
    var GenerateServer = Playground.GetGenerateFunction(bunEditor, outputViewer);

    var $UrlDisplay = $("#url-display");

    function showUrlDisplay() {
        $UrlDisplay.text("http://play.libbun.org/editor.html" + location.hash);
    }

    function hideUrlDisplay() {
        $UrlDisplay.text("");
    }

    bunEditor.on('change', (cm, obj) => {
        location.hash = '';
        hideUrlDisplay();
    });

    $("#compile").click((ev: Event)=>{
        GenerateServer();
    });

    $("#share").click((ev: Event)=>{
        $.ajax({
            type: "POST",
            url: "/share",
            data: JSON.stringify({source: bunEditor.getValue()}),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: (res) => {
                if(res.url) {
                    location.hash = res.url;
                    showUrlDisplay();
                } else {
                    console.log("error");
                }
            },
            error:() => {
                  console.log("error");
            }
        });
    });

    Playground.CreateTargetChanger("#generator-selector", bunEditor, outputViewer);
    Playground.CreateSampleSelector("#sample-selector", GetSample);

    if(location.hash != "" && location.hash != null) {
        var url = location.hash;
        url = url.substring(1, url.length);
        $.ajax({
            type: "GET",
            url: "/p/"+url,
            success: (res) => {
                bunEditor.setValue(res);
                bunEditor.clearSelection();
                GenerateServer();
            },
            error:() => {
                  console.log("error");
            }
        });
    } else {
        GenerateServer();
    }
});
