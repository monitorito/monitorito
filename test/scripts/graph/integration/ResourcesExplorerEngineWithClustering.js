QUnit.module( "graph.integration.ResourcesExplorerEngineWithClustering", {
    beforeEach: function() {
        this.visualisationNetwork = new VisualisationNetwork(jQuery("<canvas>")[0]);
        this.graph = new Graph(this.visualisationNetwork);

        this.resourcesExplorerEngine = new ResourcesExplorerEngine(this.graph);

        this.clusteringEngine = new ClusteringEngine(this.graph, this.resourcesExplorerEngine);
        this.graph.setClusteringEngine(this.clusteringEngine);

        this.graphStatsCalculator = new GraphStatsCalculator();
        this.filteringEngine = new FilteringEngine(this.graph, this.graphStatsCalculator);
        this.filteringEngine.resetFilter();

        var node1 = this.graph.createDomainNode("www.example.com");
        var node2 = this.graph.createDomainNode("example.com");
        var node3 = this.graph.createDomainNode("test.com");
        var edge1 = this.graph.createDomainEdge("example.com", "www.example.com");
        var edge2 = this.graph.createDomainEdge("example.com", "test.com");
        var request1 = new HttpRequest(1, "GET", "http://example.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        var redirect = new Redirect("http://example.com", "http://www.example.com", HttpRequest.Type.ROOT, Date.now());
        var request2 = new HttpRequest(2, "GET", "http://www.example.com", Date.now(), {}, HttpRequest.Type.ROOT, "main_frame");
        var request3 = new HttpRequest(3, "GET", "http://test.com", Date.now(), {}, HttpRequest.Type.EMBEDDED, "sub_frame");
        node1.addRequest(request1);
        node2.addRequest(request2);
        node3.addRequest(request3);
        edge1.addLink("http://example.com", redirect, DomainEdge.LinkType.REDIRECT);
        edge2.addLink("http://example.com", request3, DomainEdge.LinkType.REQUEST);
    }
});

/* Clustering automatically collapses all neighbour nodes of the formed cluster
   De-clustering also automatically collapses all neighbour nodes of the formed cluster
*/
QUnit.test("Resources Explorer Engine executed before clustering: Expanded nodes belong are neighbours of the cluster", function(assert) {
    this.resourcesExplorerEngine.expand(this.graph.getNode("example.com"));

    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["www.example.com", "test.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    assert.notOk(this.graph.getNode("example.com").isExpanded(), "Neighbour node collapsed for clustering");
    assert.ok(this.graph.getNode("www.example.com").isClustered(), "node 1 clustered");
    assert.ok(this.graph.getNode("test.com").isClustered(), "node 2 clustered");
    assert.ok(this.graph.existsEdge("example.com", "cluster-1"), "edge cluster-1 --> example.com created");

    this.resourcesExplorerEngine.expand(this.graph.getNode("example.com"));
    this.clusteringEngine.deCluster("cluster-1");

    assert.ok(!this.graph.getNode("example.com").isExpanded(), "neighbour expanded node was collapsed before executing de-cluster");
});

/* Clustering automatically collapses all neighbour nodes incuded in the cluster */
QUnit.test("Resources Explorer Engine executed before clustering: Expanded nodes belong in the cluster.", function(assert) {
    this.resourcesExplorerEngine.expand(this.graph.getNode("www.example.com"));

    assert.ok(this.graph.getNode("www.example.com").isExpanded(), "Clustered node expanded before clustering");

    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["www.example.com", "test.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    assert.ok(this.graph.getNode("www.example.com").isClustered(), "previously expanded node was successfully clustered");
    assert.ok(this.graph.getNode("www.example.com").getCluster() == this.clusteringEngine.getCluster("cluster-1"), "node clustered to correct cluster");

    this.clusteringEngine.deCluster("cluster-1");
    assert.ok(!this.graph.getNode("www.example.com").isExpanded(), "clustered node was collapsed before clustering");
});

/* Expanding domain node that is connected to clustered nodes, creates resources edges to the corresponding cluster*/
QUnit.test("Resources Explorer Engine executed after clustering: Expanding neighbour nodes of a cluster", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["www.example.com", "test.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    this.resourcesExplorerEngine.expand(this.graph.getNode("example.com"));

    assert.notOk(this.graph.getEdgeBetweenNodes("example.com", "cluster-1").isVisible(), "inter-domain edge hidden");
    assert.ok(this.graph.existsNode("http://example.com"), "Resource node created successfully");
    assert.ok(this.graph.existsEdge("http://example.com", "cluster-1"), "Resource edge created between domain node and cluster");
    assert.ok(this.graph.getEdgeBetweenNodes("http://example.com", "cluster-1").getLinks(DomainEdge.LinkType.REDIRECT).length == 1, "Redirect link transferred to resource node");
    assert.ok(this.graph.getEdgeBetweenNodes("http://example.com", "cluster-1").getLinks(DomainEdge.LinkType.REQUEST).length == 1, "Request link transferred to resource node");

    this.resourcesExplorerEngine.collapse(this.graph.getNode("example.com"));

    assert.notOk(this.graph.existsNode("http://example.com"), "Resource node deleted successfully");
    assert.notOk(this.graph.existsEdge("http://example.com", "cluster-1"), "Resource edge deleted successfully");
    assert.ok(this.graph.getEdgeBetweenNodes("example.com", "cluster-1").isVisible(), "inter-domain edge shown");
});

/* Expanding cluster, or domain node that is currently clustered is not allowed */
QUnit.test("Resources Explorer Engine executed after clustering: Expanding cluster or clustered node", function(assert) {
    var clusterOptions = new ClusterOptions(ClusterOptions.operationType.DOMAINS);
    clusterOptions.setDomains(["www.example.com", "test.com"]);
    this.clusteringEngine.cluster(clusterOptions, "cluster-1");

    var resourcesExplorerEngine = this.resourcesExplorerEngine;
    assert.throws(
        function() {
            resourcesExplorerEngine.expand(this.graph.getNode("cluster-1"));
        },
        Error,
        "Cannot expand cluster"
    );
    assert.throws(
        function() {
            resourcesExplorerEngine.expand(this.graph.getNode("www.example.com"));
        },
        Error,
        "Cannot expand clustered node"
    );
});


