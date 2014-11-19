$(function () {    
	var mtId
		bigCycle,
		divsRel = [],
		tbodyTeams = [],
		teamsJson = {"team":[]},
		i = localStorage.getItem('currentBet')? parseInt(localStorage.getItem('currentBet')): 0,
		ticketsJson = localStorage.getItem('tickets')? JSON.parse(localStorage.getItem('tickets')): {},
		errorInfoJson = localStorage.getItem('errorInfo')? JSON.parse(localStorage.getItem('errorInfo')): {"error":[]},
		betTime = localStorage.getItem('betTime')? parseInt(localStorage.getItem('betTime')): 5000,
		coast = parseInt(localStorage.getItem('coast'));
		
	$('<iframe id="someId"/>').prependTo('body');
	//var info = $('#someId').contents().find('body').append('<p></p>');
	var errList = $('#someId').contents().find('body').append('<ul id="error-list"></ul>');
	$('#someId').contents().find('body').append('<a id="pause">pause</a>');
	$(document).on('click', "#pause", function(){
		clearTimeout(bigCycle);
	});		
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
		localStorage.setItem('teams', JSON.stringify(teamsJson));
		chrome.runtime.sendMessage({askFor: 'teamsFromMB', teams: JSON.stringify(teamsJson)});
		chrome.runtime.onMessage.addListener(
			 function(request, sender, sendResponse) {				
				if (request.askFor == "tickets"){
					coast = parseInt(request.coast);
					ticketsJson = JSON.parse(request.tickets);	
					betTime = parseInt(request.betTime);
					localStorage.setItem('tickets', JSON.stringify(ticketsJson));
					localStorage.setItem('betTime', betTime);
					localStorage.setItem('coast', coast);
					localStorage.setItem('finish', 0);
					localStorage.removeItem('errorInfo');
					errorInfoJson = {"error":[]};
					i = 0;
					setBets();						
				}
		});
		if(localStorage.getItem('finish') != 1)
		{
			setBets();
		}
		function setBets(){
			if(errorInfoJson.error.length){
				$('.rmv').remove();
				errorInfoJson.error.forEach(function(item, ind){
					$('<li></li>').appendTo(errList)
						.html("Билет №" + this.ticketNum + ": " + this.info)
						.attr('id', "err-" + parseInt(this.ticketNum + 1))
						.addClass('rmv');
				});
			}
			bigCycle = setTimeout(function(){
				if(i != 0){
					if($('p#betresult').html().indexOf("Ваша ставка принята, спасибо") != -1){	
						clickEnter();
						if($('a.but-remove').length)
							$('a.but-remove')[0].click();	
						setTimeout(function(){
								betTicket();
							}, 500);
					}else{
						var obj = {};										
						obj['ticketNum'] = i-1;
						obj['info'] =  "";
						if($('p#detail-result-content').html())
							obj['info'] += $('p#detail-result-content').html();
						if($('p#betresult').html())
							obj['info'] += "\n" + $('p#betresult').html();
						if(!obj['info'])
							obj['info'] = "Неизвестная ошибка";
						errorInfoJson.error.push(obj);
						localStorage.setItem('errorInfo', JSON.stringify(errorInfoJson));	
						clickEnter();
						if($('a.but-remove').length)
							$('a.but-remove')[0].click();	
						$('<li></li>').appendTo(errList)
							.html("Билет №" + i + ": " + obj['info'])
							.attr('id', "err-" + i);
						setTimeout(function(){
								betTicket();
							}, 500);
					}						
				}else
					setTimeout(function(){
							if($('a.but-remove').length)
								$('a.but-remove')[0].click();	
							betTicket();
						}, 500);
				
			}, 2000);
		}
			function betTicket(){
				//info.html(parseInt(i+1));
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
									setCoast(coast);
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
							}, 1500);
						var timer2 = setTimeout(function(){
								if(i < ticketsJson.ticket.length-1){
									$('.but-place-bet')[0].click();
									i++;
									setBets();
								}else{
									$('.but-place-bet')[0].click();
									localStorage.setItem('finish', 1);
									//alert('finish');
								}
								//$('a.but-remove')[0].click();
								/* if(i < ticketsJson.ticket.length-1){
									if($('p#detail-result-content').html().indexOf("Извините, Ваша ставка не принята. Повторная ставка. Попробуйте сделать ставку позже.") != -1){
										$('#ok-button.no.simplemodal-close')[0].click();
										$('a.but-remove')[0].click();
										betTicket();
									}else{
										i++;
										setBets();
									}
								}
								else
									clearTimeout(bigCycle); */
							}, betTime);
					}
			}
	chrome.runtime.onMessage.addListener(
		 function(request, sender, sendResponse) {				
			if (request.askFor == "refresh"){
				betTime = parseInt(request.betTime);
				localStorage.setItem('betTime', betTime);
				localStorage.setItem('currentBet', i);
				$('.but-refresh')[0].click();
			}
		});
	}
	function clickEnter(){
		var evt = document.createEvent('KeyboardEvent');
		evt.initKeyboardEvent('keypress', true, true, window, false, false, false, false, 13, 13);
		evt.keyCode = 13;
		evt.which = 13;
		evt.charCode = 13; 
		document.dispatchEvent(evt);
	}
});