jQuery.noConflict();                               
jQuery(document).ready(function ($) {

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
	
	function make(arr, el) {
	  var i, i_m, item;
	  var len = arr.length;
	  var res = [];
	  for(i = len; i >= 0; i--) {
		res.push(
		  ([]).concat(
			arr.slice(0, i),
			[el],
			arr.slice(i, i_m)
		  )
		);
	  }
	  return res;
	}

	function combinations(arr) {
	  var prev, curr, el, i;
	  var len = arr.length;
	  curr = [[arr[0]]];
	  for(i = 1; i < len; i++) {
		el = arr[i];
		prev = curr;
		curr = [];
		prev.forEach(function(item) {
		  curr = curr.concat(
			make(item, el)
		  );
		});
	  }
	  return curr;
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
		if(!filter.length)
			return input;
		var k = input[0].length,
			output = new Array,
			z = 0;
		if(sumOfMas(filter) > k)
			return input;
		filter = filter.map(function(ind, el){ if(el-1>0) return el-1;});
		if(!filter.length)
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
	
	var filter = new Array;
	filter[0] = new Array; //k block
	filter[1] = new Array; //n-k block
	
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
		$(document).on('input', ".k-blocks", function(){ 
			filter[0] = $('.k-blocks').map(function(idx, elem) {
					return parseFloat($(elem).val());				 
				});
			if($(".k-blocks").last().val() < 2){
				$(".k-blocks").last().val('');
				return false;
			}
			if($(".k-blocks").last().val() && sumOfMas(filter[0]) < k){		
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
			filter[1] = $('.n-k-blocks').map(function(idx, elem) {
					return parseFloat($(elem).val());				 
				});
			if($(".n-k-blocks").last().val() < 2){
				$(".n-k-blocks").last().val('');
				return false;
			}
			if($(".n-k-blocks").last().val() && sumOfMas(filter[1]) < n-k){	
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
		$('<a id="run" class="button button-large dynamic">RUN</a>')
			.appendTo('#n-k-params-div');
	}	
	
	function fillTeamList(teamsJson){
		$('#team-list > div').remove();
		teamsJson.name.forEach(function(item, i){
			var newDiv =
				$('<div class="alert alert-standard fade in">').appendTo($('#team-list'))
					.html(item);
			$('<a class="close" data-dismiss="alert" href="#">&times;</a>').appendTo(newDiv);
		});
	}
	function markSelectedTeams(selectedTeamsJson){
		$('#team-list .alert').each(function(el){
			if (selectedTeamsJson.name.indexOf($(this).text().slice(0,-1)) != -1)
				$(this)
					.removeClass('alert-standard')
					.addClass('alert-error');
		});
	}
	var n_,
		k_,
		n_k_,
		teamsJson,
		selectedTeamsJson;
		
		if(localStorage['teams']){
			teamsJson =  JSON.parse(localStorage.getItem('teams'));
			fillTeamList(teamsJson);
		}else
			teamsJson = {"name": []};
		
		if(localStorage['selectedTeams']){
			selectedTeamsJson =  JSON.parse(localStorage.getItem('selectedTeams'));
			markSelectedTeams(selectedTeamsJson);
			n_ = selectedTeamsJson.name.length;
			if(n_!=0)
				$('#n').val(n_);
		}else
			selectedTeamsJson = {"name": []};
	$(".n-k-params").on('input', function(){ 		
		$('.dynamic').remove();
		$(this).each(function(){
			if($(this).val().length){
				if($('#n').val() && $('#k').val())
					$('#n-k').val(parseInt($('#n').val()) - parseInt($('#k').val()));
				if($('#n-k').val() && $('#k').val())
					$('#n').val(parseInt($('#n-k').val()) + parseInt($('#k').val()));
				if($('#n').val() && $('#n-k').val())
					$('#k').val(parseInt($('#n').val()) - parseInt($('#n-k').val()));
				n_ = parseInt($('#n').val());
				k_ = parseInt($('#k').val());
				n_k_ = parseInt($('#n-k').val());
				if(!isNaN(n_) && !isNaN(k_) && n>=k)
					inputsForBlocks(n_,k_);
			}
		});
		
		function cBlocksBin(n, k, filterK, filterN_K){
			var kSet = block(c_n_k(n, k), filterK, n),
				n_kSet = block(invert(c_n_k(n, k)), filterN_K, n),
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
			$('#res-col-1 .alert').remove();
			var tCont = "";
			$('<div class="alert alert-info fade in">').appendTo($('#res-col-1'))
				.text("ВСЕГО: " + arr.length);
			for(var i = 0; i < arr.length; i++){				
				var newDiv = (i%2 == 0) ?
				$('<div class="alert alert-error fade in">').appendTo($('#res-col-1')) :
				$('<div class="alert alert-info fade in">').appendTo($('#res-col-1'));
				tCont = "Билет №" + parseInt(i+1) + "</br>";
				for(var j = 0; j < arr[i].length; j++){
					if(!selectedTeamsJson.name[j])
						selectedTeamsJson.name[j] = j+1;
					tCont += (arr[i][j] == 1) ? (selectedTeamsJson.name[j] + "	+" + "</br>") : (selectedTeamsJson.name[j] + "	-" + "</br>");
				}
				newDiv.html(tCont);
			}
		}
		
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
	});
	
	//ADD team
	$(document).on('click', "#add-team", function(){
		if($('#team-name').val()){
			teamsJson.name.push($('#team-name').val());
			$('#team-name').val('');
			localStorage.setItem('teams', JSON.stringify(teamsJson));
		}
		fillTeamList(teamsJson);
		markSelectedTeams(selectedTeamsJson);
	});	
	$(document).keyup(function(event){
		if(event.keyCode == 13){				
			event.preventDefault();
			$("#add-team").click();
		}
	});
	//remove team from team-list
	$('#team-list').on('click', '.close', function(){
		var v = $(this).parent('div.alert').text().slice(0,-1);
		teamsJson.name.splice(teamsJson.name.indexOf(v),1);
		localStorage.setItem('teams', JSON.stringify(teamsJson));	
		if($(this).parent('div.alert').hasClass("alert-error")){
			selectedTeamsJson.name.splice(selectedTeamsJson.name.indexOf(v),1);
			localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));	
			n_ = selectedTeamsJson.name.length;			
			$('#n').val(n_>0?n_:"");
		}
	});
	//use team from team list
	$('#team-list').on('click', 'div.alert', function(e){
		if(e.target == this){
			if($(this).hasClass('alert-standard')){
				selectedTeamsJson.name.push($(this).text().slice(0, -1));
				localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
				$(this)
					.removeClass('alert-standard')
					.addClass('alert-error');
			}else{
				selectedTeamsJson.name.splice(selectedTeamsJson.name.indexOf($(this).text().slice(0,-1)),1);
				localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
				$(this)
					.removeClass('alert-error')
					.addClass('alert-standard');
			}
			n_ = selectedTeamsJson.name.length;			
			$('#n').val(n_>0?n_:"");
		}
	});
});