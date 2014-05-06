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
            $element.append('<option value="' + Playground.SampleList[i] + '">' + Playground.SampleList[i] + '</option>');
        }
        $element.change(function (e) {
            getSample($(query + " option:selected").val());
        });
    }
    Playground.CreateSampleSelector = CreateSampleSelector;
})(Playground || (Playground = {}));
