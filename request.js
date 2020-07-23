$.ajax({
    type: "POST",
    url: "~/pythoncode.py",
    data: { param: "mama" }
}).done(function (o) {
    // do something
});