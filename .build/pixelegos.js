define("/dist/pixelegos", [ "./menu", "gallery/backbone/1.0.0/backbone", "gallery/underscore/1.4.4/underscore", "$", "zepto/zepto/1.0.0/zepto", "./tool", "./canvas", "island205/venus/1.0.0/venus" ], function(require, exports, module) {
    var Menu = require("./menu");
    var Tool = require("./tool");
    var Canvas = require("./canvas");
    var $ = require("zepto/zepto/1.0.0/zepto");
    $(function() {
        var menu = new Menu();
        var tool = new Tool();
        var canvas = new Canvas();
        tool.on("select", function(color) {
            canvas.color = color;
        });
        tool.on("erase", function() {
            canvas.color = "white";
        });
    });
});