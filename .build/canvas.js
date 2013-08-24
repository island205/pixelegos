define("/dist/canvas", [ "gallery/backbone/1.0.0/backbone", "gallery/underscore/1.4.4/underscore", "$", "island205/venus/1.0.0/venus", "zepto/zepto/1.0.0/zepto" ], function(require, exports, module) {
    var Backbone = require("gallery/backbone/1.0.0/backbone");
    var Vango = require("island205/venus/1.0.0/venus").Vango;
    var $ = require("zepto/zepto/1.0.0/zepto");
    var Canvas = Backbone.View.extend({
        el: $(".canvas"),
        color: "green",
        size: 9,
        width: 320,
        events: {
            "click canvas": "draw"
        },
        initialize: function() {
            this.canvas = new Vango(this.el, 320, 320);
            this.drawGrid();
        },
        draw: function(e) {
            e.preventDefault();
            var tile = this.getTile(e.offsetX, e.offsetY);
            this.drawTile(tile, this.color);
        },
        getTile: function(x, y) {
            var x = Math.floor(x / (this.width / this.size));
            var y = Math.floor(y / (this.width / this.size));
            return {
                x: x,
                y: y
            };
        },
        drawGrid: function() {
            var width = (this.width - (this.size + 1)) / this.size;
            for (var i = 0, len = this.size; i <= len; i++) {
                this.canvas.line(width * i + i, 0, width * i + i, this.width, {
                    stroke: true,
                    fill: false,
                    styles: {
                        strokeStyle: "silver"
                    }
                });
                this.canvas.line(0, width * i + i, this.width, width * i + i, {
                    stroke: true,
                    fill: false,
                    styles: {
                        strokeStyle: "silver"
                    }
                });
            }
        },
        drawTile: function(tile, color) {
            var width = (this.width - (this.size + 1)) / this.size;
            x = tile.x * (width + 1);
            y = tile.y * (width + 1);
            this.canvas.rectangle(x, y, width, width, {
                styles: {
                    fillStyle: color
                }
            });
        }
    });
    module.exports = Canvas;
});