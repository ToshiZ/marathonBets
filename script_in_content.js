

jQuery.noConflict();                               
jQuery(document).ready(function ($) {
	var mtId,
		tickets,
		divsRel = [],
		tbodyTeams = [],
		teamsJson = {"team":[]};
	
	//chrome.runtime.sendMessage({askFor: 'mtId'}, function (response){
	//	mtId = response.mtId;
	//});
	chrome.runtime.sendMessage({askFor: 'tickets'}, function (response){
			tickets = response.tickets;
		});
	$('tbody[data-event-name]').each(function(i){
		var gameDate = $(this).find('td.date').html();
		var teamsNames = $(this).attr('data-event-name');	
		if(gameDate && teamsNames){		
			gameDate = gameDate.replace(/[\s{2,}]+/g, '');
			var obj = {};
			obj[teamsNames] = gameDate;
			teamsJson.team[i] = obj;		
			
			tbodyTeams.push(teamsNames);
		}
	});
	localStorage.removeItem('teams');
	localStorage.setItem('teams', JSON.stringify(teamsJson));
	$('tbody[data-event-name]').each(function(){
		tbodyTeams.push($(this));
		if($(this).attr('data-event-name').indexOf("Вест Бромвич Альбион") != -1){
			var tdDate = $(this).find('td.date').html();
			if(tdDate)
				if(tdDate.indexOf("16:30") != -1){
					divsRel.push($(this));
				}
		}
	});	
//	function sdf(){ divsRel[0].find('tr:first-child').find('td:last-child').click();}
	//$.when.apply($, divsRel).done(sdf());
	
});