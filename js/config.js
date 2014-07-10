var Playground;
(function (Playground) {
    Playground.SampleList = ["HelloWorld", "Fibonacci", "FizzBuzz"];

    Playground.SamplePegList = {
        konoha: { display: "Konoha", option: "konoha" },
        c: { display: "C", option: "bun-c" },
        javascript: { display: "JavaScript", option: "JavaScript" },
        python: { display: "Python", option: "python" },
        csv: { display: "CSV", option: "csv_parallel" }
    };

    Playground.TargetList = {
        py: { display: "Python", ext: "py", option: "py", mode: "python" },
        peg: { display: "AST Dump", ext: "peg", option: "peg", mode: "typescript" },
        //bun:  { display: "Bun",        ext: "bun",  option: "bun",                   mode: "typescript"},
        //c:    { display: "C",          ext: "c",    option: "c",                     mode: "c_cpp"},
        //cl:   { display: "CommonLisp", ext: "cl",   option: "cl",                    mode: "lisp"},
        //cs:   { display: "C#",         ext: "cs",   option: "csharp-playground",     mode: "csharp"},
        //java: { display: "Java",       ext: "java", option: "java",                  mode: "java"},
        js: { display: "JavaScript", ext: "js", option: "javascript", mode: "javascript" },
        r: { display: "R", ext: "r", option: "r", mode: "r" }
    };
})(Playground || (Playground = {}));
