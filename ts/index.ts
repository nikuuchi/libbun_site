///<reference path='../typings/jquery/jquery.d.ts' />
///<reference path='./lib.ts' />

var Debug: any = {};

$(() => {
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
    })

    Debug.component = component;

    $("#translate").click((ev: Event) => {
        component.getGeneratedCode();
    });

    $("#fullscreen").click((ev: Event) => {
        $.ajax({
            type: "POST",
            url: "/share",
            data: JSON.stringify({source: component.codeEditor.getValue()}),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: (res) => {
                if(res.url) {
                    location.href = "/editor.html#" + res.url;
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

    component.getGeneratedCode();
});
