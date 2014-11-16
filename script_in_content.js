$(function () {                     

	var mtId,
		ticketsJson,
		divsRel = [],
		tbodyTeams = [],
		teamsJson = {"team":[]};
		
		
	var tbb = $('tbody[data-event-name]');
	tbb.each(function(i){
		var gameDate = $(this).find('td.date').html();
		var teamsNames = $(this).attr('data-event-name');	
		if(gameDate && teamsNames){		
			gameDate = gameDate.trim();
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
					var start = new Date().getTime();
					ticketsJson = JSON.parse(request.tickets);
					localStorage.setItem('tickets', JSON.stringify(ticketsJson));
						var i = 0;
						setBets();
						function setBets(){
							var bigCycle = setTimeout(function(){
								//var winMessage = ('p#betresult').html();
								//if($('#ok-button.no.simplemodal-close').length){
									if($('p#betresult').html().indexOf("$betresult") == -1){
										if($('p#betresult').html().indexOf("Ваша ставка принята, спасибо") != -1){	
											if($('#ok-button.no.simplemodal-close')[0]);
												$('#ok-button.no.simplemodal-close')[0].click();
											betTicket();
										}else{
											clearTimeout(bigCycle);
											alert($('p#betresult').html());
										}										
									}else{
										if(i != 0){
											betTicket();
											/* clearTimeout(bigCycle);
											var inter = setTimeout(function(){
												setBets();
											}, 500); */
										}else
											betTicket();
									}
								}, 1000);
							}
							
							function betTicket(){
								var forClick = [];
								tbodyTeams.forEach(function(item, index){
										for(var j = 0; j < ticketsJson.ticket[i].length; j++){       		
											if(item.attr('data-event-name').indexOf(ticketsJson.ticket[i][j].name) != -1){
												var tdDate = item.find('td.date').html();
												if(tdDate)
													if(tdDate.indexOf(ticketsJson.ticket[i][j].date) != -1){
														if(ticketsJson.ticket[i][j].bet == 1){
															forClick.push(item.find('tr:first-child').find('td').eq(-1));
															break;
														}
														if(ticketsJson.ticket[i][j].bet == 0){
															forClick.push(item.find('tr:first-child').find('td').eq(-2));
															break;
														}
													}
											}
										}
									});
									var it = 0;
									markTeams();
									function markTeams(){
										var self = forClick[it];
										var markTeamsTimer = setTimeout(function(){
												$(self).click();
												if(it < forClick.length){
													it++;
													markTeams();
												}
												else{
													setCoast(6);
													clearTimeout(markTeamsTimer);
												}
											},1000);
									}
									function setCoast(coast){					
										$('#button_accumulator')[0].click();
										var timer1 = setTimeout(function(){										
												var evt = document.createEvent('KeyboardEvent');
												evt.initKeyboardEvent('keyup', true, true, window, false, false, false, false, 13, 13);
												evt.keyCode = 13;
												evt.which = 13;
												evt.charCode = 13; 
												$('.stake.stake-input.js-focusable[name = stake]').val(coast);
												$('.stake.stake-input.js-focusable[name = stake]')[0].dispatchEvent(evt);
											}, 1000);
										var timer2 = setTimeout(function(){
												//$('.but-place-bet')[0].click();
												$('a.but-remove')[0].click();
												if(i < ticketsJson.ticket.length-1){
													i++;
													setBets();
												}
												else
													clearTimeout(bigCycle);
											}, 2000);
									}
							}
				}
		});
	}
});