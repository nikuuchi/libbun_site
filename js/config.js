var Playground;
(function (Playground) {
    Playground.SampleList = ["HelloWorld", "BinaryTrees", "Fibonacci", "FizzBuzz", "Python - HelloWorld", "Python - Fibonacci"];

    Playground.TargetList = {
        bun: { display: "Bun", ext: "bun", option: "bun", mode: "typescript" },
        c: { display: "C", ext: "c", option: "c", mode: "c_cpp" },
        cl: { display: "CommonLisp", ext: "cl", option: "cl", mode: "lisp" },
        cs: { display: "C#", ext: "cs", option: "csharp-playground", mode: "csharp" },
        java: { display: "Java", ext: "java", option: "java", mode: "java" },
        js: { display: "JavaScript", ext: "js", option: "javascript-playground", mode: "javascript" },
        py: { display: "Python", ext: "py", option: "py", mode: "python" },
        r: { display: "R", ext: "r", option: "r", mode: "r" },
        sml: { display: "SML#", ext: "sml", option: "sml", mode: "ocaml" }
    };
})(Playground || (Playground = {}));
