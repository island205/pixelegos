define(function (require, exports, module) {
	var Backbone = require('backbone')
	var $ = require('$')

	var Canvas = Backbone.View.extend({
		el: $('.canvas'),
		color: 'black',
		events: {
			'click': 'draw'
		},
		draw: function(e) {
			e.preventDefault()
			$(e.target).css('background-color', this.color)
		}
	})

	module.exports = Canvas
})