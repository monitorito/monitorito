"use strict";

function Node(id, graph) {
	this.id = id;

	this._outgoing = {};
	this._incoming = {};
	this.networkNodes = graph.mode == Graph.Mode.ONLINE ? graph.visualisationNetwork.getNodesDataset() : null;
	this.graph = graph;

	this.visible = true;
}

Node.prototype.getID = function() {
	return this.id;
}

Node.prototype.addEdgeTo = function(destinationNode, edge) {
	this._outgoing[destinationNode.getID()] = {'edge': edge};
}

Node.prototype.removeEdgeTo = function(destinationNode) {
	delete this._outgoing[destinationNode.getID()];
}

Node.prototype.getEdgeTo = function(destinationNode) {
	return this._outgoing[destinationNode.getID()].edge;
}

Node.prototype.hasEdgeTo = function(destinationNode) {
	return destinationNode.getID() in this._outgoing;
}

Node.prototype.addEdgeFrom = function(sourceNode, edge) {
	this._incoming[sourceNode.getID()] = {'edge': edge};
}

Node.prototype.removeEdgeFrom = function(sourceNode) {
	delete this._incoming[sourceNode.getID()];
}

Node.prototype.getEdgeFrom = function(sourceNode) {
	return this._incoming[sourceNode.getID()].edge;
}

Node.prototype.hasEdgeFrom = function(sourceNode) {
	return sourceNode.getID() in this._incoming;
}

Node.prototype.getOutgoingEdges = function(excludeSelfReferencing) {
	var edges = [];
	for(var nodeID in this._outgoing) {
		if(!(excludeSelfReferencing == true && nodeID == this.getID()))
			edges.push(this._outgoing[nodeID].edge);
	}
	return edges;
}

Node.prototype.getIncomingEdges = function(excludeSelfReferencing) {
	var edges = [];
	for(var nodeID in this._incoming) {
		if(!(excludeSelfReferencing == true && nodeID == this.getID()))
			edges.push(this._incoming[nodeID].edge);
	}
	return edges;
}

Node.prototype.createVisualNode = function(options) {
	if(this.graph.mode == Graph.Mode.ONLINE) {
		options.id = this.id;
		this.networkNodes.add(options);
	}
}

Node.prototype.updateVisualNodeType = function(options) {
	if(this.graph.mode == Graph.Mode.ONLINE) {
		options.id = this.id;
		this.networkNodes.update(options);
	}
}

Node.prototype.notifyForChange = function(fromType, toType) {
	this.graph.notifyForNodeChange(fromType, toType, this);
}

Node.prototype.remove = function() {
	if(this.graph.mode == Graph.Mode.ONLINE) this.networkNodes.remove(this.getID());
}

Node.prototype.hide = function() {
	if(this.visible && !this.locked) {
		this.networkNodes.update({id: this.id, hidden: true, physics: false});
		this.visible = false;
	}
}

Node.prototype.show = function() {
	if(!this.visible && !this.locked) {
		this.networkNodes.update({id: this.id, hidden: false, physics: true});
		this.visible = true;
	}
}

/* 	@Docs
 	Locks a node.
 	show(),hide() have no effect on it.
 */
Node.prototype.lock = function() {
	if(!this.locked) this.locked = true;
}

/* 	@Docs
 	Unlocks a node.
 	show(),hide() have now effect on it.
 */
Node.prototype.unlock = function() {
	if(this.locked) this.locked = false;
}


Node.prototype.isVisible = function() {
	return this.visible;
}