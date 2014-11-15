$(function () {                     

	var mtId,
		ticketsJson,
		divsRel = [],
		tbodyTeams = [],
		teamsJson = {"team":[]},
		forClick = [];
		
										
		
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
					ticketsJson = JSON.parse(request.tickets);
					localStorage.setItem('tickets', JSON.stringify(ticketsJson));
					tbodyTeams.forEach(function(item, index){
						for(var j = 0; j < ticketsJson.ticket[0].length; j++){
							if(item.attr('data-event-name').indexOf(ticketsJson.ticket[0][j].name) != -1){
								var tdDate = item.find('td.date').html();
								if(tdDate)
									if(tdDate.indexOf(ticketsJson.ticket[0][j].date) != -1){
										if(ticketsJson.ticket[0][j].bet == 1){
											forClick.push(item.find('tr:first-child').find('td').eq(-1));
											break;
										}
										if(ticketsJson.ticket[0][j].bet == 0){
											forClick.push(item.find('tr:first-child').find('td').eq(-2));
											break;
										}
									}
							}
						}
					});
					var marksReady = false;
					$(forClick).each(function(i){	
						var self = this;
						return setTimeout(function(){
							$(self).click();
							var tmp = i; 
							if(tmp == forClick.length-1)
								return setCoast(123);
						},1000*(i+1));
					});
					$(document).on('keyup','.stake.stake-input.js-focusable[name = stake]', function(e){
						//e.stopPropagation();
					//	$(this).keyup();
						console.log(e);
					});
					$(document).on('click', '.but-place-bet', function(e){
						//e.stopPropagation();
					//	$(this).click();
						console.log(e);
					});						
					function setCoast(coast){					
									$('#button_accumulator').click();
									var timer1 = setTimeout(function(){
										$('.stake.stake-input.js-focusable[name = stake]').val(123);
									var eve = document.createEvent('KeyboardEvent');
									eve.initKeyboardEvent('keyup', true, true, window, false, false, false, false, 65, 65);
									eve.keyCode = 65;
									eve.which = 65;
									eve.charCode = 65; 
									//var canceled = !body.dispatchEvent(evt);
										$('.stake.stake-input.js-focusable[name = stake]')[0].dispatchEvent(eve);
									}, 1000);
									var timer2 = setTimeout(function(){
										$('.but-place-bet')[0].click();
									}, 2000);
					}
					/* var checkExist = setInterval(function(){
					   if(marksReady){
							setTimeout(function(){
								$('#button_accumulator').click();
								$('[name = stake]').val(123);
								clearInterval(checkExist);
								},1000);
					   }
					}, 1000); */
					/* $('#betslip-content').load($(this).find('#button_accumulator'), function(){
						$(this).find('#button_accumulator').click();
						console.log($(this).find('#button_accumulator'));
					}); */
					/* $(document).on('load', "#button_accumulator" , function() {
						$(this).click();
						}); */
					/* $.when.apply($, ready).then(function(){
						$('#button_accumulator').click();
						console.log($('#button_accumulator'));
						}); */
					/* setTimeout(function(){
							$("a:contains('Экспрессы')").click();
						},(forClick.length + 1)*1000); */
				}
		});
	}
});