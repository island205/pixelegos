define(function (require, exports, module) {
	var Menu = require('./menu')
	var Tool = require('./tool')
	var Canvas = require('./canvas')
	var $ = require('$')

	$(function() {
		var menu = new Menu()
		var tool = new Tool()
		var canvas = new Canvas()
		tool.on('select', function(color) {
			canvas.color = color
		})
		tool.on('erase', function() {
			canvas.color = 'white'
		})
	})
})