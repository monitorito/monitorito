archiveAutoIncrement = 1;
window.monitor = true;
archive = {};
tabsMappings = {};

excludedUrlPatterns = ["https://www.google.gr/_/chrome/newtab"];

function isExcluded(url) {
	for(var i=0; i < excludedUrlPatterns.length; i++) {
		var excludedPattern = excludedUrlPatterns[i];
		if(url.toLowerCase().search(excludedPattern.toLowerCase()) >= 0) return true;
	}
	return false;
}

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		if(monitor && !isExcluded(details.url)) logRequest(details);
	},
	{urls: ["<all_urls>"]}
);

chrome.webRequest.onBeforeRedirect.addListener(
	function(details) {
		if(monitor && !isExcluded(details.url)) logRedirect(details);
	},
	{urls: ["<all_urls>"]}
);

function logRequest(request) {
	if(request.type == "main_frame") {
		request.url = parseURL(request.url);
		archive[archiveAutoIncrement] = {'rootRequest': request, 'requests': []};
		tabsMappings[request.tabId] = {'requestsGroup': archive[archiveAutoIncrement]};
		archiveAutoIncrement++;
		addRequestNode(request, request);
	}
	else if(request.tabId in tabsMappings) {
		request.url = parseURL(request.url);
		var requestsGroup = tabsMappings[request.tabId].requestsGroup;
		requestsGroup.requests.push(request);
		addRequestNode(requestsGroup.rootRequest, request);
	}
	
}

function logRedirect(request) {
	if(request.tabId in tabsMappings) {
		var previousURL = parseURL(request.url);
		var newURL = parseURL(request.redirectUrl);
		if(previousURL.hostname != newURL.hostname) {		//not http -> https redirect
			var requestsGroup = tabsMappings[request.tabId].requestsGroup;
			if(request.type == "main_frame") requestsGroup.redirectedTo = newURL;
			else {
				var requests = requestsGroup.requests;
				for(var requestID in requests) {
					if(requests[requestID].url == previousURL) requests[requestID].redirectedTo = newURL;
				}
			}		
				
			if(!existsEdge(previousURL, newURL, EdgeType.REDIRECT)) {
				if(!(newURL.hostname in graph)) createGraphNode(newURL, request.type == "main_frame");
				createRedirectEdge(previousURL, newURL);
			} 
		}
	}
}