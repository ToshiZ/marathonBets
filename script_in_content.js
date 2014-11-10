$(function () {                     

	var mtId,
		ticketsJson,
		divsRel = [],
		tbodyTeams = [],
		teamsJson = {"team":[]},
		forClick = [];
		
	var tbb = $('tbody[data-event-name]');
	
	
	//chrome.runtime.sendMessage({askFor: 'mtId'}, function (response){
	//	mtId = response.mtId;
	//});
	
	/* tbb.each(function(){
		tbodyTeams.push($(this));
		if($(this).attr('data-event-name').indexOf("Валенсия") != -1){
			var tdDate = $(this).find('td.date').html();
			if(tdDate)
				if(tdDate.indexOf("21:00") != -1){
					divsRel.push($(this));
				}
		}
	});	 */
	tbb.each(function(i){
		var gameDate = $(this).find('td.date').html();
		var teamsNames = $(this).attr('data-event-name');	
		if(gameDate && teamsNames){		
			gameDate = gameDate.replace(/[\s{2,}]+/g, '');
			var obj = {};
			obj['name'] = teamsNames;
			obj['date'] =  gameDate;
			teamsJson.team[i] = obj;		
			tbodyTeams.push($(this));
		}
	});	
	if(teamsJson.team[0]){
		localStorage.removeItem('teams');
		localStorage.setItem('teams', JSON.stringify(teamsJson));
		chrome.runtime.sendMessage({askFor: 'teamsFromMB', teams: JSON.stringify(teamsJson)});
		chrome.runtime.onMessage.addListener(
			 function(request, sender, sendResponse) {		
				if (request.askFor == "tickets"){
					ticketsJson = JSON.parse(request.tickets);
					localStorage.setItem('tickets', JSON.stringify(ticketsJson));
					tbodyTeams.forEach(function(item, index){
						for(var j = 0; j < ticketsJson.ticket[0].length; j++){
							if(item.attr('data-event-name').indexOf(ticketsJson.ticket[0][j].name) != -1){
								var tdDate = item.find('td.date').html();
								if(tdDate)
									if(tdDate.indexOf(ticketsJson.ticket[0][j].date) != -1){
										if(ticketsJson.ticket[0][0].bet == 1){
											//setTimeout(function(){
											forClick.push(item.find('tr:first-child').find('td').eq(-1));
											//},1000);
											break;
										}
										if(ticketsJson.ticket[0][j].bet == 0){
											//setTimeout(function(){
											forClick.push(item.find('tr:first-child').find('td').eq(-2));
											//},1000);
											break;
										}
									}
							}
						}
					});
					forClick.forEach(function(item){
						setTimeout(function(){
							item.click();
						},2000);
					});
				}
		});
	}
});