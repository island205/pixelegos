define("/dist/menu", [ "gallery/backbone/1.0.0/backbone", "gallery/underscore/1.4.4/underscore", "$", "zepto/zepto/1.0.0/zepto" ], function(require, exports, module) {
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