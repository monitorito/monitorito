QUnit.module( "graph.filter.FilterOptions", {
    beforeEach: function() {
        this.filterOptions = new FilterOptions();

        this.node = sinon.createStubInstance(DomainNode);
        this.node.getID.returns("test");
        this.node.getIncomingDomainEdges.returns([]);
        this.node.getOutgoingDomainEdges.returns([sinon.createStubInstance(DomainEdge), sinon.createStubInstance(DomainEdge)]);

        this.metrics = {
            phishing: 50,
            tracking: 50,
            leaking: 0,
            trackingCookies: 100
        };
    }
});

QUnit.test("Default filterOptions match any node", function(assert) {
    var node = this.node;
    var metrics = this.metrics;

    assert.ok(this.filterOptions.satisfiedByNode(node, metrics), "node not filtered out.");
});

QUnit.test("Filtering nodes with domain including example.com", function(assert) {
    var node = this.node;
    var metrics = this.metrics;
    this.filterOptions.setDomainRegExp(new RegExp("(.*)example.com(.*)"));

    assert.notOk(this.filterOptions.satisfiedByNode(node, metrics), "node filtered out.");
});

QUnit.test("Filtering nodes with at least 1 incoming edge", function(assert) {
    var node = this.node;
    var metrics = this.metrics;
    this.filterOptions.setEdgesMin("incoming", 1);

    assert.notOk(this.filterOptions.satisfiedByNode(node, metrics), "node filtered out.");
});

QUnit.test("Filtering nodes with at most 1 outgoing edge, and domain including the word 'test'", function(assert) {
    var node = this.node;
    var metrics = this.metrics;
    this.filterOptions.setDomainRegExp(new RegExp("(.*)test(.*)"));
    this.filterOptions.setEdgesMax("outgoing", 2);

    assert.ok(this.filterOptions.satisfiedByNode(node, metrics), "node not filtered out.");
});

QUnit.test("Filtering nodes with specific ranges in metrics", function(assert) {
    var node = this.node;
    var metrics = this.metrics;
    this.filterOptions.setMetricMin("phishing", 30);
    this.filterOptions.setMetricMax("phishing", 60);

    assert.ok(this.filterOptions.satisfiedByNode(node, metrics), "node not filtered out.");

    this.filterOptions.setMetricMin("tracking", 80);
    this.filterOptions.setMetricMax("tracking", 100);
    assert.notOk(this.filterOptions.satisfiedByNode(node, metrics), "node filtered out.");
});