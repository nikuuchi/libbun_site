///<reference path='./config.ts' />
declare var ace: any;

interface PlayOptions {
    syntax?: string;
    line?: boolean;
    readOnly?: boolean;
    checker?: boolean;
}

module Playground {
    export var CodeGenTarget = "bun";

    export function CreateEditor(query: string, options: PlayOptions): any {
        var editor = ace.edit(query);
        editor.setTheme("ace/theme/xcode");

        var syntax = options.syntax != null ? options.syntax : "javascript";
        this.ChangeSyntaxHighlight(editor, syntax);

        if(options.line == false) {
            editor.renderer.setShowGutter(false);
        }

        if(!options.checker) {
            editor.getSession().setUseWorker(false);
        }

        if(options.readOnly == true) {
            editor.setReadOnly(true);
        }

        return editor;
    }

    export function ChangeSyntaxHighlight(editor: any, targetMode: string): void {
        editor.getSession().setMode("ace/mode/" + targetMode);
    }

    export function CreateSampleSelector(query: string, getSample: (val: string)=>void): void {
        var $element = $(query);
        for(var i = 0; i < SampleList.length; i++) {
            $element.append($('<option>').attr({ value: SampleList[i] }).text(SampleList[i]));
        }
        $element.change((e:Event) => {
            getSample($(query + " option:selected").val());
        });
    }

    export function CreateTargetChanger(query: string, editor: any, generate: ()=>void): void {
        var $element = $(query);
        jQuery.each(TargetList, (key, val) => {
            $element.append($('<option>').attr({ value: key }).text(val.display));
        });
        $element.change((e:Event) => {
            var target = TargetList[$(query + " option:selected").val()];
            ChangeSyntaxHighlight(editor, target.mode);
            CodeGenTarget = target.option;
            generate();
        });
    }
}
