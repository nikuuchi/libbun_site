///<reference path='../typings/jquery/jquery.d.ts' />
///<reference path='./config.ts' />
///<reference path='./lib.ts' />

var Debug: any = {};

$(() => {
    var bunEditor = Playground.CreateEditor("bun-editor", { syntax: "typescript" });
    var outputViewer = Playground.CreateEditor("output-viewer", { readOnly: true });

    Debug.bunEditor = bunEditor;
    Debug.outputViewer = outputViewer;
    outputViewer.setReadOnly(true);
    outputViewer.getSession().setUseWorker(false);

    var GetSample = (sampleName: string) => {
        $.ajax({
            type: "GET",
            url: "/samples/"+sampleName+".bun",
            success: (res) => {
                bunEditor.setValue(res);
                bunEditor.clearSelection();
            },
            error:() => {
                  console.log("error");
            }
        });
    };

    var GenerateServer = () => {
        $.ajax({
            type: "POST",
            url: "/compile",
            data: JSON.stringify({source: bunEditor.getValue(), target: Playground.CodeGenTarget}),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: (res) => {
                outputViewer.setValue(res.source);
                outputViewer.clearSelection();
            },
            error: () => {
                console.log("error");
            }
        });
    };

    var timer: number = null;
    bunEditor.on("change", function(cm, obj) {
        if(timer){
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(GenerateServer, 400);
    });

    var TargetNames   = ["C",     "CommonLisp", "C Sharp",     "Java", "JavaScript", "LLVM",         "Python", "R"];
    var TargetOptions = ["c",     "cl",         "cs",     "java", "js",         "ll",           "py",     "r"];
    var TargetMode    = ["c_cpp", "lisp",       "csharp", "java", "javascript", "assembly_x86", "python", "r"];

    var bind = (n) => {
        var Target = $('#Target-' + TargetNames[n]);
        Target.click(function(){
            Playground.CodeGenTarget = TargetOptions[n];
            $('li.active').removeClass("active");
            Target.parent().addClass("active");
            $('#active-lang').text(TargetNames[n]); 
            $('#active-lang').append('<b class="caret"></b>'); 
            Playground.ChangeSyntaxHighlight(outputViewer, TargetMode[n]);
            if(timer){
                clearTimeout(timer);
                timer = null;
            }
            GenerateServer();
        });
    };

    for(var i = 0; i < TargetNames.length; i++){
        $("#Targets").append('<li id="Target-'+TargetNames[i]+'-li"><a href="#" id="Target-'+TargetNames[i]+'">'+TargetNames[i]+'</a></li>');
        bind(i);
    }

    var Samples = Playground.SampleList;

    var sample_bind = (n) => {
        $('#sample-'+Samples[n]).click(function(){
            GetSample(Samples[n]);
        });
    };

    for(var i = 0; i < Samples.length; i++){
        $("#bun-sample").append('<li id="sample-'+Samples[i]+'-li"><a href="#" id="sample-'+Samples[i]+'">'+Samples[i]+'</a></li>');
        sample_bind(i);
    }

    $("#Target-JavaScript-li").addClass("active");
    GenerateServer();
});
