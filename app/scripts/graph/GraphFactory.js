"use strict";

/* Graph Factory: using visJS for instantiating the visualisation network */

function GraphFactory() {}

GraphFactory.prototype.buildGraph = function(mode, graphElement) {
	if(graphElement != null && mode == Graph.Mode.ONLINE) {
		var options = {
			edges: {
				smooth: false
			},
			interaction: {
				tooltipDelay: 0,
				keyboard: true,
				navigationButtons: true
			},
			physics: {
				barnesHut: {
					gravitationalConstant: -80000,
					centralGravity: 0.1,
					springLength: 200,
					springConstant: 0.001,
					avoidOverlap: 0.5,
				},
				solver: "barnesHut"
			}
		};
		var data = {
			nodes: new vis.DataSet([]),
			edges: new vis.DataSet([])
		};
	    var visNetwork = new vis.Network(graphElement, data, options);
	    return new Graph(visNetwork);
	}
	else if(graphElement == null && mode == Graph.Mode.OFFLINE) {
		return new Graph(null);
	}
	else {
		throw new Error("Cannot build Graph: mode is not complying with value of graph Element");
	}
}