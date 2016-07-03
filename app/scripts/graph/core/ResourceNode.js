"use strict";

function ResourceNode(id, graph, networkNodes, networkEdges, parentNode, parentEdgeID) {
    Node.call(this, id, graph, networkNodes);

    this.type = ResourceNode.Type.default;
    this.cookies = {};
    this.cookies[HttpRequest.Type.ROOT] = {};
    this.cookies[HttpRequest.Type.EMBEDDED] = {};
    this._requests = [];
    this.networkEdges = networkEdges;
    this.createVisualNode();

    this._parent = parentNode;
    this._parent.addChildNode(this);
    this.parentEdgeID = parentEdgeID;
    this.createTempParentEdge();
}

ResourceNode.prototype = Object.create(Node.prototype);

ResourceNode.Type = {};
ResourceNode.Type["default"] = {name: "Default", rank: 3, size: 10};
ResourceNode.Type[HttpRequest.Type.ROOT] = {name: "First Party", rank: 1, size: 20};
ResourceNode.Type[HttpRequest.Type.EMBEDDED] = {name: "Third Party", rank: 2, size: 10};

ResourceNode.prototype.addRequest = function(httpRequest) {
    this._requests.push(httpRequest);
    for(var key in httpRequest.cookies) {
        this.cookies[httpRequest.type][key] = httpRequest.cookies[key];
    }
    if(this.type.rank > ResourceNode.Type[httpRequest.type].rank) this.updateType(ResourceNode.Type[httpRequest.type]);
}

ResourceNode.prototype.getRequests = function() {
    return this._requests;
}

ResourceNode.prototype.getFirstPartyCookies = function() {
    return this.cookies[HttpRequest.Type.ROOT];
}

ResourceNode.prototype.getThirdPartyCookies = function() {
    return this.cookies[HttpRequest.Type.EMBEDDED];
}

ResourceNode.prototype.createVisualNode = function() {
    var options = {
        id: this.getID(),
        shape: 'diamond',
        size: this.type.size,
        borderWidth: 5,
        'color.border': '#336600',
        'color.highlight.border': '#73E600',
        title: this.getID()
    }
    Node.prototype.createVisualNode.call(this, options);
}

ResourceNode.prototype.updateVisualNodeType = function() {
    var updateOptions = {
        id: this.getID(),
        size: this.type.size
    }
    Node.prototype.updateVisualNodeType.call(this, updateOptions);
}

/* No need to notify GraphStatisticsCalculator as in DomainNode */
ResourceNode.prototype.updateType = function(type) {
    this.type = type;
    this.updateVisualNodeType();
}

ResourceNode.prototype.remove = function() {
    this._parent.removeChildNode(this);
    this._parent = null;
    this.removeTempParentEdge();
    Node.prototype.remove.call(this);
}

ResourceNode.prototype.createTempParentEdge = function() {
    this.networkEdges.add({id: this.parentEdgeID, from: this._parent.getID(), to: this.getID(), width: 2, color: "green"})
}

ResourceNode.prototype.removeTempParentEdge = function() {
    this.networkEdges.remove(this.parentEdgeID);
}