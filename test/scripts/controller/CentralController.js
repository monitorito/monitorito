QUnit.module( "controller.CentralController", {
	beforeEach: function() {
		var interfaceHandler = new InterfaceHandler();
		this.mockInterfaceHandler = sinon.mock(interfaceHandler);

		var monitoringService = new MonitoringService(new EventSource());
		this.mockMonitoringService = sinon.mock(monitoringService);

		var visNetwork = sinon.createStubInstance(vis.Network);
		var graph = new Graph(visNetwork);
		var graphHandler = new GraphHandler(graph);
		this.mockGraphHandler = sinon.mock(graphHandler);

		this.controller = new CentralController(interfaceHandler, monitoringService, graphHandler);
	}
});

QUnit.test("addRequestToGraph(), addRedirectToGraph() methods", function(assert) {
	var controller = this.controller;
	var mockGraphHandler = this.mockGraphHandler;

	var rootRequest = new HttpRequest("GET", "http://www.example.com/test", Date.now(), {}, HttpRequest.Type.ROOT);
	var request = new HttpRequest("GET", "http://www.dependency.com/library", Date.now(), {}, HttpRequest.Type.EMBEDDED);
	var redirect = new Redirect("http://www.example.com/test", "http://www.example2.com/test", HttpRequest.Type.ROOT, Date.now());

	mockGraphHandler.expects("addRequest").exactly(1).withArgs(rootRequest, request);
	mockGraphHandler.expects("addRedirect").exactly(1).withArgs(redirect);

	controller.addRequestToGraph(rootRequest, request);
	controller.addRedirectToGraph(redirect);

	mockGraphHandler.verify();
});

QUnit.test("setFirstPartyDomainsToUI(), setThirdPartyDomainsToUI() methods", function(assert) {
	var controller = this.controller;
	var mockInterfaceHandler = this.mockInterfaceHandler;

	var firstPartyDomains = Math.floor((Math.random() * 100) + 1);
	var thirdPartyDomains = Math.floor((Math.random() * 100) + 1);

	mockInterfaceHandler.expects("setFirstPartyDomains").exactly(1).withArgs(firstPartyDomains);
	mockInterfaceHandler.expects("setThirdPartyDomains").exactly(1).withArgs(thirdPartyDomains);

	controller.setFirstPartyDomainsToUI(firstPartyDomains);
	controller.setThirdPartyDomainsToUI(thirdPartyDomains);

	mockInterfaceHandler.verify();
});