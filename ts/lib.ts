///<reference path='./config.ts' />
///<reference path='./editor.ts' />
declare var ace: any;

interface PlayOptions {
    query: string;
    syntax?: string;
    line?: boolean;
    readOnly?: boolean;
    checker?: boolean;
}

interface ErrorAnnotation {
    column: number;
    raw?: string;
    row: number;
    text: string;
    type: string;
}

module Playground {


    export var ErrorLineMarkers: any[] = [];

    export class PlaygroundEditor {
        public  codeEditor:       any; //ace
        public  outputViewer:     any; //ace
        private codeGenTarget:    string = "bun";
        private codeGenTargetExt: string = "bun";

        constructor(editorOptions: PlayOptions, outputOptions: PlayOptions) {
            this.codeEditor   = this.createEditor(editorOptions.query, editorOptions);
            this.outputViewer = this.createEditor(outputOptions.query, outputOptions);
        }

        private createEditor(query: string, options: PlayOptions): any {
            var editor = ace.edit(query);
            editor.setTheme("ace/theme/xcode");

            var syntax = options.syntax != null ? options.syntax : "javascript";
            this.changeSyntaxHighlight(editor, syntax);

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

        public changeOutputViewerSyntaxHighlight(targetMode: string): void {
            this.changeSyntaxHighlight(this.outputViewer, targetMode);
        }

        public changeEditorSyntaxHighlight(targetMode: string): void {
            this.changeSyntaxHighlight(this.codeEditor, targetMode);
        }

        private changeSyntaxHighlight(editor: any, targetMode: string): void {
            editor.getSession().setMode("ace/mode/" + targetMode);
        }

        public getSampleBody(sampleName: string): void {
            var name = sampleName.replace(" - ", "_");
            $.ajax({
                type: "GET",
                url: "/samples/" + name + ".bun",
                success: (res) => {
                    this.codeEditor.setValue(res);
                    this.codeEditor.clearSelection();
                    this.codeEditor.gotoLine(0);
                },
                error:() => {
                          console.log("error");
                }
            });
        }

        public getGeneratedCode(): void {
            var e = this.codeEditor;
            $.ajax({
                type: "POST",
                url: "/compile",
                data: JSON.stringify({source: e.getValue(), target: this.codeGenTarget, ext: this.codeGenTargetExt}),
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: (res) => {
                    this.outputViewer.setValue(res.source);
                    var session = this.codeEditor.getSession();
                    var errors = ParseError(res.error);
                    if(session.getUseWorker()) {
                        session.setAnnotations(errors);
                        SetHighlightLines(session, errors);
                    }
                    this.outputViewer.clearSelection();
                    this.outputViewer.gotoLine(0);
                },
                error: () => {
                    console.log("error");
                }
            });
        }

        public createSampleSelector(query: string): void {
            var $element = $(query);
            for(var i = 0; i < SampleList.length; i++) {
                $element.append($('<option>').attr({ value: SampleList[i] }).text(SampleList[i]));
            }
            $element.change((e:Event) => {
                this.getSampleBody($(query + " option:selected").val());
            });
        }

        public createTargetChanger(query: string): void {
            var $element = $(query);
            jQuery.each(TargetList, (key, val) => {
                $element.append($('<option>').attr({ value: key }).text(val.display));
            });
            $element.change((e:Event) => {
                var target = TargetList[$(query + " option:selected").val()];
                this.changeSyntaxHighlight(this.outputViewer, target.mode);
                this.codeGenTarget = target.option;
                this.codeGenTargetExt = target.ext;
                this.getGeneratedCode();
            });
        }
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
                //raw:  it[3], // body of error message
                column: 0
            };
        });
    }
}
