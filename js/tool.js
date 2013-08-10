define(function (require, exports, module) {
	var Backbone = require('backbone')
	var $ = require('$')
	var COLORS = ['black', 'silver', 'red', 'fuchsia', 'green', 'yellow', 'blue', 'aqua']

	var Tool = Backbone.View.extend({
		el: $('footer'),
		showColorPanel: false,
		events: {
			'click .color-select-trigger': 'toogleColorPanel',
			'click .eraser': 'eraser'
		},
		initialize: function() {
			var that = this
			this.colorPanel = $('.color-panel')
			this.colorPanel.children('div').bind('click', function(e) {
				that.toogleColorPanel(e)
				that.trigger('select', $(this).attr('data-color'))
			})
			this.on('select', function (color) {
				that.$el.find('.color-select-trigger').css('background-color', color)
			})
			this.render()
		},
		toogleColorPanel: function(e) {
			e.preventDefault()
			this.showColorPanel = ! this.showColorPanel
			if (this.showColorPanel) {
				this.colorPanel.show()
			} else {
				this.colorPanel.hide()
			}
		},
		eraser: function(e) {
			e.preventDefault()
			this.trigger('erase')
		},
		render: function() {
			this.colorPanel.children('div').each(function (index, el) {
				$(el).css('background-color', COLORS[index]).attr('data-color', COLORS[index])
			})
		}
	})

	module.exports = Tool
})