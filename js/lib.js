///<reference path='./config.ts' />
///<reference path='./editor.ts' />

var Playground;
(function (Playground) {
    Playground.ErrorLineMarkers = [];

    var PlaygroundEditor = (function () {
        function PlaygroundEditor(editorOptions, outputOptions, pegOptions) {
            this.codeGenTarget = "py";
            this.codeGenTargetExt = "py";
            this.codeEditor = this.createEditor(editorOptions);
            this.outputViewer = this.createEditor(outputOptions);
            if (pegOptions) {
                this.pegEditor = this.createEditor(pegOptions);
            } else {
                this.pegEditor = null;
            }
        }
        PlaygroundEditor.prototype.createEditor = function (options) {
            var editor = ace.edit(options.query);
            editor.setTheme("ace/theme/xcode");

            var syntax = options.syntax != null ? options.syntax : "javascript";
            this.changeSyntaxHighlight(editor, syntax);

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
        };

        PlaygroundEditor.prototype.changeOutputViewerSyntaxHighlight = function (targetMode) {
            this.changeSyntaxHighlight(this.outputViewer, targetMode);
        };

        PlaygroundEditor.prototype.changeEditorSyntaxHighlight = function (targetMode) {
            this.changeSyntaxHighlight(this.codeEditor, targetMode);
        };

        PlaygroundEditor.prototype.changeSyntaxHighlight = function (editor, targetMode) {
            editor.getSession().setMode("ace/mode/" + targetMode);
        };

        PlaygroundEditor.prototype.getPegBody = function (sampleName, func) {
            var _this = this;
            var name = sampleName.replace(" - ", "_");
            $.ajax({
                type: "GET",
                url: "/pegs/" + name + ".peg",
                success: function (res) {
                    if (_this.pegEditor != null) {
                        _this.pegEditor.setValue(res);
                        _this.pegEditor.clearSelection();
                        _this.pegEditor.gotoLine(0);
                        if (func) {
                            func();
                        }
                    }
                },
                error: function () {
                    console.log("error");
                }
            });
        };

        PlaygroundEditor.prototype.getSampleBody = function (sampleName) {
            var _this = this;
            var name = sampleName.replace(" - ", "_");
            $.ajax({
                type: "GET",
                url: "/samples/" + name + ".bun",
                success: function (res) {
                    _this.codeEditor.setValue(res);
                    _this.codeEditor.clearSelection();
                    _this.codeEditor.gotoLine(0);
                },
                error: function () {
                    console.log("error");
                }
            });
        };

        PlaygroundEditor.prototype.getGeneratedCode = function () {
            var _this = this;
            var e = this.codeEditor;
            var peg = null;
            if (this.pegEditor != null) {
                peg = this.pegEditor.getValue();
            }
            $.ajax({
                type: "POST",
                url: "/compile",
                data: JSON.stringify({ source: e.getValue(), target: this.codeGenTarget, ext: this.codeGenTargetExt, pegsource: peg }),
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                success: function (res) {
                    _this.outputViewer.setValue(res.source);
                    var session = _this.codeEditor.getSession();
                    var errors = ParseError(res.error);
                    if (session.getUseWorker()) {
                        session.setAnnotations(errors);
                        SetHighlightLines(session, errors);
                    }
                    _this.outputViewer.clearSelection();
                    _this.outputViewer.gotoLine(0);
                },
                error: function () {
                    console.log("error");
                }
            });
        };

        PlaygroundEditor.prototype.createPegSelector = function (query) {
            var _this = this;
            //var $element = $(query);
            //for(var i = 0; i < SamplePegList.length; i++) {
            //    $element.append($('<option>').attr({ value: SamplePegList[i] }).text(SamplePegList[i]));
            //}
            //$element.change((e:Event) => {
            //    this.getPegBody($(query + " option:selected").val().toLowerCase());
            //});
            var $element = $(query);
            jQuery.each(Playground.SamplePegList, function (key, val) {
                $element.append($('<option>').attr({ value: key }).text(val.display));
            });
            $element.change(function (e) {
                var target = Playground.SamplePegList[$(query + " option:selected").val()];
                _this.getPegBody(target.option);
            });
        };

        PlaygroundEditor.prototype.createSampleSelector = function (query) {
            var _this = this;
            var $element = $(query);
            for (var i = 0; i < Playground.SampleList.length; i++) {
                $element.append($('<option>').attr({ value: Playground.SampleList[i] }).text(Playground.SampleList[i]));
            }
            $element.change(function (e) {
                _this.getSampleBody($(query + " option:selected").val());
            });
        };

        PlaygroundEditor.prototype.createTargetChanger = function (query) {
            var _this = this;
            var $element = $(query);
            jQuery.each(Playground.TargetList, function (key, val) {
                $element.append($('<option>').attr({ value: key }).text(val.display));
            });
            $element.change(function (e) {
                var target = Playground.TargetList[$(query + " option:selected").val()];
                _this.changeSyntaxHighlight(_this.outputViewer, target.mode);
                _this.codeGenTarget = target.option;
                _this.codeGenTargetExt = target.ext;
                _this.getGeneratedCode();
            });
        };
        return PlaygroundEditor;
    })();
    Playground.PlaygroundEditor = PlaygroundEditor;

    function SetHighlightLines(session, errors) {
        ClearHighlightLines(session);
        for (var i = 0; i < errors.length; i++) {
            console.log(errors[i]);
            var range = session.highlightLines(errors[i].row, errors[i].row, "playground_error_line");
            console.log(range);
            Playground.ErrorLineMarkers.push(range);
        }
    }
    Playground.SetHighlightLines = SetHighlightLines;

    function ClearHighlightLines(session) {
        for (var i = 0; i < Playground.ErrorLineMarkers.length; i++) {
            session.removeMarker(Playground.ErrorLineMarkers[i].id);
        }
        Playground.ErrorLineMarkers = [];
    }
    Playground.ClearHighlightLines = ClearHighlightLines;

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
                //raw:  it[3], // body of error message
                column: 0
            };
        });
    }
    Playground.ParseError = ParseError;
})(Playground || (Playground = {}));
