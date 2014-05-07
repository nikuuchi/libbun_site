///<reference path='./config.ts' />
declare var ace: any;

interface PlayOptions {
    syntax?: string;
    line?: boolean;
    readOnly?: boolean;
    checker?: boolean;
}

interface ErrorAnnotation {
    column: number;
    raw: string;
    row: number;
    text: string;
    type: string;
}

module Playground {
    export var CodeGenTarget    = "bun";
    export var CodeGenTargetExt = "bun";

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

    export function CreateTargetChanger(query: string, editor: any, viewer: any): void {
        var $element = $(query);
        jQuery.each(TargetList, (key, val) => {
            $element.append($('<option>').attr({ value: key }).text(val.display));
        });
        $element.change((e:Event) => {
            var target = TargetList[$(query + " option:selected").val()];
            ChangeSyntaxHighlight(viewer, target.mode);
            CodeGenTarget = target.option;
            CodeGenTargetExt = target.ext;
        });
    }

    export function GetSampleFunction(editor: any): (sampleName: string) => void {
        return (sampleName: string) => {
            var name = sampleName.replace(" - ", "_");
            $.ajax({
                type: "GET",
                url: "/samples/" + name + ".bun",
                success: (res) => {
                    editor.setValue(res);
                    editor.clearSelection();
                    editor.gotoLine(0);
                },
                error:() => {
                      console.log("error");
                }
            });
        };
    }

    export function createAnnotations(error: string): ErrorAnnotation[] {
        //FIXME
        return [
            {
                column: 6,
                raw: "Missing semicolon.",
                row: 0,
                text: "Missing \";\" before statement",
                type: "error",
            }
        ];
    }

    export function GetGenerateFunction(editor: any, viewer: any): () => void {
        return () => {
            $.ajax({
                type: "POST",
                url: "/compile",
                data: JSON.stringify({source: editor.getValue(), target: CodeGenTarget, ext: CodeGenTargetExt}),
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: (res) => {
                    viewer.setValue(res.source);
                    editor.getSession().setAnnotations(createAnnotations(res.error));
                    viewer.clearSelection();
                    viewer.gotoLine(0);
                },
                error: () => {
                    console.log("error");
                }
            });
        };
    }

    export function Scan(text: string, parrern: RegExp) => string[][] {
        var toMatch = text;
        var result: string[][] = [];
        var matchResult: string[] = null;
        while(matchResult = toMatch.match(parrern)){
            toMatch = RegExp.rightContext;
            result.push(matchResult);
        }
        return matchResult;
    }

    export function ParseError(allErrorMessage: string){
        // (/tmp/tmp68dUG_.bun:5) [error] ) is expected
        var scanResults = Scan(allErrorMessage, /bun:(\d+)\)\s+\[(.+?)\]\s+(.*)$/m);
        for(var i = 0; i < scanResults.length; ++i){
            var line: string = scanResults[i][1];
            var type: string = scanResults[i][2]; // error | warning
            var message: string = scanResults[i][3]; // body of error message
        }
    }
}
