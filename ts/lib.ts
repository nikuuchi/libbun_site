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

    export var ErrorLineMarkers: any[] = [];

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

    export function CreateTargetChanger(query: string, editor: any, viewer: any, generate: ()=>void): void {
        var $element = $(query);
        jQuery.each(TargetList, (key, val) => {
            $element.append($('<option>').attr({ value: key }).text(val.display));
        });
        $element.change((e:Event) => {
            var target = TargetList[$(query + " option:selected").val()];
            ChangeSyntaxHighlight(viewer, target.mode);
            CodeGenTarget = target.option;
            CodeGenTargetExt = target.ext;
            generate();
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
                    var session = editor.getSession();
                    var errors = ParseError(res.error);
                    if(session.getUseWorker()) {
                        session.setAnnotations(errors);
                        SetHighlightLines(session, errors);
                    }
                    viewer.clearSelection();
                    viewer.gotoLine(0);
                },
                error: () => {
                    console.log("error");
                }
            });
        };
    }

    export function SetHighlightLines(session: any, errors: ErrorAnnotation[]): void {
        ClearHighlightLines(session);
        for(var i = 0; i < errors.length; i++) {
            console.log(errors[i]);
            var range = session.highlightLines(errors[i].row, errors[i].row, "playground_error_line");
            console.log(range);
            ErrorLineMarkers.push(range);
        }
    }

    export function ClearHighlightLines(session: any): void {
        for(var i = 0; i < ErrorLineMarkers.length; i++) {
            session.removeMarker(ErrorLineMarkers[i].id);
        }
        ErrorLineMarkers = [];
    }

    export function Scan(text: string, parrern: RegExp): string[][] {
        var toMatch = text;
        var result: string[][] = [];
        var matchResult: string[] = null;
        while(matchResult = toMatch.match(parrern)){
            toMatch = (<any>RegExp).rightContext;
            result.push(matchResult);
        }
        return result;
    }

    export function ParseError(allErrorMessage: string): ErrorAnnotation[] {
        // (/tmp/tmp68dUG_.bun:5) [error] ) is expected
        var scanResults = Scan(allErrorMessage, /bun:(\d+)\)\s+\[(.+?)\]\s+(.*)$/m);
        return scanResults.map((it)=> {
            return {
                row:  Number(it[1]) - 1,
                type: it[2], // error | warning
                text: it[3], // body of error message
                raw:  it[3], // body of error message
                column: 0
            };
        });
    }
}
