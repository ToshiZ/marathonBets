jQuery.noConflict();                               
jQuery(document).ready(function ($) {
	var mtTabId,
		csId;
	chrome.browserAction.onClicked.addListener(function() {
		chrome.tabs.create({'url': "MBExt.html", 'active': false}, function(tab){
		mtTabId = tab.id;
		});
	});
	chrome.runtime.onMessage.addListener(
		 function(request, sender, sendResponse) {		
			if (request.askFor == "mtId"){
				csId = sender.tab.id;
				//sendResponse(JSON.stringify({mtId: mtTabId}));
				sendResponse({mtId: mtTabId});
			}
		});
});