"use strict";

function ControlWidgetHandler(controller, widget) {
	this.widget = widget;
	this.controller = controller;
	this.init();
}

ControlWidgetHandler.prototype.init = function() {
	this.widget.monitoring.$button.on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		if(this.checked) controller.enableMonitoring();
		else controller.disableMonitoring();
	});

	this.widget.physics.$button.on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		if(this.checked) controller.enableGraphPhysics();
		else controller.disableGraphPhysics();
	});

	this.widget.export.$button.on("click", {controller: this.controller}, function(event) {
		var controller = event.data.controller;
		controller.extractMonitoredData();
	});
}

ControlWidgetHandler.prototype.hidePhysicsOption = function() {
	this.widget.physics.$container.hide();
}