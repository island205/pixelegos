define(function (require, exports, module) {
	var Backbone = require('backbone')
	var $ = require('$')

	var Menu = Backbone.View.extend({
		el: $('header'),
		show: false,
		events: {
			'click .menu-trigger': 'toogle'
		},
		initialize: function() {
			this.menu = this.$el.next()
			this.render()
		},
		toogle: function() {
			this.show = ! this.show
			this.render()
		},
		render: function() {
			if (this.show) {
				this.menu.css('height', 172)
			} else {
				this.menu.css('height', 0)
			}
		}
	})

	module.exports = Menu
})