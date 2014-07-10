///<reference path='../typings/jquery/jquery.d.ts' />
///<reference path='./config.ts' />
///<reference path='./lib.ts' />

var Debug: any = {};

$(() => {
    var component = new Playground.PlaygroundEditor({
        query: "bun-editor",
        syntax: "typescript",
        checker: true
    },{
        query: "output-viewer",
        readOnly: true
    },{
        query: "peg-editor",
        syntax: "typescript",
        checker: true
    });

    Debug.component = component;

    var bunEditor    = component.codeEditor;
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

    bunEditor.on('change', (cm, obj) => {
        location.hash = '';
        hideUrlDisplay();
        Playground.ClearHighlightLines(bunEditor.getSession());
    });

    $("#translate").click((ev: Event)=>{
        component.getGeneratedCode();
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

    component.createTargetChanger("#generator-selector");
    component.createSampleSelector("#sample-selector");
    component.createPegSelector("#peg-selector");

    if(location.hash != "" && location.hash != null) {
        var url = location.hash;
        url = url.substring(1, url.length);
        $.ajax({
            type: "GET",
            url: "/p/"+url,
            success: (res) => {
                bunEditor.setValue(res);
                bunEditor.clearSelection();
                component.getPegBody("konoha", ()=> {
                    component.getGeneratedCode();
                });
                location.hash = url;
            },
            error:() => {
                  console.log("error");
            }
        });
    } else {
        component.getPegBody("konoha", ()=> {
            component.getGeneratedCode();
        });
    }

    var $togglePegBar = $("#peg-source-toggle");
    var $toggleInputBar = $("#input-source-toggle");
    var toggleEventFunc = () => {
        if($togglePegBar.attr("class") ==  ""/* if opened */) {
            $togglePegBar.children()[0].className = "glyphicon glyphicon-chevron-up";
            //$("#peg-selector")[0].disabled = true;
        } else {
            $togglePegBar.children()[0].className = "glyphicon glyphicon-chevron-down";
            //$("#peg-selector")[0].disabled = false;
        }
        if($toggleInputBar.attr("class") ==  ""/* if opened */) {
            $toggleInputBar.children()[0].className = "glyphicon glyphicon-chevron-up";
            //$("#sample-selector")[0].disabled = false;
        } else {
            $toggleInputBar.children()[0].className = "glyphicon glyphicon-chevron-down";
            //$("#sample-selector")[0].disabled = true;
        }
    };
    $togglePegBar.click((e:Event) => { setTimeout(toggleEventFunc, 150); } );
    $toggleInputBar.click((e:Event) => { setTimeout(toggleEventFunc, 150); } );
});
