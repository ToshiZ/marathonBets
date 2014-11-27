$(function () {    
	var n_,
		k_,
		n_k_,
		teamsJson,// =  localStorage.getItem('teams')? JSON.parse(localStorage.getItem('teams')): {"team":[]},
		selectedTeamsJson,// = localStorage.getItem('selectedTeams')? JSON.parse(localStorage.getItem('selectedTeams')): {"team":[]},
		csId = localStorage.getItem('contentId')? JSON.parse(localStorage.getItem('contentId')): {},
		ticketsJson = {"ticket":[]},
		errorInfoJson = localStorage.getItem('errorInfo')? JSON.parse(localStorage.getItem('errorInfo')): {"error":[]},
		errorTicketsJson = localStorage.getItem('errorTickets')? JSON.parse(localStorage.getItem('errorTickets')): {"ticket":[]},
		pauseFl = true,
		sendRefreshTimer,
		filter = [];
		filter[0] = []; //k block
		filter[1] = []; //n-k block;
		//localStorage.removeItem('selectedTeams');
		//localStorage.removeItem('teams');
	if(localStorage['teams']){
		teamsJson =  JSON.parse(localStorage.getItem('teams'));
		fillTeamList(teamsJson);
	}else
		teamsJson = {"team": []};
	if(localStorage['selectedTeams']){
			selectedTeamsJson =  JSON.parse(localStorage.getItem('selectedTeams'));
			markSelectedTeams(selectedTeamsJson);
			n_ = selectedTeamsJson.team.length;
				$('#n').val(n_ > 0? n_: "");
	}else
		selectedTeamsJson = {"team": []};
		
	chrome.runtime.onMessage.addListener(
		 function(request, sender, sendResponse) {		
			if (request.askFor == "contentScriptId"){
				csId.id = parseInt(sender.tab.id);
				localStorage.setItem('contentId', JSON.stringify(csId));
				//teamsJson = JSON.parse(request.teams);
				//localStorage.setItem('teams', JSON.stringify(teamsJson));
				//fillTeamList(teamsJson);
				//markSelectedTeams(selectedTeamsJson);
			}
	});
	chrome.runtime.onMessage.addListener(
		 function(request, sender, sendResponse) {		
			if (request.askFor == "ticketDone"){
				csId.id = parseInt(sender.tab.id);
                localStorage.setItem('contentId', JSON.stringify(csId));
				var tNum = parseInt(request.ticketNum);
				markDoneTicket(tNum, false, '');
			}
	});
	chrome.runtime.onMessage.addListener(
		 function(request, sender, sendResponse) {		
			if (request.askFor == "ticketError"){
				csId.id = parseInt(sender.tab.id);
                localStorage.setItem('contentId', JSON.stringify(csId));
				errorInfoJson.error.push(JSON.parse(request.errorInfo));
				localStorage.setItem('errorInfo', JSON.stringify(errorInfoJson));
				var tNum = parseInt(errorInfoJson.error[errorInfoJson.error.length-1].ticketNum);
				var inf = errorInfoJson.error[errorInfoJson.error.length-1].info;
				errorTicketsJson.ticket.push(ticketsJson.ticket[tNum]);
				localStorage.setItem('errorTickets', JSON.stringify(errorTicketsJson));
				markDoneTicket(tNum, true, inf);
			}
	});
	$('#get-teams').on('click', function(){
		chrome.tabs.sendMessage(csId.id, {'askFor': 'getTeams'}, function(response){
			teamsJson = JSON.parse(response.teams);
			localStorage.setItem('teams', JSON.stringify(teamsJson));
			fillTeamList(teamsJson);
			selectedTeamsJson = {"team":[]};
			ticketsJson = {"ticket":[]};
			errorInfoJson = {"error":[]};
			errorTicketsJson = {"ticket":[]};
			localStorage.setItem('tickets', JSON.stringify(ticketsJson));
			localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
			n_ = selectedTeamsJson.team.length;
			$('#n').val(n_ > 0? n_: "");
		});
	});
	$('#clear').on('click', function(){		
		$('#team-list > div').remove();
		$('input').val("");
		teamsJson = {"team":[]};			
		selectedTeamsJson = {"team":[]};
		ticketsJson = {"ticket":[]};
		errorInfoJson = {"error":[]};
		errorTicketsJson = {"ticket":[]};
		localStorage.setItem('teams', JSON.stringify(teamsJson));
		localStorage.setItem('tickets', JSON.stringify(ticketsJson));
		localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
		n_ = 0;			
		clearInterval(sendRefreshTimer);
		pauseFl = true;
		chrome.tabs.sendMessage(csId.id, {'askFor': 'stop'});
	});
	$(document).on('input', ".k-blocks", function(){ 
		filter[0] = [];
		$('.k-blocks').each(function() {
				if($(this).val().length)
					filter[0].push(parseInt($(this).val()));				 
			});
		if($(".k-blocks").last().val() < 2){
			$(".k-blocks").last().val('');
			return false;
		}
		if($(".k-blocks").last().val() && sumOfMas(filter[0]) < k_){		
			$('<input type="text"></input>').appendTo('#k-blocks-div')
				.attr('id', "k-block"+$(".k-blocks").length)
				.css({width:"50px",
					background: "#3C3F45",
					color: "white"})
				.attr('placeholder',"Блок "+$(".k-blocks").length)
				.addClass("k-blocks dynamic");
		}else{
			$('.k-blocks').filter(function(){return !this.value;}).remove();
		}
	});		
	$(document).on('input', ".n-k-blocks", function(){
		filter[1] = [];
		$('.n-k-blocks').each(function() {
			if($(this).val().length != 0)
				filter[1].push(parseInt($(this).val()));				 
		});
		if($(".n-k-blocks").last().val() < 2){
			$(".n-k-blocks").last().val('');
			return false;
		}
		if($(".n-k-blocks").last().val() && sumOfMas(filter[1]) < n_k_){	
			$('<input type="text"></input>').appendTo('#n-k-blocks-div')
				.attr('id', "n-k-block"+$(".n-k-blocks").length)
				.css({width:"50px",
					background: "#3C3F45",
					color: "white",
					'margin-top': "19px"})
				.attr('placeholder',"Блок "+$(".n-k-blocks").length)
				.addClass("n-k-blocks dynamic");
		}else{
			$('.n-k-blocks').filter(function(){return !this.value;}).remove();
		}
	});
	$(".n-k-params").on('input', function(){ 		
		$('.dynamic').remove();
		$(this).each(function(){
			if($(this).val().length != 0){
				/* if($('#n').val() && $('#k').val())
					$('#n-k').val(parseInt($('#n').val()) - parseInt($('#k').val()));
				if($('#n-k').val() && $('#k').val())
					$('#n').val(parseInt($('#n-k').val()) + parseInt($('#k').val()));
				if($('#n').val() && $('#n-k').val())
					$('#k').val(parseInt($('#n').val()) - parseInt($('#n-k').val())); */
				if($(this).attr('id') == 'k'){
					k_ = parseInt($(this).val());
					n_k_ = n_ - k_;
					$('#n-k').val(n_k_);
				}
				if($(this).attr('id') == 'n-k'){
					n_k_ = parseInt($(this).val());
					k_ = n_ - n_k_;
					$('#k').val(k_);
				}
				/* n_ = parseInt($('#n').val());
				k_ = parseInt($('#k').val());
				n_k_ = parseInt($('#n-k').val()); */
				if(!isNaN(n_) && !isNaN(k_) && n>=k)
					inputsForBlocks(n_,k_);
			}
		});
	});
		//START
	$(document).on('click', "#start-but", function(){
		var tmpObj = {};
		tmpObj.selectedTeams = selectedTeamsJson;
		tmpObj.plus = k_;
		tmpObj.minus = n_k_;
		tmpObj.plusBlocks = filter[0];
		tmpObj.minusBlocks = filter[1];
		tmpObj.plusWithoutBloks = $('#k-check').prop("checked");
		tmpObj.minusWithoutBloks = $('#n-k-check').prop("checked");
		tmpObj.coast = parseInt($('#coast').val());
		tmpObj.who = 'me';

		chrome.tabs.sendMessage(csId.id, {'askFor': 'tickets', 'tickets': JSON.stringify(ticketsJson), 'params': JSON.stringify(tmpObj), 'coast':  parseInt($('#coast').val()), 'betTime': parseInt($('#betTime').val()*1000), 'markTime': parseInt($('#markTime').val())});
		localStorage.setItem('tickets', JSON.stringify(ticketsJson));
		sendRefreshTimer = setInterval(function(){
			chrome.tabs.sendMessage(csId.id, {'askFor': 'refresh', 'betTime': parseInt($('#betTime').val()*1000), 'markTime': parseInt($('#markTime').val())});
		},parseInt($('#refreshTime').val()*1000));
		pauseFl = false
		localStorage.removeItem('errorInfo');
		errorInfoJson = {"error":[]};
		localStorage.removeItem('errorTickets');
		errorTicketsJson = {"ticket":[]};
	});
	//PAUSE
	$(document).on('click', "#pause-but", function(){
		if(!pauseFl){
			chrome.tabs.sendMessage(csId.id, {'askFor': 'pause'});
			clearInterval(sendRefreshTimer);
			pauseFl = true;
			$(this).html('ПРОДОЛЖИТЬ');
		}
		else{
			chrome.tabs.sendMessage(csId.id, {'askFor': 'resume'});
			sendRefreshTimer = setInterval(function(){
				chrome.tabs.sendMessage(csId.id, {'askFor': 'refresh', 'betTime': parseInt($('#betTime').val()*1000), 'markTime': parseInt($('#markTime').val())});
			},parseInt($('#refreshTime').val()*1000));
			pauseFl = false;
			$(this).html('ПАУЗА');
		}
	});
	//STOP
	$(document).on('click', "#stop-but", function(){
			chrome.tabs.sendMessage(csId.id, {'askFor': 'stop'});
			clearInterval(sendRefreshTimer);
			pauseFl = true;
	});
	//REBET
	$(document).on('click', "#rebet-but", function(){
		chrome.tabs.sendMessage(csId.id, {'askFor': 'tickets', 'tickets': JSON.stringify(errorTicketsJson), 'coast':  parseInt($('#coast').val()), 'betTime': parseInt($('#betTime').val()*1000), 'markTime': parseInt($('#markTime').val())});
		sendRefreshTimer = setInterval(function(){
			chrome.tabs.sendMessage(csId.id, {'askFor': 'refresh', 'betTime': parseInt($('#betTime').val()*1000), 'markTime': parseInt($('#markTime').val())});
		},parseInt($('#refreshTime').val()*1000));
		pauseFl = false
		localStorage.removeItem('errorInfo');
		errorInfoJson = {"error":[]};
		localStorage.removeItem('errorTickets');
		errorTicketsJson = {"ticket":[]};
		$('#error-area div.row').remove();
		$('#error-area').prev().find('a.accordion-toggle').html('Ошибки (' + $('#error-area .accordion-inner > div.row').length + ')');
		$('#rebet-but').html('Повторить непоставленные (' +  $('#error-area .accordion-inner > div.row').length + ')');
	});
	//RUN
	$(document).on('click', "#run", function(){
		if(sumOfMas(filter[0]) > k_)
			filter[0] = filter[0].slice(0,-1);
		if(sumOfMas(filter[1]) > n_-k_)
			filter[1] = filter[1].slice(0,-1);
		var res = cBlocksBin(n_, k_, filter[0], filter[1]);
		if($('#k-check').prop("checked") && $('#n-k-check').prop("checked")){
			var res = cBlocksBin(n_, k_, [], []);
			popBloks(res, 10);
		}else{
			if($('#k-check').prop("checked")){
				var res = cBlocksBin(n_, k_, [], filter[1]);
				popBloks(res, 1);
			}
			if($('#n-k-check').prop("checked")){
				var res = cBlocksBin(n_, k_, filter[0], []);
				popBloks(res, 0);
			}
		}
		print2DemArr(res);
	});
	//});
	//use team from team list
	$('#team-list').on('click', 'div.alert', function(e){
		if(e.target == this){
			if($(this).hasClass('alert-standard')){
				var obj = {};
				obj['name'] = $(this).attr("data-name");
				obj['date'] = $(this).attr("data-date");
				selectedTeamsJson.team.push(obj);
				localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
				$(this)
					.removeClass('alert-standard')
					.addClass('alert-error');
			}else{
				selectedTeamsJson.team.splice(selectedTeamsJson.team.indexOf(obj,1));
				localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
				$(this)
					.removeClass('alert-error')
					.addClass('alert-standard');
			}
			n_ = selectedTeamsJson.team.length;			
			$('#n').val(n_>0?n_:"");
		}
	});
	function sumOfMas(m){
		var total = 0;
		$.each(m,function(){
			total += this;			
		});
		return total;
	}
	function allTrue(m){
		for(var i = 0; i < m.length; i++)
			if(m[i] == false)
				return false;
		return true;
	}	
	function combinations(arr) {
		if(arr.length >1){
			var beg = arr[0],
				arr1 = combinations(arr.slice(1)),
				arr2 = [],
				l = arr1[0].length;
				for(var i=0; i < arr1.length; i++)
					for(var j=0; j <= l; j++)
						arr2.push(arr1[i].slice(0,j).concat(beg, arr1[i].slice(j)));
				return arr2;
		}else return [arr];
	}
	function c_n_k (n,k){
		var total = 0,
			output = new Array;
		n--;
		output[total]=new Array;
		for(var i = 0; i < k; i++)
			output[total][i] = i;
		while(true){
			var search = false,
				max = 0;
			for(var j=0;j<k;j++)
				if(max<=j && output[total][j]<n-k+j+1){
					search = true;
					max = j;
				}
				if(!search)
					break;
				total++;
				output[total]=output[total-1].slice();				
				output[total][max]++;
				for(var j=max+1;j<k;j++)
					output[total][j]=output[total][j-1]+1;			
		}
		return output;
	}
	function invert(input){
		var k = input[0].length,
			n = input[input.length-1][k-1]+1,
			output = new Array;
		for(var i=0;i<input.length;i++){
			var w=0;
			output[i] = new Array;
			for(var j=0;j<n;j++)
				if(input[i].indexOf(j)==-1){
					output[i][w] = j;
					w++;
				}
		}
		return output;
	}
	function block(input,filter,n){
		if(filter.length == 0)
			return input;
		var k = input[0].length,
			output = new Array,
			z = 0;
		if(sumOfMas(filter) > k)
			return input;
		filter = filter.map(function(ind, el){ if(ind-1>0) return ind-1;});
		if(filter.length == 0)
			return input;
		for(var i=0; i<input.length; i++) top:{					
			var w = 0,
				blocks = new Array;
			for(var j=0; j<k-1; j++)
				if(input[i][j] == input[i][j+1]-1){
					w++;		
				}else {
					if(w!=0){
						blocks.push(w);
						w = 0;	
					}
				}
			if(w!=0){					
				blocks.push(w);
				w = 0;	
			}
			var combs = combinations(filter);
			for(var comb = 0; comb < combs.length; comb++){
				var diff,
					bloksIter = 0;
				diff = blocks[bloksIter];
				for(var el = 0; el < combs[0].length; el++){
					diff = (el == combs[0].length-1 || diff == combs[comb][el])?(diff - combs[comb][el]):(diff - combs[comb][el]-1);
					if(bloksIter>=blocks.length || diff < 0)
						break;
					if(diff == 0){
						bloksIter++;							
						diff = blocks[bloksIter];
					}
					if(el == combs[0].length-1){
							output[z] = new Array;
							output[z] = input[i];
							z++;
							break top;
					}						
				}
			}
		}			
		return output;
	}
	function inputsForBlocks(n,k){
		$('.dynamic').detach();	
		if(k > 1){
			$('<input type="text"></input>').appendTo('#k-blocks-div')
				.attr('id', "k-block"+$(".k-blocks").length)
				.css({width:"50px",
					background: "#3C3F45",
					color: "white"})
				.attr('placeholder',"Блок "+$(".k-blocks").length)
				.addClass("k-blocks dynamic");
		}
		if(n-k > 1){
			$('<input type="text"></input>').appendTo('#n-k-blocks-div')
				.attr('id', "n-k-block"+$(".n-k-blocks").length)
				.css({width:"50px",
					background: "#3C3F45",
					color: "white",
					'margin-top': "19px"})
				.attr('placeholder',"Блок "+$(".n-k-blocks").length)
				.addClass("n-k-blocks dynamic");	
		}
		$('<a id="run" class="button button-large dynamic">Предпросмотр</a>')
			.appendTo('#buttons');
	}	
	function fillTeamList(teamsJson){
		$('#team-list > div').remove();
		teamsJson.team.forEach(function(item, i){
            if(item == null){
             //  teamsJson.team.splice(i, 1);
            }else{
                var newDiv =
                    $('<div class="alert alert-standard fade in">').appendTo($('#team-list'))
                        .html(item.name + " " + item.date)
                        .attr("data-name", item.name)
                        .attr("data-date", item.date);
                $('<a class="close" data-dismiss="alert" href="#">&times;</a>').appendTo(newDiv);
            }
		});
	}
	function markSelectedTeams(selectedTeamsJson){
		$('#team-list .alert').each(function(el){
			var obj = {};
			obj["name"] = $(this).attr("data-name");
			obj["date"] = $(this).attr("data-date");
			var self = this;
			$.each(selectedTeamsJson.team, function(idx, data) { 
			   if (JSON.stringify(data) ==  JSON.stringify(obj)) {
				  $(self)
					.removeClass('alert-standard')
					.addClass('alert-error');
				  return;
			   }
			});			
		});
	}
	function markDoneTicket(num, err, inf){
		var ticketDiv = $('#steps-area').find('.row[data-ticket-num = ' + num +']');
		if(err){
			ticketDiv.clone().appendTo('#error-area .accordion-inner').find('.alert').html("Билет №" + parseInt(num+1) + ":</br>" + inf);
			ticketDiv.find('.alert').attr('class', 'alert fade in');
			$('#error-area').prev().find('a.accordion-toggle').html('Ошибки (' + $('#error-area .accordion-inner > div.row').length + ')');
			$('#rebet-but').html('Повторить непоставленные (' +  $('#error-area .accordion-inner > div.row').length + ')');
		}else{
			ticketDiv.appendTo('#done-area .accordion-inner');
			$('#done-area').prev().find('a.accordion-toggle').html('Готово (' + $('#done-area .accordion-inner > div.row').length + ')');
			$('#steps-area').find('.row[data-ticket-num = ' + num +']').remove();
			$('#error-area').find('.row[data-ticket-num = ' + num +']').remove();
			$('#error-area').prev().find('a.accordion-toggle').html('Ошибки (' + $('#error-area .accordion-inner > div.row').length + ')');
			$('#rebet-but').html('Повторить непоставленные (' +  $('#error-area .accordion-inner > div.row').length + ')');
		}
		$('#steps-area').prev().find('a.accordion-toggle').html('Билеты (' + $('#steps-area .accordion-inner > div.row').length + ')');
	}
	function cBlocksBin(n, k, filterK, filterN_K){
		var n_kSet = block(invert(c_n_k(n, k)), filterN_K, n),
			kSet = block(c_n_k(n, k), filterK, n),
			resultSet = new Array,
			itr = 0;	
		for(var i = 0; i < kSet.length; i++){
			for(var j = 0; j < n_kSet.length; j++){
				var stuck = true;
				for(var k = 0; k < n_-k_; k++)					
					if(kSet[i].indexOf(n_kSet[j][k]) != -1){
						stuck = false;
						break;
					}
				if(stuck){
					resultSet[itr] = new Array;
					kSet[i].forEach(function(item){
						resultSet[itr][item] = 1;
					});
					n_kSet[j].forEach(function(item){
						resultSet[itr][item] = 0;
					});	
					itr++
				}
			}
		}
		return resultSet;
	}		
	function popBloks(arr ,v){
		for(var i = 0; i < arr.length; i++)
			for(var j = 0; j < arr[i].length -1; j++){
				if(v == 1)
					if(arr[i][j] == 1 && arr[i][j+1] == 1){
						arr.splice(i,1);
						i--;
						break;
					}
				if(v == 0)
					if(arr[i][j] == 0 && arr[i][j+1] == 0){
						arr.splice(i,1);
						i--;
						break;
					}
				if(v == 10)
					if(arr[i][j] == arr[i][j+1]){
						arr.splice(i,1);	
						i--;
						break;
					}
			}
	}
	function print2DemArr(arr){
		$('.stp').remove();
		ticketsJson = {"ticket":[]};
		var newEl = $('<div class="span24 cont stp"></div>').appendTo('#res-col-1');
		newEl = $('<div class="accordion-group stp"></div>').appendTo(newEl);
		var innner = $('<div class="accordion-body collapse stp"></div>').appendTo(newEl)
			.attr('id', 'steps-area');
		innner = $('<div class="accordion-inner stp"></div>').appendTo(innner)
		newEl = $('<div class="accordion-heading accordionize stp"></div>').prependTo(newEl);
		newEl = $('<a class="accordion-toggle stp" data-toggle="collapse" data-parent="#accordionArea"></a>')
			.appendTo(newEl)
			.text('Билеты (' + arr.length + ')')
			.attr('href', '#steps-area' );
		
		var newEl2 = $('<div class="span24 cont stp"></div>').appendTo('#res-col-1');
		newEl2 = $('<div class="accordion-group stp"></div>').appendTo(newEl2);
		var innner2 = $('<div class="accordion-body collapse stp"></div>').appendTo(newEl2)
			.attr('id', 'done-area');
		innner2 = $('<div class="accordion-inner stp"></div>').appendTo(innner2)
		newEl2 = $('<div class="accordion-heading accordionize stp"></div>').prependTo(newEl2);
		newEl2 = $('<a class="accordion-toggle stp" data-toggle="collapse" data-parent="#accordionArea"></a>')
			.appendTo(newEl2)
			.text('Готово (0)')
			.attr('href', '#done-area' );
		
		var newEl2 = $('<div class="span24 cont stp"></div>').appendTo('#res-col-1');
		newEl2 = $('<div class="accordion-group stp"></div>').appendTo(newEl2);
		var innner2 = $('<div class="accordion-body collapse stp"></div>').appendTo(newEl2)
			.attr('id', 'error-area');
		innner2 = $('<div class="accordion-inner stp"></div>').appendTo(innner2)
		newEl2 = $('<div class="accordion-heading accordionize stp"></div>').prependTo(newEl2);
		newEl2 = $('<a class="accordion-toggle stp" data-toggle="collapse" data-parent="#accordionArea"></a>')
			.appendTo(newEl2)
			.text('Ошибки (0)')
			.attr('href', '#error-area' );
		
		$('<a id="start-but" class="button button-large dynamic stp">Старт</a>')
			.appendTo('#buttons');
		$('<a id="pause-but" class="button button-large dynamic stp">Пауза</a>')
			.appendTo('#buttons');
		$('<a id="stop-but" class="button button-large dynamic stp">Стоп</a>')
			.appendTo('#buttons');
		$('<a id="rebet-but" class="button button-large dynamic stp">Повторить непоставленные (0)</a>')
			.appendTo('#buttons');
		var tCont = "";
		for(var i = 0; i < arr.length; i++){	
			var newEl = $('<div class="row cont stp">').appendTo('#steps-area .accordion-inner')
				.attr('data-ticket-num', i);
			var newDiv = (i%2 == 0) ?
			$('<div class="alert alert-error fade in span24 stp">').appendTo(newEl) :
			$('<div class="alert alert-info fade in span24 stp">').appendTo(newEl);
			tCont = "Билет №" + parseInt(i+1) + "</br>";
			ticketsJson.ticket[i] = [];
			for(var j = 0; j < arr[i].length; j++){
				var prName = selectedTeamsJson.team[j].name + " " + selectedTeamsJson.team[j].date;
				tCont += (arr[i][j] == 1) ? (prName + "	+" + "</br>") : (prName + "	-" + "</br>");
				var obj = {};
				obj['name'] =  selectedTeamsJson.team[j].name;	
				obj['date'] =  selectedTeamsJson.team[j].date;		
				obj['bet'] =  arr[i][j];	
				ticketsJson.ticket[i][j] = obj;
			}				
			newDiv.html(tCont);				
		}
		localStorage.setItem('tickets', JSON.stringify(ticketsJson));
	}	
});