var Playground;
(function (Playground) {
    Playground.SampleList = ["HelloWorld", "BinaryTrees", "Fibonacci", "NGram"];

    Playground.TargetList = {
        bun: { display: "Bun", option: "bun", mode: "typescript" },
        c: { display: "C", option: "c", mode: "c_cpp" },
        cl: { display: "CommonLisp", option: "cl", mode: "lisp" },
        cs: { display: "C#", option: "csharp-playground", mode: "csharp" },
        java: { display: "Java", option: "java", mode: "java" },
        js: { display: "JavaScript", option: "javascript-playground", mode: "javascript" },
        py: { display: "Python", option: "py", mode: "python" },
        r: { display: "R", option: "r", mode: "r" },
        sml: { display: "SML#", option: "sml", mode: "ocaml" }
    };
})(Playground || (Playground = {}));
