var Playground;
(function (Playground) {
    Playground.CodeGenTarget = "js";

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

    function CreateSampleSelector(query, generator) {
        var $element = $(query);
        var SampleList;
        $element.append();
    }
    Playground.CreateSampleSelector = CreateSampleSelector;
})(Playground || (Playground = {}));
