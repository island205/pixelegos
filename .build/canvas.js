define("canvas", [ "gallery/backbone/1.0.0/backbone", "gallery/underscore/1.4.4/underscore", "$", "zepto/zepto/1.0.0/zepto" ], function(require, exports, module) {
    var Backbone = require("gallery/backbone/1.0.0/backbone");
    var $ = require("zepto/zepto/1.0.0/zepto");
    var Canvas = Backbone.View.extend({
        el: $(".canvas"),
        color: "black",
        events: {
            click: "draw"
        },
        draw: function(e) {
            e.preventDefault();
            $(e.target).css("background-color", this.color);
        }
    });
    module.exports = Canvas;
});