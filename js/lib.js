///<reference path='./config.ts' />

var Playground;
(function (Playground) {
    Playground.CodeGenTarget = "bun";

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

    function CreateTargetChanger(query, editor, generate) {
        var $element = $(query);
        jQuery.each(Playground.TargetList, function (key, val) {
            $element.append($('<option>').attr({ value: key }).text(val.display));
        });
        $element.change(function (e) {
            var target = Playground.TargetList[$(query + " option:selected").val()];
            ChangeSyntaxHighlight(editor, target.mode);
            Playground.CodeGenTarget = target.option;
            generate();
        });
    }
    Playground.CreateTargetChanger = CreateTargetChanger;
})(Playground || (Playground = {}));
