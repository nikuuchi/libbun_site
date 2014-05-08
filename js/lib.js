///<reference path='./config.ts' />

var Playground;
(function (Playground) {
    Playground.CodeGenTarget = "bun";
    Playground.CodeGenTargetExt = "bun";

    function CreateEditor(query, options) {
        var editor = ace.edit(query);
        editor.setTheme("ace/theme/xcode");

        var syntax = options.syntax != null ? options.syntax : "javascript";
        this.ChangeSyntaxHighlight(editor, syntax);

        if (options.line == false) {
            editor.renderer.setShowGutter(false);
        }

        if (!options.checker) {
            editor.getSession().setUseWorker(false);
        }

        if (options.readOnly == true) {
            editor.setReadOnly(true);
        }

        return editor;
    }
    Playground.CreateEditor = CreateEditor;

    function ChangeSyntaxHighlight(editor, targetMode) {
        editor.getSession().setMode("ace/mode/" + targetMode);
    }
    Playground.ChangeSyntaxHighlight = ChangeSyntaxHighlight;

    function CreateSampleSelector(query, getSample) {
        var $element = $(query);
        for (var i = 0; i < Playground.SampleList.length; i++) {
            $element.append($('<option>').attr({ value: Playground.SampleList[i] }).text(Playground.SampleList[i]));
        }
        $element.change(function (e) {
            getSample($(query + " option:selected").val());
        });
    }
    Playground.CreateSampleSelector = CreateSampleSelector;

    function CreateTargetChanger(query, editor, viewer, generate) {
        var $element = $(query);
        jQuery.each(Playground.TargetList, function (key, val) {
            $element.append($('<option>').attr({ value: key }).text(val.display));
        });
        $element.change(function (e) {
            var target = Playground.TargetList[$(query + " option:selected").val()];
            ChangeSyntaxHighlight(viewer, target.mode);
            Playground.CodeGenTarget = target.option;
            Playground.CodeGenTargetExt = target.ext;
            generate();
        });
    }
    Playground.CreateTargetChanger = CreateTargetChanger;

    function GetSampleFunction(editor) {
        return function (sampleName) {
            var name = sampleName.replace(" - ", "_");
            $.ajax({
                type: "GET",
                url: "/samples/" + name + ".bun",
                success: function (res) {
                    editor.setValue(res);
                    editor.clearSelection();
                    editor.gotoLine(0);
                },
                error: function () {
                    console.log("error");
                }
            });
        };
    }
    Playground.GetSampleFunction = GetSampleFunction;

    function GetGenerateFunction(editor, viewer) {
        return function () {
            $.ajax({
                type: "POST",
                url: "/compile",
                data: JSON.stringify({ source: editor.getValue(), target: Playground.CodeGenTarget, ext: Playground.CodeGenTargetExt }),
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: function (res) {
                    viewer.setValue(res.source);
                    editor.getSession().setAnnotations(ParseError(res.error));
                    viewer.clearSelection();
                    viewer.gotoLine(0);
                },
                error: function () {
                    console.log("error");
                }
            });
        };
    }
    Playground.GetGenerateFunction = GetGenerateFunction;

    function Scan(text, parrern) {
        var toMatch = text;
        var result = [];
        var matchResult = null;
        while (matchResult = toMatch.match(parrern)) {
            toMatch = RegExp.rightContext;
            result.push(matchResult);
        }
        return result;
    }
    Playground.Scan = Scan;

    function ParseError(allErrorMessage) {
        // (/tmp/tmp68dUG_.bun:5) [error] ) is expected
        var scanResults = Scan(allErrorMessage, /bun:(\d+)\)\s+\[(.+?)\]\s+(.*)$/m);
        return scanResults.map(function (it) {
            return {
                row: Number(it[1]) - 1,
                type: it[2],
                text: it[3],
                raw: it[3],
                column: 0
            };
        });
    }
    Playground.ParseError = ParseError;
})(Playground || (Playground = {}));
