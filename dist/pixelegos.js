define("pixelegos", [ "./menu", "gallery/backbone/1.0.0/backbone", "gallery/underscore/1.4.4/underscore", "$", "zepto/zepto/1.0.0/zepto", "./tool", "./canvas" ], function(require, exports, module) {
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

define("menu", [ "gallery/backbone/1.0.0/backbone", "gallery/underscore/1.4.4/underscore", "$", "zepto/zepto/1.0.0/zepto" ], function(require, exports, module) {
    var Backbone = require("gallery/backbone/1.0.0/backbone");
    var $ = require("zepto/zepto/1.0.0/zepto");
    var Menu = Backbone.View.extend({
        el: $("header"),
        show: false,
        events: {
            "click .menu-trigger": "toogle"
        },
        initialize: function() {
            this.menu = this.$el.next();
            this.render();
        },
        toogle: function(e) {
            e.preventDefault();
            this.show = !this.show;
            this.render();
        },
        render: function() {
            if (this.show) {
                this.menu.css("height", 172);
            } else {
                this.menu.css("height", 0);
            }
        }
    });
    module.exports = Menu;
});

define("tool", [ "gallery/backbone/1.0.0/backbone", "gallery/underscore/1.4.4/underscore", "$", "zepto/zepto/1.0.0/zepto" ], function(require, exports, module) {
    var Backbone = require("gallery/backbone/1.0.0/backbone");
    var $ = require("zepto/zepto/1.0.0/zepto");
    var COLORS = [ "black", "silver", "red", "fuchsia", "green", "yellow", "blue", "aqua" ];
    var Tool = Backbone.View.extend({
        el: $("footer"),
        showColorPanel: false,
        events: {
            "click .color-select-trigger": "toogleColorPanel",
            "click .eraser": "eraser"
        },
        initialize: function() {
            var that = this;
            this.colorPanel = $(".color-panel");
            this.colorPanel.children("div").bind("click", function(e) {
                that.toogleColorPanel(e);
                that.trigger("select", $(this).attr("data-color"));
            });
            this.on("select", function(color) {
                that.$el.find(".color-select-trigger").css("background-color", color);
            });
            this.render();
        },
        toogleColorPanel: function(e) {
            e.preventDefault();
            this.showColorPanel = !this.showColorPanel;
            if (this.showColorPanel) {
                this.colorPanel.show();
            } else {
                this.colorPanel.hide();
            }
        },
        eraser: function(e) {
            e.preventDefault();
            this.trigger("erase");
        },
        render: function() {
            this.colorPanel.children("div").each(function(index, el) {
                $(el).css("background-color", COLORS[index]).attr("data-color", COLORS[index]);
            });
        }
    });
    module.exports = Tool;
});

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
