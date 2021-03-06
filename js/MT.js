$(function () {
    var n_,
        k_ = $('#k').val(),
        n_k_,
        teamsJson,
        varTicketsRes = [],
        selectedTeamsJson,
        csId = localStorage.getItem('contentId') ? JSON.parse(localStorage.getItem('contentId')) : {},
        ticketsJson = { "ticket": [] },
        errorInfoJson = localStorage.getItem('errorInfo') ? JSON.parse(localStorage.getItem('errorInfo')) : { "error": [] },
        errorTicketsJson = localStorage.getItem('errorTickets') ? JSON.parse(localStorage.getItem('errorTickets')) : { "ticket": [] },
        pauseFl = true,
        sendRefreshTimer,
        coeffLeft = localStorage.getItem('coeffLeft') ? JSON.parse(localStorage.getItem('coeffLeft')) : 50,
        coeffRight = localStorage.getItem('coeffRight') ? JSON.parse(localStorage.getItem('coeffRight')) : 200,
        coeffLeftTB = localStorage.getItem('coeffLeftTB') ? JSON.parse(localStorage.getItem('coeffLeftTB')) : 0,
        coeffRightTB = localStorage.getItem('coeffRightTB') ? JSON.parse(localStorage.getItem('coeffRightTB')) : 20,
        coeffLeftTM = localStorage.getItem('coeffLeftTM') ? JSON.parse(localStorage.getItem('coeffLeftTM')) : 0,
        coeffRightTM = localStorage.getItem('coeffRightTM') ? JSON.parse(localStorage.getItem('coeffRightTM')) : 20,
        coeffTB = localStorage.getItem('coeffTB') ? JSON.parse(localStorage.getItem('coeffTB')) : 2,
        coeffTM = localStorage.getItem('coeffTM') ? JSON.parse(localStorage.getItem('coeffTM')) : 2,
        coeffMax = localStorage.getItem('coeffMax') ? JSON.parse(localStorage.getItem('coeffMax')) : 500,
        filter = [],
        kostil = false,
        selectedContainer = '';
    filter[0] = []; //k block
    filter[1] = []; //n-k blocksock;
    _countries = {};
    Array.prototype.inArray = function (comparer) {
        for (var i = 0; i < this.length; i++) {
            if (comparer(this[i])) return true;
        }
        return false;
    };

    Array.prototype.pushIfNotExist = function (element, comparer) {
        if (!this.inArray(comparer)) {
            this.push(element);
        }
    };
    if (localStorage['teams']) {
        teamsJson = JSON.parse(localStorage.getItem('teams'));
        fillTeamList(teamsJson);
    } else
        teamsJson = { "team": [] };
    if (localStorage['selectedTeams']) {
        selectedTeamsJson = JSON.parse(localStorage.getItem('selectedTeams'));
        markSelectedTeams(selectedTeamsJson);
        showSelectedTeamsList();
        showBlocksByCountry();
        n_ = selectedTeamsJson.team.length;
        $('#n').val(n_ > 0 ? n_ : "");
    } else {
        selectedTeamsJson = { "team": [] };
    }

    rebuidCoeff('total-coeff', coeffLeft, coeffRight, coeffMax);
    rebuidSlider('blocks-slider', 'small', 'span', 0, 0, parseInt(selectedTeamsJson.team.length / 2), parseInt(selectedTeamsJson.team.length / 2));
    if (n_) {
        rebuidSlider('vars-slider', 'small', 'input', 1, 1, math.combinations(n_, k_ ? k_ : parseInt(n_ / 2)), math.combinations(n_, k_ ? k_ : parseInt(n_ / 2)));
        rebuidSlider('incountry-slider', 'small', 'input', 1, 1, 10, 10);
        rebuidSlider('plus-slider', 'xsmall', 'span', 0, 0, n_, n_);
    } else {
        rebuidSlider('vars-slider', 'small', 'input', 0, 0, 0, 0);
        rebuidSlider('incountry-slider', 'small', 'input', 0, 0, 0, 0);
        rebuidSlider('plus-slider', 'xsmall', 'span', 0, 0, 0, 0);
    }

    $('#plus-coeff-value').nstSlider({
        "left_grip_selector": "#plus-coeff-value-leftGrip",
        "value_bar_selector": "#plus-coeff-value-bar",
        "value_changed_callback": function (cause, leftValue, rightValue) {
            var $container = $(this).parent(),
                g = 255 - 127 + leftValue * 30,
                r = 255 - g,
                b = 0;
            $container.find('#plus-coeff-value-leftLabel').text(leftValue);
            $('#plus-coeff-value-bar').css('background', 'rgb(' + [r, g, b].join(',') + ')');
            coeffTB = leftValue;
            localStorage.setItem('coeffTB', coeffTB);
        }
    });

    $('#minus-coeff-value').nstSlider({
        "left_grip_selector": "#minus-coeff-value-leftGrip",
        "value_bar_selector": "#minus-coeff-value-bar",
        "value_changed_callback": function (cause, leftValue, rightValue) {
            var $container = $(this).parent(),
                g = 255 - 127 + leftValue * 30,
                r = 255 - g,
                b = 0;
            $container.find('#minus-coeff-value-leftLabel').text(leftValue);
            $('#minus-coeff-value-bar').css('background', 'rgb(' + [r, g, b].join(',') + ')');
            coeffTM = leftValue;
            localStorage.setItem('coeffTM', coeffTM);
        }
    });

    $('#plus-coeff-slider').nstSlider({
        "crossable_handles": false,
        "left_grip_selector": "#plus-coeff-leftGrip",
        "right_grip_selector": "#plus-coeff-rightGrip",
        "value_bar_selector": "#plus-coeff-bar",
        "value_changed_callback": function (cause, leftValue, rightValue, prevLeft, prevRight) {
            coeffLeftTB = leftValue;
            coeffRightTB = rightValue;

            localStorage.setItem('coeffLeftTB', coeffLeftTB);
            localStorage.setItem('coeffRightTB', coeffRightTB);
            $('#plus-coeff-slider-leftLabel').text(leftValue);
            $('#plus-coeff-slider-rightLabel').text(rightValue);
        }
    });

    $('#minus-coeff-slider').nstSlider({
        "crossable_handles": false,
        "left_grip_selector": "#minus-coeff-leftGrip",
        "right_grip_selector": "#minus-coeff-rightGrip",
        "value_bar_selector": "#minus-coeff-bar",
        "value_changed_callback": function (cause, leftValue, rightValue, prevLeft, prevRight) {
            coeffLeftTM = leftValue;
            coeffRightTM = rightValue;

            localStorage.setItem('coeffLeftTM', coeffLeftTM);
            localStorage.setItem('coeffRightTM', coeffRightTM);
            $('#minus-coeff-slider-leftLabel').text(leftValue);
            $('#minus-coeff-slider-rightLabel').text(rightValue);
        }
    });


    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.askFor == "contentScriptId") {
                csId.id = parseInt(sender.tab.id);
                localStorage.setItem('contentId', JSON.stringify(csId));
            }
        });
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.askFor == "ticketDone") {
                csId.id = parseInt(sender.tab.id);
                localStorage.setItem('contentId', JSON.stringify(csId));
                var tNum = parseInt(request.ticketNum);
                markDoneTicket(tNum, false, '');
            }
        });
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.askFor == "ticketError") {
                csId.id = parseInt(sender.tab.id);
                localStorage.setItem('contentId', JSON.stringify(csId));
                errorInfoJson.error.push(JSON.parse(request.errorInfo));
                localStorage.setItem('errorInfo', JSON.stringify(errorInfoJson));
                var tNum = parseInt(errorInfoJson.error[errorInfoJson.error.length - 1].ticketNum);
                var inf = errorInfoJson.error[errorInfoJson.error.length - 1].info;
                errorTicketsJson.ticket.push(ticketsJson.ticket[tNum]);
                localStorage.setItem('errorTickets', JSON.stringify(errorTicketsJson));
                markDoneTicket(tNum, true, inf);
            }
        });
    $('#get-teams').on('click', function () {
        chrome.tabs.sendMessage(csId.id, { 'askFor': 'getTeams' }, function (response) {
            teamsJson = JSON.parse(response.teams);
            localStorage.setItem('teams', JSON.stringify(teamsJson));
            fillTeamList(teamsJson);
            selectedTeamsJson = { "team": [] };
            ticketsJson = { "ticket": [] };
            errorInfoJson = { "error": [] };
            errorTicketsJson = { "ticket": [] };
            localStorage.setItem('tickets', JSON.stringify(ticketsJson));
            localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
            n_ = selectedTeamsJson.team.length;
            rebuidSlider('vars-slider', 'small', 'input', 1, 1, math.combinations(n_, k_ ? k_ : parseInt(n_ / 2)), math.combinations(n_, k_ ? k_ : parseInt(n_ / 2)));
            rebuidSlider('plus-slider', 'xsmall', 'span', 0, 0, n_, n_);
            $('#n').val(n_ > 0 ? n_ : "");
            showSelectedTeamsList();
            showBlocksByCountry();
            //rebuidSlider('blocks-slider', 0, selectedTeamsJson.team.length, selectedTeamsJson.team.length);
        });
    });
    $('#clear').on('click', function () {
        $('#team-list > div').remove();
        $('input').val("");
        teamsJson = { "team": [] };
        selectedTeamsJson = { "team": [] };
        ticketsJson = { "ticket": [] };
        errorInfoJson = { "error": [] };
        errorTicketsJson = { "ticket": [] };
        localStorage.setItem('teams', JSON.stringify(teamsJson));
        localStorage.setItem('tickets', JSON.stringify(ticketsJson));
        localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
        n_ = 0;
        clearInterval(sendRefreshTimer);
        pauseFl = true;
        chrome.tabs.sendMessage(csId.id, { 'askFor': 'stop' });
        showSelectedTeamsList();
        showBlocksByCountry();
    });
    $('#auto').on('click', function () {
        if ($(this).data('state') === 'manual') {
            $(this).data('state', 'auto');
            $(this).css({ 'background-color': '#DE5E60' });
            $('#refreshTime').attr('readonly', false);
            $('#refreshTime').val(300);
            if (!pauseFl) {
                chrome.tabs.sendMessage(csId.id, { 'askFor': 'refresh', 'betTime': parseInt($('#betTime').val() * 1000), 'markTime': parseInt($('#markTime').val()), 'auto': 'auto' });
                clearInterval(sendRefreshTimer);
                sendRefreshTimer = setInterval(function () {
                    chrome.tabs.sendMessage(csId.id, { 'askFor': 'refresh', 'betTime': parseInt($('#betTime').val() * 1000), 'markTime': parseInt($('#markTime').val()), 'auto': 'auto' });
                }, parseInt($('#refreshTime').val() * 1000));
            }
        } else if ($(this).data('state') === 'auto') {
            $(this).data('state', 'manual');
            $(this).css({ 'background-color': '#3C3F45' });
            $('#refreshTime').attr('readonly', true);
            if (!pauseFl) {
                clearInterval(sendRefreshTimer);
                chrome.tabs.sendMessage(csId.id, { 'askFor': 'refresh', 'betTime': parseInt($('#betTime').val() * 1000), 'markTime': parseInt($('#markTime').val()), 'auto': 'manual' });
            }
        }
    });
    $('#marathon-vijet').on('click', function () {
        chrome.tabs.sendMessage(csId.id, { 'askFor': 'vijet' });
    });

    $(document).on('input', ".k-blocks", function () {
        filter[0] = [];
        $('.k-blocks').each(function () {
            if ($(this).val().length)
                filter[0].push(parseInt($(this).val()));
        });
        if ($(".k-blocks").last().val() < 2) {
            $(".k-blocks").last().val('');
            return false;
        }
        if ($(".k-blocks").last().val() && sumOfMas(filter[0]) < k_) {
            let newInp = $('<input type="number"  min="2"></input>').appendTo('#k-blocks-div')
                .attr('id', "k-block" + $(".k-blocks").length)
                .css({
                    width: "50px",
                    background: "#3C3F45",
                    color: "white"
                })
                .attr('placeholder', "Блок " + parseInt($(".k-blocks").length + 1))
                .addClass("k-blocks dynamic dynamic-k");
            let snippBtns = $('<div class="quantity-nav"><div class="quantity-button quantity-up">&uarr;</div><div class="quantity-button quantity-down">&darr;</div></div>')
                .insertAfter(newInp);
            refreshInputs(newInp);
        } else {
            $('.k-blocks').filter(function () { return !this.value; }).remove();
        }
    });
    $(document).on('input', ".n-k-blocks", function () {
        filter[1] = [];
        $('.n-k-blocks').each(function () {
            if ($(this).val().length != 0)
                filter[1].push(parseInt($(this).val()));
        });
        if ($(".n-k-blocks").last().val() < 2) {
            $(".n-k-blocks").last().val('');
            return false;
        }
        if ($(".n-k-blocks").last().val() && sumOfMas(filter[1]) < n_k_) {
            let newInp = $('<input type="number"  min="2"></input>').appendTo('#n-k-blocks-div')
                .attr('id', "n-k-block" + $(".n-k-blocks").length)
                .css({
                    width: "50px",
                    background: "#3C3F45",
                    color: "white"
                })
                .attr('placeholder', "Блок " + parseInt($(".n-k-blocks").length + 1))
                .addClass("n-k-blocks dynamic dynamic-n-k");
            let snippBtns = $('<div class="quantity-nav"><div class="quantity-button quantity-up">&uarr;</div><div class="quantity-button quantity-down">&darr;</div></div>')
                .insertAfter(newInp);

            refreshInputs(newInp);
        } else {
            $('.n-k-blocks').filter(function () { return !this.value; }).remove();
        }
    });
    $('#clean-marked').on('click', function () {
        selectedTeamsJson = { "team": [] };
        localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
        _countries = {};
        for (var t = 0; t < teamsJson['team'].length; t++) {
            teamsJson['team'][t].country = "";
        }
        localStorage.setItem('teams', JSON.stringify(teamsJson));
        fillTeamList(teamsJson);
        markSelectedTeams(selectedTeamsJson);
        showSelectedTeamsList();
        showBlocksByCountry();
        n_ = selectedTeamsJson.team.length;
        $('#n').val(n_ > 0 ? n_ : "");
    });

    $(".n-k-params").on('input', function () {
        $('.dynamic').remove();
        $('#plus-slider-check').prop('checked', false);
        $(this).each(function () {
            if ($(this).val().length != 0) {
                if ($(this).attr('id') == 'k') {
                    k_ = parseInt($(this).val());
                    n_k_ = n_ - k_;
                    $('#n-k').val(n_k_);
                }
                if ($(this).attr('id') == 'n-k') {
                    n_k_ = parseInt($(this).val());
                    k_ = n_ - n_k_;
                    $('#k').val(k_);
                }
                if (!isNaN(n_) && !isNaN(k_) && n >= k)
                    inputsForBlocks(n_, k_);
            }
        });
    });

    // $('#coeffSlider').nstSlider('set_position', coeffLeft, coeffRight);
    $('#total-coeff-coeff-check').prop('checked', false);
    $(document).on('click', '#plus-coeff-slider, #plus-coeff-value', (e) => {
        $('#plus-coeff-slider-check').prop('checked', true);
    });
    $(document).on('click', '#minus-coeff-slider, #minus-coeff-value', (e) => {
        $('#minus-coeff-slider-check').prop('checked', true);
    });
    $(document).on('input', '#total-coeff-RightInput', (e) => {
        $('#total-coeff-coeff-check').prop('checked', true);
        let inpMax = parseInt($('#total-coeff').attr('data-range_max'));
        let inpVal = parseInt($('#total-coeff-RightInput').val());
        if (inpVal > inpMax) {
            coeffMax = parseInt(inpVal + inpVal * 0.3);
            localStorage.setItem('coeffMax', coeffMax);
            rebuidCoeff('total-coeff', coeffLeft, inpVal, coeffMax);
        }
        if (inpVal < inpMax * 0.7) {
            coeffMax = parseInt(inpVal + inpVal * 0.3);
            localStorage.setItem('coeffMax', coeffMax);
            rebuidCoeff('total-coeff', coeffLeft, inpVal, coeffMax);
        }
    });
    $('#total-coeff-LeftInput').on('input', (e) => {
        let inpVal = $('#total-coeff-LeftInput').val();
        $('#total-coeff').nstSlider('set_position', inpVal, coeffRight);
    });
    //START
    $(document).on('click', "#start-but", function () {
        var tmpObj = {};
        tmpObj['date'] = new Date;
        tmpObj['selectedTeams'] = selectedTeamsJson;
        tmpObj['plus'] = k_;
        tmpObj['minus'] = n_k_;
        tmpObj['plusBlocks'] = filter[0];
        tmpObj['minusBlocks'] = filter[1];
        tmpObj['plusWithoutBloks'] = $('#k-check').prop("checked");
        tmpObj['minusWithoutBloks'] = $('#n-k-check').prop("checked");
        tmpObj['onlySelectedPlus'] = $('#anti-block-plus-check').prop("checked");
        tmpObj['onlySelectedMinus'] = $('#anti-block-minus-check').prop("checked");
        tmpObj['coast'] = parseInt($('#coast').val());
        tmpObj['auto'] = $('#auto').data('state');
        tmpObj['inCountriesBlocks'] = Object.assign({}, _countries);
        tmpObj['who'] = 'mt ';

        chrome.tabs.sendMessage(csId.id, { 'askFor': 'tickets', 'tickets': JSON.stringify(localStorage.getItem('tickets')), 'params': JSON.stringify(tmpObj), 'coast': parseInt($('#coast').val()), 'betTime': parseInt($('#betTime').val() * 1000), 'markTime': parseInt($('#markTime').val()), 'auto': $('#auto').data('state') });
        //localStorage.setItem('tickets', JSON.stringify(ticketsJson));
        clearInterval(sendRefreshTimer);
        if ($('#auto').data('state') === 'auto') {
            clearInterval(sendRefreshTimer);
            sendRefreshTimer = setInterval(function () {
                chrome.tabs.sendMessage(csId.id, { 'askFor': 'refresh', 'betTime': parseInt($('#betTime').val() * 1000), 'markTime': parseInt($('#markTime').val()), 'auto': $('#auto').data('state') });
            }, parseInt($('#refreshTime').val() * 1000));
        }
        pauseFl = false
        localStorage.removeItem('errorInfo');
        errorInfoJson = { "error": [] };
        localStorage.removeItem('errorTickets');
        errorTicketsJson = { "ticket": [] };
    });
    //PAUSE
    $(document).on('click', "#pause-but", function () {
        if (!pauseFl) {
            chrome.tabs.sendMessage(csId.id, { 'askFor': 'pause' });
            clearInterval(sendRefreshTimer);
            pauseFl = true;
            $(this).html('ПРОДОЛЖИТЬ');
        }
        else {
            chrome.tabs.sendMessage(csId.id, { 'askFor': 'resume' });
            clearInterval(sendRefreshTimer);
            sendRefreshTimer = setInterval(function () {
                chrome.tabs.sendMessage(csId.id, { 'askFor': 'refresh', 'betTime': parseInt($('#betTime').val() * 1000), 'markTime': parseInt($('#markTime').val()), 'auto': $('#auto').data('state') });
            }, parseInt($('#refreshTime').val() * 1000));
            pauseFl = false;
            $(this).html('ПАУЗА');
        }
    });
    //STOP
    $(document).on('click', "#stop-but", function () {
        chrome.tabs.sendMessage(csId.id, { 'askFor': 'stop' });
        clearInterval(sendRefreshTimer);
        pauseFl = true;
    });
    //REBET
    $(document).on('click', "#rebet-but", function () {
        chrome.tabs.sendMessage(csId.id, { 'askFor': 'tickets', 'tickets': JSON.stringify(errorTicketsJson), 'coast': parseInt($('#coast').val()), 'betTime': parseInt($('#betTime').val() * 1000), 'markTime': parseInt($('#markTime').val()) });
        clearInterval(sendRefreshTimer);
        sendRefreshTimer = setInterval(function () {
            chrome.tabs.sendMessage(csId.id, { 'askFor': 'refresh', 'betTime': parseInt($('#betTime').val() * 1000), 'markTime': parseInt($('#markTime').val()), 'auto': $('#auto').data('state') });
        }, parseInt($('#refreshTime').val() * 1000));
        pauseFl = false
        localStorage.removeItem('errorInfo');
        errorInfoJson = { "error": [] };
        localStorage.removeItem('errorTickets');
        errorTicketsJson = { "ticket": [] };
        $('#error-area div.row').remove();
        $('#error-area').prev().find('a.accordion-toggle').html('Ошибки (' + $('#error-area .accordion-inner > div.row').length + ')');
        $('#rebet-but').html('Повторить непоставленные (' + $('#error-area .accordion-inner > div.row').length + ')');
    });
    //RUN
    $(document).on('click', "#run", function () {
        if (sumOfMas(filter[0]) > k_) {
            filter[0] = filter[0].slice(0, -1);
        }
        if (sumOfMas(filter[1]) > n_ - k_) {
            filter[1] = filter[1].slice(0, -1);
        }

        let fromPlus = k_;
        let toPlus = k_;
        if ($('#plus-slider-check').prop("checked")) {
            fromPlus = parseInt($('#plus-slider-leftLabel').text());
            toPlus = parseInt($('#plus-slider-rightLabel').text());
        }
        let res = [];
        for (let i = fromPlus; i <= toPlus; i++) {
            res.push(cBlocksBin(n_, i, filter[0], filter[1], $('#anti-block-minus-check').prop("checked"), $('#anti-block-plus-check').prop("checked")));
        }
        if ($('#k-check').prop("checked") && $('#n-k-check').prop("checked")) {
            // res = cBlocksBin(n_, k_, [], [], $('#anti-block-minus-check').prop("checked"), $('#anti-block-plus-check').prop("checked"));
            for (let i of res) {
                popBloks(i.tickets, 10);
            }
        } else {
            if ($('#k-check').prop("checked")) {
                // res = cBlocksBin(n_, k_, [], filter[1], $('#anti-block-minus-check').prop("checked"), $('#anti-block-plus-check').prop("checked"));
                for (let i of res) {
                    popBloks(i.tickets, 1);
                }
            }
            if ($('#n-k-check').prop("checked")) {
                // res = cBlocksBin(n_, k_, filter[0], [], $('#anti-block-minus-check').prop("checked"), $('#anti-block-plus-check').prop("checked"));
                for (let i of res) {
                    popBloks(i.tickets, 0);
                }
            }
        }
        if (!$.isEmptyObject(_countries) && ($('#inner-blocks-check')[0].checked || $('#incountry-slider-check')[0].checked)) {
            let leftInCoutry, rightInCountry;
            let checkAllInCoutry = $('#incountry-slider-check')[0].checked;
            if (checkAllInCoutry) {
                leftInCoutry = parseInt($('#incountry-slider-leftLabel').val());
                rightInCountry = parseInt($('#incountry-slider-rightLabel').val());
            }
            let tmpRes = [];
            for (let ticketObj of res) {
                let tmpSize = tmpRes.length;
                let tmpTicket = popInCountries(ticketObj.tickets, checkAllInCoutry, leftInCoutry, rightInCountry);
                tmpRes.pushIfNotExist(tmpTicket, (e) => {
                    for (let arr of e) {
                        for (let tArr of tmpTicket) {
                            if (isEqualArrays(arr, tArr)) return true;
                        }
                    }
                });
                if (tmpRes.length == tmpSize) {
                    ticketObj.tickets = [];
                    continue;
                } else {
                    ticketObj.tickets = tmpTicket;
                }
            }
        }

        // if (!$.isEmptyObject(_countries) && ($('#inner-blocks-check')[0].checked || $('#incountry-slider-check')[0].checked)) {
        // 	let leftInCoutry, rightInCountry;
        // 	let checkAllInCoutry = $('#incountry-slider-check')[0].checked;
        // 	if (checkAllInCoutry) {
        // 		leftInCoutry = parseInt($('#incountry-slider-leftLabel').val());
        // 		rightInCountry = parseInt($('#incountry-slider-rightLabel').val());
        // 	}
        // 	let tmpRes = [];
        // 	for (let ticketObj of varTicketsRes) {
        // 		let tmpSize = tmpRes.length;
        // 		let tmpTicket = popInCountries(ticketObj.tickets, checkAllInCoutry, leftInCoutry, rightInCountry);
        // 		tmpRes.pushIfNotExist(tmpTicket, (e) => {
        // 			for (let arr of e) {
        // 				for (let tArr of tmpTicket) {
        // 					if (isEqualArrays(arr, tArr)) return true;
        // 				}
        // 			}
        // 		});
        // 		if (tmpRes.length == tmpSize) {
        // 			ticketObj.tickets = [];
        // 			continue;
        // 		} else {
        // 			ticketObj.tickets = tmpTicket;
        // 		}
        // 	}
        // }

        if ($('#blocks-slider-check').prop('checked')) {
            for (let i of res) {
                popByBloksAmount(i.tickets, parseInt($('#blocks-slider-leftLabel').text()), parseInt($('#blocks-slider-rightLabel').text()));
            }
        }
        if ($('#total-coeff-coeff-check').prop('checked') ||
            $('#plus-coeff-slider-check').prop('checked') ||
            $('#minus-coeff-slider-check').prop('checked')) {
            for (let i of res) {
                popByCoeff(i.tickets);
            }
        }
        print2DemArr(res);
    });
    //});
    //use team from team list
    $('#team-list').on('click', 'div.alert', function (e) {
        if (e.target == this) {
            var obj = {};
            obj['name'] = $(this).attr("data-name");
            obj['date'] = $(this).attr("data-date");
            obj['country'] = $(this).attr("data-country");
            obj["TBFactor"] = $(this).attr("data-TBFactor");
            obj["totalValue"] = $(this).attr("data-totalValue");
            obj["TMFactor"] = $(this).attr("data-TMFactor");
            obj["champ"] = $(this).attr("data-champ");
            if ($(this).hasClass('alert-standard')) {
                selectedTeamsJson.team.push(obj);
                localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
                $(this)
                    .removeClass('alert-standard')
                    .addClass('alert-error');
            } else {
                var ind = -1;
                for (var st = 0; st < selectedTeamsJson.team.length; st++) {
                    if (selectedTeamsJson.team[st].name == obj.name && selectedTeamsJson.team[st].date == obj.date) {
                        ind = st;
                    }
                }
                selectedTeamsJson.team.splice(ind, 1);
                localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
                $(this)
                    .removeClass('alert-error')
                    .addClass('alert-standard');
            }
            showSelectedTeamsList();
            showBlocksByCountry();
            rebuidSlider('blocks-slider', 'small', 'span', 0, 0, parseInt(selectedTeamsJson.team.length / 2), parseInt(selectedTeamsJson.team.length / 2));
            n_ = selectedTeamsJson.team.length;
            rebuidSlider('vars-slider', 'small', 'input', 1, 1, math.combinations(n_, k_ ? k_ : parseInt(n_ / 2)), math.combinations(n_, k_ ? k_ : parseInt(n_ / 2)));
            rebuidSlider('plus-slider', 'xsmall', 'span', 0, 0, n_, n_);
            $('#n').val(n_ > 0 ? n_ : "");
        }
    });
    $('#k-check').on('dblclick', function (e) {
        if ($('#k-check').prop("checked") == false) {
            $('#k-check').prop("checked", true);
            $('#anti-block-plus-check').prop("checked", true);
            $('#n-k-check').prop("checked", true);
            $('#anti-block-minus-check').prop("checked", true);
        } else {
            $('#k-check').prop("checked", false);
            $('#anti-block-plus-check').prop("checked", false);
            $('#n-k-check').prop("checked", false);
            $('#anti-block-minus-check').prop("checked", false);
        }

    });
   
    $(document).keypress(function (e) {
        if (e.which == 13) {
            $('#var-ok').click();
        }
    });
    $('#clean-vars').on('click', function (e) {
        $('#var-amount')[0].value = "";
    });
    $('#var-amount').on('input', (e) => {
        $('#vars-slider-check').prop("checked", false);
    });
    $('#var-ok').on('click', function (e) {
        $('.stp2').remove();
        var varAmount = [];
        if ($('#vars-slider-check').prop("checked")) {
            for (let i = parseInt($('#vars-slider-leftLabel').val()); i <= parseInt($('#vars-slider-rightLabel').val()); i++) {
                varAmount.push(i);
            }
        } else {
            varAmount.push(parseInt($('#var-amount').val()));
        }
        let fromPlus = k_;
        let toPlus = k_;
        if ($('#plus-slider-check').prop("checked")) {
            fromPlus = parseInt($('#plus-slider-leftLabel').text());
            toPlus = parseInt($('#plus-slider-rightLabel').text());
        }
        if (fromPlus != undefined && toPlus != undefined) {
            findVars(varAmount, fromPlus, toPlus);
        }
    });
    $(document).on('click', '#clean-k', function (e) {
        inputsForBlocksK(k_);
    });
    $(document).on('click', '#clean-n-k', function (e) {
        inputsForBlocksN(n_ - k_);
    });
    $('#var-tikets').on('click', function (e) {
        if (varTicketsRes.length != 0) {
            if (!$.isEmptyObject(_countries) && ($('#inner-blocks-check')[0].checked || $('#incountry-slider-check')[0].checked)) {
                let leftInCoutry, rightInCountry;
                let checkAllInCoutry = $('#incountry-slider-check')[0].checked;
                if (checkAllInCoutry) {
                    leftInCoutry = parseInt($('#incountry-slider-leftLabel').val());
                    rightInCountry = parseInt($('#incountry-slider-rightLabel').val());
                }
                let tmpRes = [];
                for (let ticketObj of varTicketsRes) {
                    let tmpSize = tmpRes.length;
                    let tmpTicket = popInCountries(ticketObj.tickets, checkAllInCoutry, leftInCoutry, rightInCountry);
                    tmpRes.pushIfNotExist(tmpTicket, (e) => {
                        for (let arr of e) {
                            for (let tArr of tmpTicket) {
                                if (isEqualArrays(arr, tArr)) return true;
                            }
                        }
                    });
                    if (tmpRes.length == tmpSize) {
                        ticketObj.tickets = [];
                        continue;
                    } else {
                        ticketObj.tickets = tmpTicket;
                    }
                }
            }
            if ($('#blocks-slider-check').prop('checked')) {
                for (let ticketObj of varTicketsRes) {
                    popByBloksAmount(ticketObj.tickets, parseInt($('#blocks-slider-leftLabel').text()), parseInt($('#blocks-slider-rightLabel').text()));
                }
            }
            if ($('#total-coeff-coeff-check').prop('checked') ||
                $('#plus-coeff-slider-check').prop('checked') ||
                $('#minus-coeff-slider-check').prop('checked')) {
                for (let ticketObj of varTicketsRes) {
                    popByCoeff(ticketObj.tickets);
                }
            }
            print2DemArr(varTicketsRes);
        }
    });
    $(document).on('click', ".var-div", function () {
        var tb = this.getAttribute('tb');
        var tm = this.getAttribute('tm');
        $('.dynamic-k, .dynamic-n-k').detach();
        if (tb.indexOf('Без блоков') != -1) {
            filter[0] = [];
            $('.k-blocks').detach();
            $('#k-check')[0].checked = true;
            $('#anti-block-plus-check')[0].checked = false;

            let newInp = $('<input type="number"  min="2"></input>').appendTo('#k-blocks-div')
                .attr('id', "k-block" + $(".k-blocks").length)
                .css({
                    width: "50px",
                    background: "#3C3F45",
                    color: "white"
                })
                .attr('placeholder', "Блок " + parseInt($(".k-blocks").length + 1))
                .addClass("k-blocks dynamic dynamic-k");
            $('<div class="quantity-nav"><div class="quantity-button quantity-up">&uarr;</div><div class="quantity-button quantity-down">&darr;</div></div>')
                .insertAfter(newInp);
            $(`<a id="clean-k">X</a>`)
                .appendTo('#k-blocks-div')
                .addClass("dynamic-k dynamic button button-small");

        } else {
            $('.k-blocks').detach();
            $('#k-check')[0].checked = false;
            $('#anti-block-plus-check')[0].checked = true;
            filter[0] = tb.replace('+</br>', '')
                .split(':')[1].split(',')
                .map(function (item) {
                    return parseInt(item)
                });

            for (var i = 0; i < filter[0].length; i++) {
                let newInp = $('<input type="text"></input>').appendTo('#k-blocks-div')
                    .attr('id', "k-block" + $(".k-blocks").length)
                    .css({
                        width: "50px",
                        background: "#3C3F45",
                        color: "white"
                    })
                    .attr('placeholder', "Блок " + parseInt($(".k-blocks").length + 1))
                    .addClass("k-blocks dynamic dynamic-k")
                    .val(filter[0][i]);
                $('<div class="quantity-nav"><div class="quantity-button quantity-up">&uarr;</div><div class="quantity-button quantity-down">&darr;</div></div>')
                    .insertAfter(newInp);
            }
            $(`<a id="clean-k">X</a>`)
                .appendTo('#k-blocks-div')
                .addClass("dynamic-k dynamic button button-small");

        }
        if (tm.indexOf('Без блоков') != -1) {
            filter[1] = [];
            $('.n-k-blocks').detach();
            $('#n-k-check')[0].checked = true;
            $('#anti-block-minus-check')[0].checked = false;

            let newInp = $('<input type="number"  min="2"></input>').appendTo('#n-k-blocks-div')
                .attr('id', "n-k-blocks" + $(".n-k-blocks").length)
                .css({
                    width: "50px",
                    background: "#3C3F45",
                    color: "white"
                })
                .attr('placeholder', "Блок " + parseInt($(".n-k-blocks").length + 1))
                .addClass("n-k-blocks dynamic dynamic-n-k");
            $('<div class="quantity-nav"><div class="quantity-button quantity-up">&uarr;</div><div class="quantity-button quantity-down">&darr;</div></div>')
                .insertAfter(newInp);
            $(`<a id="clean-n-k">X</a>`)
                .appendTo('#n-k-blocks-div')
                .addClass("dynamic-n-k dynamic button button-small");

        } else {
            $('.n-k-blocks').detach();
            $('#n-k-check')[0].checked = false;
            $('#anti-block-minus-check')[0].checked = true;
            filter[1] = tm.replace('+', '')
                .split(':')[1]
                .split(',')
                .map(function (item) {
                    return parseInt(item)
                });

            for (var i = 0; i < filter[1].length; i++) {
                let newInp = $('<input type="number"  min="2"></input>').appendTo('#n-k-blocks-div')
                    .attr('id', "n-k-blocks" + $(".n-k-blocks").length)
                    .css({
                        width: "50px",
                        background: "#3C3F45",
                        color: "white"
                    })
                    .attr('placeholder', "Блок " + parseInt($(".n-k-blocks").length + 1))
                    .addClass("n-k-blocks dynamic dynamic-n-k")
                    .val(filter[1][i]);
                let snippBtns = $('<div class="quantity-nav"><div class="quantity-button quantity-up">&uarr;</div><div class="quantity-button quantity-down">&darr;</div></div>')
                    .insertAfter(newInp);
                refreshInputs(newInp);
            }
            $(`<a id="clean-n-k">X</a>`)
                .appendTo('#n-k-blocks-div')
                .addClass("dynamic-n-k dynamic button button-small");

        }
    });

    $(document).on('input', '.country-input', function () {
        if ($(this).parent().hasClass('alert-standard')) {
            $(this).parent()
                .removeClass('alert-standard')
                .addClass('alert-error');
        }
        var obj = {};
        obj['name'] = $(this).parent().attr("data-name");
        obj['date'] = $(this).parent().attr("data-date");
        obj['country'] = $(this).parent().attr("data-country");
        obj["TBFactor"] = $(this).parent().attr("data-tbfactor");
        obj["totalValue"] = $(this).parent().attr("data-totalValue");
        obj["TMFactor"] = $(this).parent().attr("data-tmfactor");
        obj["champ"] = $(this).parent().attr("data-champ");
        var ind = -1;
        var ind2 = -1;
        for (var st = 0; st < selectedTeamsJson.team.length; st++) {
            //if (JSON.stringify(selectedTeamsJson.team[st]) == JSON.stringify(obj)) {
            if (selectedTeamsJson.team[st].date == obj.date && selectedTeamsJson.team[st].name == obj.name) {
                ind = st;
            }
        }
        for (var t = 0; t < teamsJson.team.length; t++) {
            if (teamsJson.team[t].date == obj.date && teamsJson.team[t].name == obj.name) {
                ind2 = t;
            }
        }
        $(this).parent().attr('data-country', this.value);
        obj['country'] = this.value;
        teamsJson.team[ind2] = obj;
        localStorage.setItem('teams', JSON.stringify(teamsJson));
        if (ind == -1) {
            selectedTeamsJson.team.push(obj)
            localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
            n_ = selectedTeamsJson.team.length;
            rebuidSlider('vars-slider', 'small', 'input', 1, 1, math.combinations(n_, k_ ? k_ : parseInt(n_ / 2)), math.combinations(n_, k_ ? k_ : parseInt(n_ / 2)));
            rebuidSlider('plus-slider', 'xsmall', 'span', 0, 0, n_, n_);
        } else {
            selectedTeamsJson.team[ind] = obj;
            localStorage.setItem('selectedTeams', JSON.stringify(selectedTeamsJson));
        }
        n_ = selectedTeamsJson.team.length;
        rebuidSlider('vars-slider', 'small', 'input', 1, 1, math.combinations(n_, k_ ? k_ : parseInt(n_ / 2)), math.combinations(n_, k_ ? k_ : parseInt(n_ / 2)));
        rebuidSlider('plus-slider', 'xsmall', 'span', 0, 0, n_, n_);
        $('#n').val(n_ > 0 ? n_ : "");
        showSelectedTeamsList();
        showBlocksByCountry();
        rebuidSlider('blocks-slider', 'small', 'span', 0, 0, parseInt(selectedTeamsJson.team.length / 2), parseInt(selectedTeamsJson.team.length / 2));
    });
    $(document).on('click', '.country-blocks', function (e) {
        chooseBlock(this, 'selected');
    });
    $(document).on('click', '.country-el', function (e) {
        if (e.target != $('#inner-blocks-check')[0] && this.tagName != 'LABEL') {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            $('#inner-blocks-check')[0].dispatchEvent(evt);
        }
    });
    $(document).on('contextmenu', '.country-blocks', function (e) {
        e = e || window.event;
        e.preventDefault();
        chooseBlock(this, 'anti-selected');
    });
    $(document).on('input', '.tm-coeff-inp', (e) => {

    });
    $('#plus-slider-check').change(function () {
        if ($(this).is(":checked") && $('#run').length == 0) {
            $('<a id="run" class="button button-large dynamic">Предпросмотр</a>')
                .appendTo('#buttons');
        }
    });
    $(document).on('click', '#add-tikets', (e) => {
        if (ticketsJson && ticketsJson.ticket.length) {
            addTicketsToContainer(ticketsJson, selectedContainer);
        }
    });
    $(document).on('click', '#show-container', (e) => {
        printContainer(JSON.parse(localStorage.getItem('tickets')));
    });
    $(document).on('click', '#clear-container', (e) => {
        localStorage.setItem('tickets', JSON.stringify({ ticket: [] }));
    });

    function refreshInputs(spinner) {
        //$('.quantity input').each(function () {
        spinner = $(spinner);
        //input = spinner.find('input[type="number"]'),
        let btnUp = spinner.siblings('.quantity-nav').find('.quantity-up'),
            btnDown = spinner.siblings('.quantity-nav').find('.quantity-down'),
            min = spinner.attr('min'),
            max = spinner.attr('max') || 1000000;

        btnUp.click(function () {
            var oldValue = parseFloat(spinner.val()) || 0;
            if (oldValue >= max) {
                var newVal = oldValue;
            } else {
                var newVal = oldValue + 1;
            }
            spinner.val(newVal);
            spinner.trigger("input");
        });

        btnDown.click(function () {
            var oldValue = parseFloat(spinner.val());
            if (oldValue <= min) {
                var newVal = oldValue;
            } else {
                var newVal = oldValue - 1;
            }
            spinner.val(newVal);
            spinner.trigger("input");
        });
        //	});
    }
    function chooseBlock(sefl, addedClass) {
        var countryAttr = $(sefl).attr('country');
        var blockAttr = $(sefl).attr('block');
        var parentEl = $(sefl).parent();

        $('#inner-blocks-check')[0].checked = true;
        if (!$(sefl).hasClass(addedClass)) {
            $(sefl).removeClass('selected');
            $(sefl).removeClass('standart');
            $(sefl).removeClass('anti-selected');
            $(sefl).addClass(addedClass);
        } else {
            $(sefl).removeClass('addedClass');
            $(sefl).addClass('standart');
        }
        $('.standart[country=' + countryAttr + ']').detach();
        var selectedSum = 0;
        var selectedEls = $('.selected[country=' + countryAttr + ']');
        var selectedAntiEls = $('.anti-selected[country=' + countryAttr + ']');
        _countries[countryAttr]['blocks'] = {};
        _countries[countryAttr]['antiBlocks'] = {};
        _countries[countryAttr]['antiBlocksOrder'] = [];
        _countries[countryAttr]['blocksOrder'] = [];
        for (var el = 0; el < selectedEls.length; el++) {
            selectedSum += parseInt(selectedEls[el].getAttribute('block'));
            if (_countries[countryAttr]['blocks'].hasOwnProperty(selectedEls[el].getAttribute('block'))) {
                _countries[countryAttr]['blocks'][selectedEls[el].getAttribute('block')]++;//.push(selectedEls[el].getAttribute('block'));
            } else {
                _countries[countryAttr]['blocksOrder'].push(selectedEls[el].getAttribute('block'));
                _countries[countryAttr]['blocks'][selectedEls[el].getAttribute('block')] = 1;
            }
        }
        for (var el = 0; el < selectedAntiEls.length; el++) {
            selectedSum += parseInt(selectedAntiEls[el].getAttribute('block'));
            if (_countries[countryAttr]['antiBlocks'].hasOwnProperty(selectedAntiEls[el].getAttribute('block'))) {
                _countries[countryAttr]['antiBlocks'][selectedAntiEls[el].getAttribute('block')]++;//.push(selectedEls[el].getAttribute('block'));
            } else {
                _countries[countryAttr]['antiBlocksOrder'].push(selectedAntiEls[el].getAttribute('block'));
                _countries[countryAttr]['antiBlocks'][selectedAntiEls[el].getAttribute('block')] = 1;
            }
        }
        var avaibleBlocks = _countries[countryAttr].team.length - selectedSum;
        showAvaibleBlocks(avaibleBlocks, countryAttr, parentEl);
    }
    function rebuidSlider(tagId, size, valueTag, cLeft, cMin, cRight, cMax) {
        if ($('#' + tagId).length != 0) {
            $('#' + tagId).detach();
            $(`#${tagId}-leftLabel`).detach();
            $(`#${tagId}-rightLabel`).detach();
        }
        let newSlider = $(`<div id="${tagId}" 
                                class="nstSlider ${size}" 
                                data-range_min="${cMin}" 
                                data-range_max="${cMax}"
                                data-cur_min="${cLeft}"
                                data-cur_max="${cRight}">
                                    <div id="${tagId}-SliderBar" 
                                        class="bar">
                                    </div>
                                    <div id="${tagId}-LeftGrip" 
                                        class="leftGrip">
                                    </div>
                                    <div id="${tagId}-RightGrip" 
                                        class="rightGrip">
                                    </div>
                            </div>`)
            .appendTo(`#${tagId}-Container`);
        newSlider.nstSlider({
            "crossable_handles": false,
            "left_grip_selector": `#${tagId}-LeftGrip`,
            "right_grip_selector": `#${tagId}-RightGrip`,
            "value_bar_selector": `#${tagId}-SliderBar`,
            "value_changed_callback": function (cause, leftValue, rightValue) {
                $(`#${tagId}-check`).prop("checked", true);
                if (valueTag == 'span') {
                    $(`#${tagId}-leftLabel`).text(leftValue);
                    $(`#${tagId}-rightLabel`).text(rightValue);
                }
                if (valueTag == 'input') {
                    $(`#${tagId}-leftLabel`).val(leftValue);
                    $(`#${tagId}-rightLabel`).val(rightValue);
                }
            }
        });
        let lLbl = $(`<${valueTag} id="${tagId}-leftLabel"></${valueTag} >`).prependTo(`#${tagId}-Container`);
        let rLbl = $(`<${valueTag}  id="${tagId}-rightLabel" style="margin-left: 10px;"></${valueTag} >`).appendTo(`#${tagId}-Container`);
        if (valueTag == 'input') {
            lLbl.attr('type', 'number');
            lLbl.css("width", "70px");
            lLbl.css("background", "#3C3F45");
            lLbl.css("color", "white");
            lLbl.val(cLeft);
            rLbl.attr('type', 'number');
            rLbl.css("width", "70px");
            rLbl.css("background", "#3C3F45");
            rLbl.css("color", "white");
            rLbl.val(cRight);
        }
        if (valueTag == 'span') {
            lLbl.text(cLeft);
            rLbl.text(cRight);
        }
        $(`#${tagId}-check`).prop("checked", false);
    };
    function rebuidCoeff(tagId, cLeft, cRight, cMax) {
        if ($('#' + tagId).length != 0) $('#' + tagId).detach();
        let newSlider = $(`<div id="${tagId}" 
                                class="nstSlider" 
                                data-range_min="0" 
                                data-range_max="${cMax}"
                                data-cur_min="${cLeft}"
                                data-cur_max="${cRight}">
                                    <div id="${tagId}-SliderBar" 
                                        class="bar">
                                    </div>
                                    <div id="${tagId}-LeftGrip" 
                                        class="leftGrip">
                                    </div>
                                    <div id="${tagId}-RightGrip" 
                                        class="rightGrip">
                                    </div>
                            </div>`)
            .appendTo(`#${tagId}-Container`);
        newSlider.nstSlider({
            "crossable_handles": false,
            "left_grip_selector": `#${tagId}-LeftGrip`,
            "right_grip_selector": `#${tagId}-RightGrip`,
            "value_bar_selector": `#${tagId}-SliderBar`,
            "value_changed_callback": function (cause, leftValue, rightValue) {
                $(`#${tagId}-coeff-check`).prop("checked", true);
                if (kostil) {
                    coeffLeft = leftValue;
                    coeffRight = rightValue;
                    localStorage.setItem('coeffLeft', leftValue);
                    localStorage.setItem('coeffRight', rightValue);
                }
                $(`#${tagId}-LeftInput`).val(leftValue);
                $(`#${tagId}-RightInput`).val(rightValue);
                kostil = true;
            }
        });
        newSlider.on('dblclick', function (e) {
            if (e.target.id == (`${tagId}-RightGrip`)) {
                newSlider.nstSlider('set_position', coeffLeft, coeffMax);
            }
        });
    };
    function showBlocksByCountry() {
        $('.country-el').detach();
        _countries = {};
        for (var i = 0; i < selectedTeamsJson.team.length; i++) {
            if (selectedTeamsJson.team[i].country != "") {
                if (_countries.hasOwnProperty(selectedTeamsJson.team[i].country)) {
                    _countries[selectedTeamsJson.team[i].country]['team'].push({
                        'position': i,
                        'countryObj': selectedTeamsJson.team[i]
                    });
                } else {
                    _countries[selectedTeamsJson.team[i].country] = {
                        'team': [{
                            'position': i,
                            'countryObj': selectedTeamsJson.team[i]
                        }]
                    };
                }
            }
        }
        if (!$.isEmptyObject(_countries)) {
            var eventsDiv = $('<div class="country-el" style="display: inline-block; margin-left: 30px; float: right;"></div>').appendTo($('#events-div'));
            $('<label class="country-el">Внутренние блоки </span><input id="inner-blocks-check" type="checkBox"></br>')
                .appendTo(eventsDiv);
            for (var i in _countries) {
                if (_countries[i]['team'].length <= 1) continue;
                var countryString = $('<h4 class="country-el"></h4>').text(i + " ").appendTo(eventsDiv);
                showAvaibleBlocks(_countries[i]['team'].length, i, countryString);
                var checks = $('<div class="country-el"></div>').appendTo(eventsDiv);
                $('<label ><input type="checkBox" id="without' + i + '" class="country-el "/> Без блоков </label>').appendTo(checks);
                $('<label ><input type="checkBox" id="only' + i + '" class="country-el"/> Только указанные </label>').appendTo(checks);
            }
        }
    }
    function showAvaibleBlocks(to, country, element) {
        for (var j = 2; j <= to; j++) {
            $('<a class="button button-large country-blocks country-el standart">' + j + '</a>')
                .attr('country', country)
                .attr('block', j)
                .appendTo(element);
        }

    }
    function showSelectedTeamsList() {
        $('.selected-teams-list').detach();
        if (selectedTeamsJson.team.length) {
            let eventsDiv = $('<blockquote class="selected-teams-list" style="display: inline-block;"></blockquote>').appendTo($('#events-div'));
            for (var i = 0; i < selectedTeamsJson.team.length; i++) {
                let country = selectedTeamsJson.team[i].country == undefined ? "" : selectedTeamsJson.team[i].country;
                //let itemCoeff = `<span style="color:black;font-size: 120%"> ТБ х${parseFloat(selectedTeamsJson.team[i].TBFactor).toFixed(2)} ТМ х${parseFloat(selectedTeamsJson.team[i].TMFactor).toFixed(2)}</span>`;
                //listContent += `${country} `;
                let newDiv =
                    $('<div class="selected-teams-list">').appendTo(eventsDiv)
                        .html(`<span style="color:black;font-size: 120%">${country}</span> ${selectedTeamsJson.team[i].name} ${selectedTeamsJson.team[i].date} `)
                        .attr("data-name", selectedTeamsJson.team[i].name)
                        .attr("data-country", country)
                        .attr("data-date", selectedTeamsJson.team[i].date)
                        .attr('data-tbfactor', selectedTeamsJson.team[i].TBFactor)
                        .attr('data-totalValue', selectedTeamsJson.team[i].totalValue)
                        .attr('data-tmfactor', selectedTeamsJson.team[i].TMFactor);
                let rightDiv = $(`<div style="display: inline-block;"></div>`).appendTo(newDiv);
                // $(`<span style="color:black; font-size: 120%; display: inline-block;"> Тотал (${selectedTeamsJson.team[i].totalValue}) &uarr;</span><input type="number" min="0" step="0.01" class="selected-teams-list tb-coeff-inp" placeholder = "" style="width:50px; background: #3C3F45; color: white; display: inline-block;"></input>`).val(selectedTeamsJson.team[i].TBFactor).appendTo(rightDiv);
                // $('<input type="number" min="0" step="0.01" class="selected-teams-list tm-coeff-inp" placeholder = "" style="width:50px; background: #3C3F45; color: white; margin-left: 10px;"></input><span style="color: black;font-size: 120%;">&darr;</span>').val(selectedTeamsJson.team[i].TMFactor).appendTo(rightDiv);
                $(`<span style="color:black; font-size: 120%; display: inline-block;"> Тотал (${selectedTeamsJson.team[i].totalValue}): &uarr;x${parseFloat(selectedTeamsJson.team[i].TBFactor).toFixed(2)} &darr;x${parseFloat(selectedTeamsJson.team[i].TMFactor).toFixed(2)}</span>`)
                    .val(selectedTeamsJson.team[i].TBFactor).appendTo(rightDiv);

                // let switcher = $(`<div class="nstSlider" id="switcher-${i}" data-range_min="-1" data-range_max="1"
                // 						data-cur_min="0"     data-cur_max="0">
                // 							<div id="switcher-bar-${i}"></div>
                // 							<div id="switcher-leftGrip-${i}"></div>
                // 					</div>
                // 					<div id="switcher-leftLabel-${i}" class="leftLbl"/>`);

                // 	switcher.nstSlider({
                // 		"left_grip_selector": `#switcher-leftGrip-${i}`,
                // 		"value_changed_callback": function(cause, leftValue, rightValue) {
                // 			let lbl = '';
                // 			if (leftValue == 1) lbl = 'ТБ';
                // 			if (leftValue == -1) lbl = 'ТМ';
                // 			if (leftValue == 0) lbl = 'free';
                // 			$(this).parent().find(`.leftLbl`).text(lbl);
                // 		}
                // 	});
                // 	switcher.appendTo(rightDiv);
                // $('<input type="number" min="0" step="0.01" class="selected-teams-list tm-coeff-inp" placeholder = "" style="width:50px; background: #3C3F45; color: white; margin-left: 10px;"></input><span style="color: black;font-size: 120%;">&darr;</span>').val(selectedTeamsJson.team[i].TMFactor).appendTo(rightDiv);
            }
        }
    }
    function findVars(varAmount, fromPlus, toPlus) {
        var arrConts = [];
        var varNum = 0;
        varTicketsRes = [];
        let allTicketsAmount = 0;
        let allVars = 0;
        let ticketsArr = [];

        for (let plusRange = fromPlus; plusRange <= toPlus; plusRange++) {
            let n_filter_combs = getComposotions(n_ - plusRange);
            let k_filter_combs = plusRange == n_ - plusRange ? n_filter_combs.slice() : getComposotions(plusRange);
            for (let combK of k_filter_combs) {
                for (let combN of n_filter_combs) {

                    let addons = cBlocksBin(n_, plusRange, combK, combN, true, true);

                    addons['isEmptyKFilter'] = combK.length == 0 || sumOfMas(combK) == 0;
                    addons['isEmptyNFilter'] = combN.length == 0 || sumOfMas(combN) == 0;
                    addons['kFilter'] = combK;
                    addons['nFilter'] = combN;
                    addons['dynamic'] = false;

                    ticketsArr.push(addons);
                }
            }
        }
        for (let ticketsObj of ticketsArr) {
            var k_check = false;
            var n_check = false;
            let dynamic = { 'tf': [], 'ft': [], 'ff': [] };

            var fl_ok = false;

            if ($('#k-check').prop("checked") && $('#n-k-check').prop("checked")) {
                if ($('#anti-block-minus-check').prop("checked") && $('#anti-block-plus-check').prop("checked")) {
                    if (varAmount.indexOf(ticketsObj.tickets.length) != -1 && !ticketsObj.isEmptyKFilter && !ticketsObj.isEmptyNFilter) {
                        fl_ok = true;
                    }
                    if (!ticketsObj.isEmptyNFilter && ticketsObj.isEmptyKFilter) {
                        dynamic.tf = cBlocksBin(ticketsObj.events, ticketsObj.ratio, ticketsObj.kFilter, ticketsObj.nFilter, true, false);
                        let tmp = dynamic.tf.tickets;
                        popBloks(tmp, 1);
                        if (varAmount.indexOf(tmp.length) != -1) {
                            fl_ok = true;
                            k_check = true;
                            ticketsObj.dynamic = 'tf';
                        }
                    }
                    if (!ticketsObj.isEmptyKFilter && ticketsObj.isEmptyNFilter) {
                        dynamic.ft = cBlocksBin(ticketsObj.events, ticketsObj.ratio, ticketsObj.kFilter, ticketsObj.nFilter, false, true);
                        let tmp = dynamic.ft.tickets;
                        popBloks(tmp, 0);
                        if (varAmount.indexOf(tmp.length) != -1) {
                            fl_ok = true;
                            n_check = true;
                            ticketsObj.dynamic = 'ft';
                        }
                    }
                    if (ticketsObj.isEmptyKFilter && ticketsObj.isEmptyNFilter) {
                        dynamic.ff = cBlocksBin(ticketsObj.events, ticketsObj.ratio, ticketsObj.kFilter, ticketsObj.nFilter, false, false);
                        let tmp = dynamic.ff.tickets;
                        popBloks(tmp, 10);
                        if (varAmount.indexOf(tmp.length) != -1) {
                            fl_ok = true;
                            k_check = true;
                            n_check = true;
                            ticketsObj.dynamic = 'ff';
                        }
                    }
                } else {
                    popBloks(ticketsObj.tickets, 10);
                    k_check = true;
                    n_check = true;

                    if (varAmount.indexOf(ticketsObj.tickets.length) != -1) {
                        fl_ok = true;
                    }
                }
            } else {
                if ($('#k-check').prop("checked")) {
                    popBloks(ticketsObj.tickets, 1);
                    k_check = true;
                }
                if ($('#n-k-check').prop("checked")) {
                    popBloks(ticketsObj.tickets, 0);
                    n_check = true;
                }
                if ($('#anti-block-minus-check').prop("checked") && $('#anti-block-plus-check').prop("checked")) {
                    if (varAmount.indexOf(ticketsObj.tickets.length) != -1) {
                        fl_ok = true;
                    }
                }
            }

            if (fl_ok) {
                let ticketsAmount = ticketsObj.tickets.length;
                if (ticketsObj.dynamic) {
                    ticketsAmount = dynamic[ticketsObj.dynamic].tickets.length;
                    ticketsObj.tickets = dynamic[ticketsObj.dynamic].tickets.slice();
                }
                var tCont = `#${parseInt(varNum + 1)} | ${ticketsObj.ratio}/${ticketsObj.events - ticketsObj.ratio} | (${ticketsAmount}) </br>`;
                var tCont2 = "";
                var tCont3 = "";

                if (ticketsObj.isEmptyKFilter) {
                    if (k_check) {
                        tCont2 += "ТБ: Без блоков." + "</br>";
                    }
                } else {
                    tCont2 += "ТБ: " + ticketsObj.kFilter + "</br>";
                }
                if (ticketsObj.isEmptyNFilter) {
                    if (n_check) {
                        tCont3 += "ТМ: Без блоков."
                    }
                } else {
                    tCont3 += "ТМ: " + ticketsObj.nFilter;
                }
                if (arrConts.indexOf(tCont2 + tCont3 + ticketsObj.ratio) == -1 && tCont2.length != 0 && tCont3.length != 0) {
                    var newEl = $('<div class="row cont stp2">')
                        .appendTo('#accordionArea2 .accordion-inner')
                        .attr('data-var-num', varNum);
                    var newDiv = (varNum % 2 == 0) ?
                        $('<div class="alert alert-error fade in span24 stp2 var-div">').appendTo(newEl) :
                        $('<div class="alert alert-info fade in span24 stp2 var-div">').appendTo(newEl);
                    newDiv.attr('tb', tCont2);
                    newDiv.attr('tm', tCont3);
                    arrConts.push(tCont2 + tCont3 + ticketsObj.ratio);
                    newDiv.html(tCont + tCont2 + tCont3);
                    varNum++;
                    allTicketsAmount += ticketsAmount;
                    varTicketsRes.push(ticketsObj);
                }
            }

        }
        $('#var-num').html(`Варианты (${varNum}/${allTicketsAmount})`);
    }

    function getComposotions(sum) {
        let output = [[0]];
        for (let i = sum; i >= 2; i--) output.push([i]);

        for (let arrSize = 2; arrSize <= parseInt(sum / 2); arrSize++) {
            for (let currentSum = sum; currentSum >= parseInt(sum / arrSize); currentSum--) {
                let firstSummand = currentSum - (arrSize - 1) * 2;
                if (firstSummand < 2) break;
                let firstComposotion = [firstSummand];
                for (let i = 1; i < arrSize; i++) {
                    firstComposotion[i] = 2;
                }
                output.push(firstComposotion);

                if (firstComposotion[0] > firstComposotion[1] + 1) {
                    let i = 0;
                    while (i < arrSize - 1) {
                        let lastComp = output[output.length - 1].slice();
                        if (lastComp[i] == lastComp[i + 1]) break;
                        if (lastComp[i] == lastComp[i + 1] + 1) {
                            if (i >= arrSize - 3) break;
                            lastComp[i] -= 1;
                            lastComp[i + 2] += 1;
                            output.push(lastComp);
                            i++;
                        }
                        if (lastComp[i] >= lastComp[i + 1] + 2) {
                            lastComp[i] -= 1;
                            lastComp[i + 1] += 1;
                            output.push(lastComp);
                            if (lastComp[i] == lastComp[i + 1]) i++;
                        }
                    }
                }
            }
        }
        return output;
    }
    function cartesianProductOf() {
        return _.reduce(arguments, function (a, b) {
            return _.flatten(_.map(a, function (x) {
                return _.map(b, function (y) {
                    return x.concat([y]);
                });
            }), true);
        }, [[]]);
    };
    // function isArraysEqual(a, b) {
    // 	if (a === b) return true;
    // 	if (a == null || b == null) return false;
    // 	if (a.length != b.length) return false;
    // 	a = a.slice().sort();
    // 	b = b.slice().sort();
    // 	for (var i = 0; i < a.length; ++i) {
    // 		if (a[i] !== b[i]) return false;
    // 	}
    // 	return true;
    // }
    function findVarsLimit(k_filter_combs, n_filter_combs, upperLimit) {
        var tCont = "";
        var tCont2 = "";
        var tCont3 = "";
        var arrConts = [];
        var varNum = 0;
        for (var i = 0; i < k_filter_combs.length; i++) {
            for (var j = 0; j < n_filter_combs.length; j++) {
                var fl_k = false;
                var fl_n = false;
                var k_check = false;
                var n_check = false;
                var k_anti_check = false;
                var n_anti_check = false;
                if (n_filter_combs[j].length == 0)
                    fl_n = true;
                if (k_filter_combs[i].length == 0)
                    fl_k = true;
                var res = [];
                res[0] = cBlocksBin(n_, k_, k_filter_combs[i], n_filter_combs[j], true, true);
                res[1] = cBlocksBin(n_, k_, k_filter_combs[i], n_filter_combs[j], false, true);
                res[2] = cBlocksBin(n_, k_, k_filter_combs[i], n_filter_combs[j], true, false);
                res[3] = cBlocksBin(n_, k_, k_filter_combs[i], n_filter_combs[j], false, false);

                var fl_ok = false;

                if ($('#k-check').prop("checked") && $('#n-k-check').prop("checked")) {
                    if ($('#anti-block-minus-check').prop("checked") && $('#anti-block-plus-check').prop("checked")) {
                        if (res[0].length == varAmount) {
                            fl_ok = true;
                            k_anti_check = true;
                            n_anti_check = true;
                        }
                        if (res[1].length == varAmount) {
                            fl_ok = true;
                            k_anti_check = true;
                        }
                        if (res[2].length == varAmount) {
                            fl_ok = true;
                            n_anti_check = true;
                        }
                        if (res[3].length == varAmount) {
                            fl_ok = true;
                        }
                        if (!fl_ok) {
                            var resTmp = [];
                            for (var ii = 0; ii < res.length; ii++) {
                                resTmp[ii] = res[ii].slice();
                            }
                            if (fl_n && fl_k) {
                                for (var ii = 0; ii < 4; ii++)
                                    popBloks(res[ii], 10);
                                if (res[0].length == varAmount || res[1].length == varAmount || res[2].length == varAmount || res[3].length == varAmount) {
                                    fl_ok = true;
                                    k_check = true;
                                    n_check = true;
                                }
                            }
                            if (!fl_n && fl_k) {
                                for (var ii = 0; ii < 4; ii++)
                                    popBloks(res[ii], 1);
                                if (res[0].length == varAmount || res[1].length == varAmount || res[2].length == varAmount || res[3].length == varAmount) {
                                    fl_ok = true;
                                    k_check = true;
                                }
                            }
                            if (!fl_k && fl_n) {
                                for (var ii = 0; ii < 4; ii++)
                                    popBloks(res[ii], 0);
                                if (res[0].length == varAmount || res[1].length == varAmount || res[2].length == varAmount || res[3].length == varAmount) {
                                    fl_ok = true;
                                    n_check = true;
                                }
                            }
                            for (var ii = 0; ii < resTmp; ii++) {
                                res[ii] = resTmp[ii].slice();
                            }
                        }
                    } else {
                        for (var ii = 0; ii < 4; ii++)
                            popBloks(res[ii], 10);
                        k_check = true;
                        n_check = true;

                        if (res[0].length == varAmount) {
                            fl_ok = true;
                            k_anti_check = true;
                            n_anti_check = true;
                        }
                        if (res[1].length == varAmount) {
                            fl_ok = true;
                            k_anti_check = true;
                        }
                        if (res[2].length == varAmount) {
                            fl_ok = true;
                            n_anti_check = true;
                        }
                        if (res[3].length == varAmount) {
                            fl_ok = true;
                        }
                    }
                } else {
                    if ($('#k-check').prop("checked")) {
                        for (var ii = 0; ii < 4; ii++)
                            popBloks(res[ii], 1);
                        k_check = true;
                    }
                    if ($('#n-k-check').prop("checked")) {
                        for (var ii = 0; ii < 4; ii++)
                            popBloks(res[ii], 0);
                        n_check = true;
                    }
                    if (!$('#anti-block-minus-check').prop("checked") && !$('#anti-block-plus-check').prop("checked")) {
                        if (res[3].length == varAmount) {
                            fl_ok = true;
                        }
                    }
                    if ($('#anti-block-minus-check').prop("checked") && $('#anti-block-plus-check').prop("checked")) {
                        if (res[0].length == varAmount) {
                            fl_ok = true;
                            k_anti_check = true;
                            n_anti_check = true;
                        }
                    }
                    if (!$('#anti-block-minus-check').prop("checked") && $('#anti-block-plus-check').prop("checked")) {
                        if (res[1].length == varAmount) {
                            fl_ok = true;
                            k_anti_check = true;
                        }
                    }
                    if ($('#anti-block-minus-check').prop("checked") && !$('#anti-block-plus-check').prop("checked")) {
                        if (res[2].length == varAmount) {
                            fl_ok = true;
                            n_anti_check = true;
                        }
                    }
                }

                if (fl_ok) {
                    tCont = "Блоки №" + parseInt(varNum + 1) + "</br>";
                    tCont2 = "";
                    tCont3 = "";
                    if (fl_k) {
                        if (k_check) {
                            tCont2 += "ТБ: Без блоков." + "</br>";
                        }
                    } else {
                        if (k_anti_check) {
                            tCont2 += "ТБ: " + k_filter_combs[i] + "+" + "</br>";
                        } else {
                            tCont2 += "ТБ: " + k_filter_combs[i] + "</br>";
                        }
                    }
                    if (fl_n) {
                        if (n_check) {
                            tCont3 += "ТМ: Без блоков."
                        }
                    } else {
                        if (n_anti_check) {
                            tCont3 += "ТМ: " + n_filter_combs[j] + "+";
                        } else {
                            tCont3 += "ТМ: " + n_filter_combs[j];
                        }
                    }
                    if (arrConts.indexOf(tCont2) == -1 && tCont2.length != 0 && tCont3.length != 0) {
                        var newEl = $('<div class="row cont stp2">')
                            .appendTo('#accordionArea2 .accordion-inner')
                            .attr('data-var-num', i);
                        var newDiv = (varNum % 2 == 0) ?
                            $('<div class="alert alert-error fade in span24 stp2">').appendTo(newEl) :
                            $('<div class="alert alert-info fade in span24 stp2">').appendTo(newEl);
                        arrConts.push(tCont2);
                        newDiv.html(tCont + tCont2 + tCont3);
                        varNum++;
                    }
                }
            }
        }
        $('#var-num').html('Варианты (' + varNum + ')');
    }
    function sumOfMas(m) {
        if (m == undefined) return undefined;
        var total = 0;
        for (var i = 0; i < m.length; i++) {
            if (m[i] != undefined)
                total += m[i];
            else
                return undefined;
        }
        return total;
    }
    function allTrue(m) {
        for (var i = 0; i < m.length; i++)
            if (m[i] == false)
                return false;
        return true;
    }
    function combinations(arr) {
        if (arr.length > 1) {
            var beg = arr[0],
                arr1 = combinations(arr.slice(1)),
                arr2 = [],
                l = arr1[0].length;
            for (var i = 0; i < arr1.length; i++)
                for (var j = 0; j <= l; j++)
                    arr2.push(arr1[i].slice(0, j).concat(beg, arr1[i].slice(j)));
            return arr2;
        } else return [arr];
    }
    function isEqualArrays(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
    function c_n_k(n, k) {
        var total = 0,
            output = new Array;
        n--;
        output[total] = new Array;
        for (var i = 0; i < k; i++)
            output[total][i] = i;
        while (true) {
            var search = false,
                max = 0;
            for (var j = 0; j < k; j++)
                if (max <= j && output[total][j] < n - k + j + 1) {
                    search = true;
                    max = j;
                }
            if (!search)
                break;
            total++;
            output[total] = output[total - 1].slice();
            output[total][max]++;
            for (var j = max + 1; j < k; j++)
                output[total][j] = output[total][j - 1] + 1;
        }
        return output;
    }
    function invert(input) {
        var k = input[0].length,
            n = input[input.length - 1][k - 1] + 1,
            output = new Array;
        for (var i = 0; i < input.length; i++) {
            var w = 0;
            output[i] = new Array;
            for (var j = 0; j < n; j++)
                if (input[i].indexOf(j) == -1) {
                    output[i][w] = j;
                    w++;
                }
        }
        return output;
    }

    function block(input, filter, n, onlySelectedBlocks) {
        if (filter.length == 0)
            return input;
        var k = input[0].length,
            output = new Array,
            z = 0;
        if (sumOfMas(filter) > k)
            return input;
        filter = filter.map(function (ind, el) { if (ind - 1 > 0 && ind != undefined) return ind - 1; });
        if (filter.length == 0 || sumOfMas(filter) == undefined)
            return input;
        for (var i = 0; i < input.length; i++) top: {
            var w = 0,
                blocks = new Array;
            for (var j = 0; j < k - 1; j++)
                if (input[i][j] == input[i][j + 1] - 1) {
                    w++;
                } else {
                    if (w != 0) {
                        blocks.push(w);
                        w = 0;
                    }
                }
            if (w != 0) {
                blocks.push(w);
                w = 0;
            }
            var blockCombs = combinations(blocks);
            for (var comb = 0; comb < blockCombs.length; comb++) {
                var fIter = 0;
                var diff = blockCombs[comb][0];
                for (var b = 0; b < blockCombs[0].length; b++) {
                    diff = (fIter == filter.length - 1 || diff == filter[fIter]) ? (diff - filter[fIter]) : (diff - filter[fIter] - 1);
                    if (diff < 0)
                        break;
                    if (diff > 0) {
                        fIter++;
                        b--;
                    }
                    if (diff == 0) {
                        fIter++;
                        diff = blockCombs[comb][b + 1];
                    }
                    if (fIter == filter.length) {
                        var filterComb = combinations(filter);
                        for (var fComb = 0; fComb < filterComb.length; fComb++) {
                            var tmp = input[i].slice();
                            var fl = true;
                            for (var blockIter = 0; blockIter < filterComb[fComb].length; blockIter++) {
                                var w = 0;
                                for (var inpIter = 0; inpIter < tmp.length - 1; inpIter++) {
                                    if (tmp[inpIter] == tmp[inpIter + 1] - 1)
                                        w++;
                                    else
                                        w = 0;
                                    if (w == filterComb[fComb][blockIter]) {
                                        for (var inv = 0; inv <= w; inv++) {
                                            tmp[inpIter + 1 - inv] = parseInt(blockIter) * -1;
                                        }
                                        break;
                                    }
                                }
                            }
                            for (var t = 0; t < tmp.length - 1; t++) {
                                if (tmp[t] != tmp[t + 1] && input[i][t] == input[i][t + 1] - 1) {
                                    fl = false;
                                    break;
                                }
                            }
                            if (fl || !onlySelectedBlocks) {
                                output[z] = new Array;
                                output[z] = input[i];
                                z++;
                                break top;
                            }
                        }
                    }
                }
            }
        }
        return output;
    }
    function inputsForBlocksK(k) {
        $('.dynamic-k').detach();
        filter[0] = [];
        if (k > 1) {
            let newInp = $('<input type="number"  min="2"></input>').appendTo('#k-blocks-div')
                .attr('id', "k-block" + $(".k-blocks").length)
                .css({
                    width: "50px",
                    background: "#3C3F45",
                    color: "white"
                })
                .attr('placeholder', "Блок " + parseInt($(".k-blocks").length + 1))
                .addClass("k-blocks dynamic dynamic-k");
            let snippBtns = $('<div class="quantity-nav"><div class="quantity-button quantity-up">&uarr;</div><div class="quantity-button quantity-down">&darr;</div></div>')
                .insertAfter(newInp);
            refreshInputs(newInp);
            $(`<a id="clean-k">X</a>`)
                .appendTo('#k-blocks-div')
                .addClass("dynamic-k dynamic button button-small");

        }
    }
    function inputsForBlocksN(n_k) {
        $('.dynamic-n-k').detach();
        filter[1] = [];
        if (n_k > 1) {


            let newInp = $('<input type="number"  min="2"></input>').appendTo('#n-k-blocks-div')
                .attr('id', "n-k-block" + $(".n-k-blocks").length)
                .css({
                    width: "50px",
                    background: "#3C3F45",
                    color: "white"
                })
                .attr('placeholder', "Блок " + parseInt($(".n-k-blocks").length + 1))
                .addClass("n-k-blocks dynamic dynamic-n-k");
            let snippBtns = $('<div class="quantity-nav"><div class="quantity-button quantity-up">&uarr;</div><div class="quantity-button quantity-down">&darr;</div></div>')
                .insertAfter(newInp);
            refreshInputs(newInp);
            $(`<a id="clean-n-k">X</a>`)
                .appendTo('#n-k-blocks-div')
                .addClass("dynamic-n-k dynamic button button-small");
        }
    }

    function inputsForBlocks(n, k) {
        $('.dynamic').detach();
        if (k > 1) {

            let newInp = $('<input type="number"  min="2"></input>').appendTo('#k-blocks-div')
                .attr('id', "k-block" + $(".k-blocks").length)
                .css({
                    width: "50px",
                    background: "#3C3F45",
                    color: "white"
                })
                .attr('placeholder', "Блок " + parseInt($(".k-blocks").length + 1))
                .addClass("k-blocks dynamic dynamic-k");
            $('<div class="quantity-nav"><div class="quantity-button quantity-up">&uarr;</div><div class="quantity-button quantity-down">&darr;</div></div>')
                .insertAfter(newInp);
            $(`<a id="clean-k">X</a>`)
                .appendTo('#k-blocks-div')
                .addClass("dynamic-k dynamic button button-small");

        }
        if (n - k > 1) {

            let newInp = $('<input type="number"  min="2"></input>').appendTo('#n-k-blocks-div')
                .attr('id', "n-k-block" + $(".n-k-blocks").length)
                .css({
                    width: "50px",
                    background: "#3C3F45",
                    color: "white"
                })
                .attr('placeholder', "Блок " + parseInt($(".n-k-blocks").length + 1))
                .addClass("n-k-blocks dynamic dynamic-n-k");
            let snippBtns = $('<div class="quantity-nav"><div class="quantity-button quantity-up">&uarr;</div><div class="quantity-button quantity-down">&darr;</div></div>')
                .insertAfter(newInp);
            refreshInputs(newInp);
            $(`<a id="clean-n-k">X</a>`)
                .appendTo('#n-k-blocks-div')
                .addClass("dynamic-n-k dynamic button button-small");

        }
        $('<a id="run" class="button button-large dynamic">Предпросмотр</a>')
            .appendTo('#buttons');

    }

    function fillTeamList(teamsJson) {
        $('#team-list > div').remove();
        var champs = [];
        teamsJson.team.forEach(function (item, i) {
            if (item) {
                champs.pushIfNotExist(item.champ, (e) => (item.champ) == e);
            }
        });
        champs.forEach(function (item, i) {
            $('<div id="champ' + i + '" champ-name="' + item + '">' + item + '</div>').appendTo($('#team-list'));
        });
        teamsJson.team.forEach(function (item, i) {
            if (item == null) {
                //  teamsJson.team.splice(i, 1);
            } else {
                var country = item.country == undefined ? "" : item.country;
                let itemCoeff = `<span style="color:black;font-size: 120%"> Тотал (${item.totalValue}): &uarr;x${parseFloat(item.TBFactor).toFixed(2)} &darr;х${parseFloat(item.TMFactor).toFixed(2)}</span>`;
                let champDiv = $(`#team-list div[champ-name="${item.champ}"`);
                var newDiv =
                    $('<div class="alert alert-standard fade in">').appendTo(champDiv)
                        .html(item.name + " " + item.date + "   ")
                        .attr("data-name", item.name)
                        .attr("data-country", country)
                        .attr("data-date", item.date)
                        .attr('data-tbfactor', item.TBFactor)
                        .attr('data-totalValue', item.totalValue)
                        .attr('data-tmfactor', item.TMFactor);
                $('<input type="number" min="1" class="country-input" placeholder = "" style="width:35px; background: #3C3F45; color: white"></input>').val(country).appendTo(newDiv);
                $(itemCoeff).appendTo(newDiv);
                $('<a class="close" data-dismiss="alert" href="#">x</a>').appendTo(newDiv);
            }
        });
    }
    function markSelectedTeams(selectedTeamsJson) {
        $('#team-list .alert').each(function (el) {
            var obj = {};
            obj["name"] = $(this).attr("data-name");
            obj["date"] = $(this).attr("data-date");
            obj["country"] = $(this).attr("data-country");
            obj["TBFactor"] = $(this).attr("data-tbfactor");
            obj["totalValue"] = $(this).attr("data-totalValue");
            obj["TMFactor"] = $(this).attr("data-tmfactor");
            var self = this;
            $.each(selectedTeamsJson.team, function (idx, data) {
                if (JSON.stringify(data) == JSON.stringify(obj)) {
                    $(self)
                        .removeClass('alert-standard')
                        .addClass('alert-error');
                    return;
                }
            });
        });
    }
    function markDoneTicket(num, err, inf) {
        var ticketDiv = $('#steps-area').find('.row[data-ticket-num = ' + num + ']');
        if (err) {
            ticketDiv.clone().appendTo('#error-area .accordion-inner').find('.alert').html("Билет №" + parseInt(num + 1) + ":</br>" + inf);
            ticketDiv.find('.alert').attr('class', 'alert fade in');
            $('#error-area').prev().find('a.accordion-toggle').html('Ошибки (' + $('#error-area .accordion-inner > div.row').length + ')');
            $('#rebet-but').html('Повторить непоставленные (' + $('#error-area .accordion-inner > div.row').length + ')');
        } else {
            ticketDiv.appendTo('#done-area .accordion-inner');
            $('#done-area').prev().find('a.accordion-toggle').html('Готово (' + $('#done-area .accordion-inner > div.row').length + ')');
            $('#steps-area').find('.row[data-ticket-num = ' + num + ']').remove();
            $('#error-area').find('.row[data-ticket-num = ' + num + ']').remove();
            $('#error-area').prev().find('a.accordion-toggle').html('Ошибки (' + $('#error-area .accordion-inner > div.row').length + ')');
            $('#rebet-but').html('Повторить непоставленные (' + $('#error-area .accordion-inner > div.row').length + ')');
        }
        $('#steps-area').prev().find('a.accordion-toggle').html('Билеты (' + $('#steps-area .accordion-inner > div.row').length + ')');
    }
    function cBlocksBin(n, k, filterK, filterN_K, anti_block_minus, anti_block_plus) {
        var n_kSet = anti_block_minus ? block(c_n_k(n, n - k), filterN_K, n, true) : block(c_n_k(n, n - k), filterN_K, n, false),
            kSet = anti_block_plus ? block(c_n_k(n, k), filterK, n, true) : block(c_n_k(n, k), filterK, n, false),
            resultSet = new Array,
            itr = 0;
        for (var i = 0; i < kSet.length; i++) {
            for (var j = 0; j < n_kSet.length; j++) {
                var stuck = true;
                for (var z = 0; z < n - k; z++)
                    if (kSet[i].indexOf(n_kSet[j][z]) != -1) {
                        stuck = false;
                        break;
                    }
                if (stuck) {
                    resultSet[itr] = new Array;
                    kSet[i].forEach(function (item) {
                        resultSet[itr][item] = 1;
                    });
                    n_kSet[j].forEach(function (item) {
                        resultSet[itr][item] = 0;
                    });
                    itr++
                }
            }
        }
        return {
            'tickets': resultSet,
            'events': n,
            'ratio': k
        };
    }
    function popBloks(arr, v) {
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < arr[i].length - 1; j++) {
                if (v == 1) {
                    if (arr[i][j] == 1 && arr[i][j + 1] == 1) {
                        arr.splice(i, 1);
                        i--;
                        break;
                    }
                }
                if (v == 0) {
                    if (arr[i][j] == 0 && arr[i][j + 1] == 0) {
                        arr.splice(i, 1);
                        i--;
                        break;
                    }
                }
                if (v == 10) {
                    if (arr[i][j] == arr[i][j + 1]) {
                        arr.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        }
        return arr;
    }
    function checkCountryBlock(input, filterBlocks, onlySelectedBlocks) {
        if (input.length == 0) {
            return filterBlocks.length == 0;
        }
        var w = 0,
            blocks = new Array,
            k = input.length;
        for (var j = 0; j < k - 1; j++) {
            if (input[j] == input[j + 1] - 1) {
                w++;
            } else {
                if (w != 0) {
                    blocks.push(w);
                    w = 0;
                }
            }
        }
        if (w != 0) {
            blocks.push(w);
            w = 0;
        }
        var blockCombs = combinations(blocks);
        for (var comb = 0; comb < blockCombs.length; comb++) {
            var fIter = 0;
            var diff = blockCombs[comb][0];
            for (var b = 0; b < blockCombs[0].length; b++) {
                diff = (fIter == filterBlocks.length - 1 || diff == filterBlocks[fIter]) ? (diff - filterBlocks[fIter]) : (diff - filterBlocks[fIter] - 1);
                if (diff < 0)
                    break;
                if (diff > 0) {
                    fIter++;
                    b--;
                }
                if (diff == 0) {
                    fIter++;
                    diff = blockCombs[comb][b + 1];
                }
                if (fIter == filterBlocks.length) {
                    var filterComb = combinations(filterBlocks);
                    for (var fComb = 0; fComb < filterComb.length; fComb++) {
                        var tmp = input.slice();
                        var fl = true;
                        for (var blockIter = 0; blockIter < filterComb[fComb].length; blockIter++) {
                            var w = 0;
                            for (var inpIter = 0; inpIter < tmp.length - 1; inpIter++) {
                                if (tmp[inpIter] == tmp[inpIter + 1] - 1)
                                    w++;
                                else
                                    w = 0;
                                if (w == filterComb[fComb][blockIter]) {
                                    for (var inv = 0; inv <= w; inv++) {
                                        tmp[inpIter + 1 - inv] = parseInt(blockIter) * -1;
                                    }
                                    break;
                                }
                            }
                        }
                        for (var t = 0; t < tmp.length - 1; t++) {
                            if (tmp[t] != tmp[t + 1] && input[t] == input[t + 1] - 1) {
                                fl = false;
                                break;
                            }
                        }
                        if (fl || !onlySelectedBlocks) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    function popInCountries(arr, checkAllInCoutry, leftCount, rightCount) {
        let countryComb = _countries;
        let varsAmount = 0;

        if (checkAllInCoutry) {
            let convertedArr = [];
            for (var i = 0; i < arr.length; i++) {
                var flArrAll = [];
                convertedArr[i] = [];
                for (var countryName in countryComb) {
                    var countryBlocks = [];
                    convertedArr[i][parseInt(countryName)] = [];
                    var step = 0;
                    var onlyCheck = $('#only' + countryName).length ? $('#only' + countryName)[0].checked : false;
                    for (var j = 0; j < arr[i].length - 1; j++) {
                        if (selectedTeamsJson.team[j].country == countryName && selectedTeamsJson.team[j + 1].country == countryName) {
                            if (arr[i][j] == arr[i][j + 1]) {
                                countryBlocks.pushIfNotExist(j + step, e => (j + step) == e);
                                countryBlocks.pushIfNotExist(j + step + 1, e => (j + step + 1) == e);
                            }
                            if ((arr[i][j] == 0 && arr[i][j + 1] == 1) || (arr[i][j] == 1 && arr[i][j + 1] == 0)) {
                                step++;
                            }
                        }
                    }
                    convertedArr[i][parseInt(countryName)].push({
                        'name': countryName,
                        'blocks': countryBlocks.length == 0 ? false : countryBlocks.slice()
                    });
                }
            }
            let filterCombs = [];
            for (var countryName in countryComb) {
                let combs = getComposotions(countryComb[countryName].team.length);

                for (let i = 0; i < combs.length; i++) {
                    for (let j = 0; j < combs[i].length; j++) {
                        if (combs[i][j] - 1 > 0) combs[i][j]--;
                    }
                }
                filterCombs.push(combs);
            }
            filterCombs = cartesianProductOf(...filterCombs);

            var newArr = [];
            for (let fComb of filterCombs) {
                let counter = 0;
                let flags = [];
                for (let ticketObj of convertedArr) {
                    let flag = true;
                    for (let countryFilter = 0; countryFilter < fComb.length; countryFilter++) {
                        if (ticketObj[countryFilter + 1][0]['blocks'] == false && isEqualArrays(fComb[countryFilter], [0])) {
                            continue;
                        }
                        if (ticketObj[countryFilter + 1][0]['blocks'] != false && checkCountryBlock(ticketObj[countryFilter + 1][0]['blocks'], fComb[countryFilter], true)) {
                            continue;
                        }
                        flag = false;
                    }
                    flags.push(flag);
                    counter += flag;
                }
                if (counter >= leftCount && counter <= rightCount) {
                    for (let i = 0; i < flags.length; i++) {
                        if (flags[i]) newArr.pushIfNotExist(arr[i], (e) => isEqualArrays(e, arr[i]));
                    }
                }
            }
            return newArr;
        }
        let tmpArr = arr.slice();
        for (var i = 0; i < tmpArr.length; i++) top2: {
            var flArrAll = [];
            for (var countryName in countryComb) {
                var countryBlocks = [];
                var step = 0;
                var onlyCheck = $('#only' + countryName).length ? $('#only' + countryName)[0].checked : false;
                for (var j = 0; j < tmpArr[i].length - 1; j++) {
                    if (selectedTeamsJson.team[j].country == countryName && selectedTeamsJson.team[j + 1].country == countryName) {
                        if (tmpArr[i][j] == tmpArr[i][j + 1]) {
                            countryBlocks.pushIfNotExist(j + step, e => (j + step) == e);
                            countryBlocks.pushIfNotExist(j + step + 1, e => (j + step + 1) == e);
                        }
                        if ((tmpArr[i][j] == 0 && tmpArr[i][j + 1] == 1) || (tmpArr[i][j] == 1 && tmpArr[i][j + 1] == 0)) {
                            step++;
                        }
                    }
                }
                if ($('input#without' + countryName).length && $('input#without' + countryName)[0].checked && countryBlocks.length != 0) {
                    tmpArr.splice(i, 1);
                    i--;
                    break top2;
                }
                if (countryComb[countryName].blocks && !$.isEmptyObject(countryComb[countryName].blocks)) {
                    var filterBlocks = [];
                    for (var b = 0; b < countryComb[countryName].blocksOrder.length; b++) {
                        for (var inB = 0; inB < countryComb[countryName].blocks[countryComb[countryName].blocksOrder[b]]; inB++) {
                            filterBlocks.push(parseInt(countryComb[countryName].blocksOrder[b]) - 1);
                        }
                    }

                    var fl = checkCountryBlock(countryBlocks, filterBlocks, onlyCheck);
                    flArrAll.push(fl);
                }
                if (countryComb[countryName].antiBlocks && !$.isEmptyObject(countryComb[countryName].antiBlocks)) {
                    var filterBlocks = [];
                    for (var b = 0; b < countryComb[countryName].antiBlocksOrder.length; b++) {
                        for (var inB = 0; inB < countryComb[countryName].antiBlocks[countryComb[countryName].antiBlocksOrder[b]]; inB++) {
                            filterBlocks.push(parseInt(countryComb[countryName].antiBlocksOrder[b]) - 1);
                        }
                    }
                    var fl = !checkCountryBlock(countryBlocks, filterBlocks, onlyCheck);
                    flArrAll.push(fl);
                }
            }
            var fl = true;
            for (var f = 0; f < flArrAll.length; f++) {
                fl *= flArrAll[f];
            }
            if (!fl) {
                tmpArr.splice(i, 1);
                i--;
            }
        }
        return tmpArr;
    }
    function popByBloksAmount(teamsArray, fromBlock, toBlock) {
        for (let i = 0; i < teamsArray.length; i++) {
            let blocksCounter = 0;
            let blockSize = 1;
            for (let j = 0; j < teamsArray[i].length; j++) {
                if (teamsArray[i][j] == teamsArray[i][j + 1]) {
                    blockSize += 1;
                } else {
                    if (blockSize > 1) {
                        blocksCounter += 1;
                        blockSize = 1;
                    }
                }
            }
            if (blocksCounter < fromBlock || blocksCounter > toBlock) {
                teamsArray.splice(i, 1);
                i--;
            }
        }
    }
    function popByCoeff(arr) {
        if ($('#total-coeff-coeff-check').prop('checked') || $('#plus-coeff-slider-check').prop('checked') || $('#minus-coeff-slider-check').prop('checked')) {
            for (var i = 0; i < arr.length; i++) {
                let coeff = 1,
                    TBCounter = 0,
                    TMCounter = 0;
                for (var j = 0; j < arr[i].length; j++) {
                    coeff = arr[i][j] == 1 ? parseFloat(selectedTeamsJson.team[j].TBFactor) * coeff : parseFloat(selectedTeamsJson.team[j].TMFactor) * coeff;
                    if ($('#plus-coeff-slider-check').prop('checked')) {
                        if (coeffTB > 0 && arr[i][j] == 1) {
                            if ($('#plus-strong-check').prop('checked') && parseFloat(selectedTeamsJson.team[j].TBFactor) > parseFloat(coeffTB)) {
                                TBCounter += 1;
                            }
                            if (!$('#plus-strong-check').prop('checked') && parseFloat(selectedTeamsJson.team[j].TBFactor) >= parseFloat(coeffTB)) {
                                TBCounter += 1;
                            }
                        }
                        if (coeffTB < 0 && arr[i][j] == 1) {
                            if ($('#minus-strong-check').prop('checked') && parseFloat(selectedTeamsJson.team[j].TBFactor) < parseFloat(coeffTB) * -1) {
                                TBCounter += 1;
                            }
                            if (!$('#minus-strong-check').prop('checked') && parseFloat(selectedTeamsJson.team[j].TBFactor) <= parseFloat(coeffTB) * -1) {
                                TBCounter += 1;
                            }
                        }
                    }
                    if ($('#minus-coeff-slider-check').prop('checked')) {
                        if (coeffTM > 0 && arr[i][j] == 0) {
                            if ($('#minus-strong-check').prop('checked') && parseFloat(selectedTeamsJson.team[j].TMFactor) > parseFloat(coeffTM)) {
                                TMCounter += 1;
                            }
                            if (!$('#minus-strong-check').prop('checked') && parseFloat(selectedTeamsJson.team[j].TMFactor) >= parseFloat(coeffTM)) {
                                TMCounter += 1;
                            }
                        }
                        if (coeffTM < 0 && arr[i][j] == 0) {
                            if ($('#minus-strong-check').prop('checked') && parseFloat(selectedTeamsJson.team[j].TMFactor) < parseFloat(coeffTM) * -1) {
                                TMCounter += 1;
                            }
                            if (!$('#minus-strong-check').prop('checked') && parseFloat(selectedTeamsJson.team[j].TMFactor) <= parseFloat(coeffTM) * -1) {
                                TMCounter += 1;
                            }
                        }
                    }
                }
                let flag = false;
                if ((coeff < coeffLeft || (coeff > coeffRight && coeffRight != 20000)) && $('#total-coeff-coeff-check').prop('checked')) {
                    flag = true;
                }
                if ((TBCounter < coeffLeftTB || TBCounter > coeffRightTB) && $('#plus-coeff-slider-check').prop('checked')) {
                    flag = true;
                }
                if ((TMCounter < coeffLeftTM || TMCounter > coeffRightTM) && $('#minus-coeff-slider-check').prop('checked')) {
                    flag = true;
                }
                if (flag) {
                    arr.splice(i, 1);
                    i--;
                }
            }
        }
    }

    function addTicketsToContainer(tickets, container) {
        let lsTickets = JSON.parse(localStorage.getItem(container));
        if (lsTickets && lsTickets.ticket.length) {
            lsTickets.ticket = cartesianProductOf(lsTickets.ticket, tickets.ticket)
                .map(t => t.reduce((a, b) => a.concat(b)));
        } else {
            lsTickets = tickets;
        }
        localStorage.setItem(container, JSON.stringify(lsTickets));
    }
    
    function printContainer(container) {
        $('.stp').remove();
        let totalTickets = container.ticket.length;
        var newEl = $('<div class="span24 cont stp"></div>').appendTo('#res-col-1');
        newEl = $('<div class="accordion-group stp"></div>').appendTo(newEl);
        var innner = $('<div class="accordion-body collapse stp"></div>').appendTo(newEl)
            .attr('id', 'steps-area');
        innner = $('<div class="accordion-inner stp"></div>').appendTo(innner)
        newEl = $('<div class="accordion-heading accordionize stp"></div>').prependTo(newEl);
        newEl = $('<a class="accordion-toggle stp" data-toggle="collapse" data-parent="#accordionArea"></a>')
            .appendTo(newEl)
            .text('Билеты (' + totalTickets + ')')
            .attr('href', '#steps-area');
        var newEl2 = $('<div class="span24 cont stp"></div>').appendTo('#res-col-1');
        newEl2 = $('<div class="accordion-group stp"></div>').appendTo(newEl2);
        var innner2 = $('<div class="accordion-body collapse stp"></div>').appendTo(newEl2)
            .attr('id', 'done-area');
        innner2 = $('<div class="accordion-inner stp"></div>').appendTo(innner2)
        newEl2 = $('<div class="accordion-heading accordionize stp"></div>').prependTo(newEl2);
        newEl2 = $('<a class="accordion-toggle stp" data-toggle="collapse" data-parent="#accordionArea"></a>')
            .appendTo(newEl2)
            .text('Готово (0)')
            .attr('href', '#done-area');
        var newEl2 = $('<div class="span24 cont stp"></div>').appendTo('#res-col-1');
        newEl2 = $('<div class="accordion-group stp"></div>').appendTo(newEl2);
        var innner2 = $('<div class="accordion-body collapse stp"></div>').appendTo(newEl2)
            .attr('id', 'error-area');
        innner2 = $('<div class="accordion-inner stp"></div>').appendTo(innner2)
        newEl2 = $('<div class="accordion-heading accordionize stp"></div>').prependTo(newEl2);
        newEl2 = $('<a class="accordion-toggle stp" data-toggle="collapse" data-parent="#accordionArea"></a>')
            .appendTo(newEl2)
            .text('Ошибки (0)')
            .attr('href', '#error-area');
        $('<a id="start-but" class="button button-large dynamic stp">Старт</a>')
            .appendTo('#buttons');
        $('<a id="pause-but" class="button button-large dynamic stp">Пауза</a>')
            .appendTo('#buttons');
        $('<a id="stop-but" class="button button-large dynamic stp">Стоп</a>')
            .appendTo('#buttons');
        $('<a id="rebet-but" class="button button-large dynamic stp">Повторить непоставленные (0)</a>')
            .appendTo('#buttons');
        $('<a id="show-container" class="button button-large dynamic stp">Контейнер</a>')
            .appendTo('#buttons');
        $('<a id="clear-container" class="button button-large dynamic stp">X</a>')
            .appendTo('#buttons');
        $('<a id="rem-tikets" class="button button-large dynamic stp">-</a>')
            .appendTo('#buttons');
        $('<a id="add-tikets" class="button button-large dynamic stp">+</a>')
            .appendTo('#buttons');

        var tCont = "",
            tCont2 = "";

        var plusSymbol = '<span style="color: #333;font-size: 140%"> + </span>';
        var minusSymbol = '<span style="color:#333;font-size: 145%"> - </span>';
        let currentIter = 1;
        //for (let ticket of container) {
        let ticket = container.ticket;
        for (var i = 0; i < ticket.length; i++) {
            let coeff = 1;
            //coeff2 = 1;
            var newEll = $('<div class="row cont stp">').appendTo('#steps-area .accordion-inner')
                .attr('data-ticket-num', i);
            var newDiv = ((currentIter - 1) % 2 == 0) ?
                $('<div class="alert alert-error fade in span24 stp">').appendTo(newEll) :
                $('<div class="alert alert-info fade in span24 stp">').appendTo(newEll);
            //var newDiv2 = ((currentIter - 1) % 2 == 0) ?
            //$('<div class="alert alert-error fade in span24 stp">').appendTo(newEll) :
            //$('<div class="alert alert-info fade in span24 stp">').appendTo(newEll);
            tCont = "";
            //tCont2 = "";
            //ticketsJson.ticket[currentIter - 1] = [];
            for (var j = 0; j < ticket[i].length; j++) {
                // var dist = 0;
                // for (var ii = j + 1; ii < arr[i].length; ii++) {
                // 	if (arr[i][j].bet == arr[i][ii].bet) break;
                // 	dist++;
                // 	if (ii == arr[i].length - 1) dist = 0;
                // }
                coeff = parseFloat(ticket[i][j].coeff) * coeff;
                //coeff2 = arr[i][j] == 0 ? parseFloat(selectedTeamsJson.team[j].TBFactor) * coeff2 : parseFloat(selectedTeamsJson.team[j].TMFactor) * coeff2;
                var prName = "&nbsp;" + ticket[i][j].name + " " + ticket[i][j].date;
                tCont += parseInt(j + 1) + '. ';
                //tCont2 += parseInt(j + 1) + '. ';
                //var plusArrow = k_ <= n_ - k_ && dist != 0 ? ('<span style="color:black;font-size: 120%">' + " &darr; " + dist + '</span>') : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                //var minusArrow = k_ > n_ - k_ && dist != 0 ? ('<span style="color:black;font-size: 120%">' + " &darr; " + dist + '</span>') : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                let TBCoeff = ' <span style="color:black;font-size: 120%">x' + parseFloat(ticket[i][j].coeff).toFixed(2) + '</span>';
                //let TMCoeff = ' <span style="color:black;font-size: 120%">x' + parseFloat(selectedTeamsJson.team[j].TMFactor).toFixed(2) + '</span>';

                tCont += (ticket[i][j].bet == 1) ? (plusSymbol + prName + TBCoeff + "</br>") : (minusSymbol + prName + TBCoeff + "</br>");
                //tCont2 += (arr[i][j] == 0) ? plusSymbol + (plusArrow + prName + TBCoeff + "</br>") : (minusSymbol + minusArrow + prName + TMCoeff + "</br>");
                // var obj = {};
                // obj['name'] = selectedTeamsJson.team[j].name;
                // obj['date'] = selectedTeamsJson.team[j].date;
                // obj['bet'] = arr[i][j];
                // obj['coeff'] = coeff;
                // ticketsJson.ticket[currentIter - 1][j] = obj;
            }
            tCont = `Билет №${parseInt(currentIter)} x${coeff.toFixed(3)} </br> ${tCont}`;
            //tCont2 = `Билет №${parseInt(currentIter)} | ${inpObj.ratio}/${inpObj.events - inpObj.ratio} | x${coeff2.toFixed(3)} </br> ${tCont2}`;
            newDiv.html(tCont);
            //newDiv2.html(tCont2);
            document.title = parseInt(currentIter) + " из " + totalTickets;
            newEl.text(`Билеты (${currentIter}/${totalTickets})`);
            currentIter++;
        }
        //}
        newEl.text('Билеты (' + totalTickets + ')');
        // if (!JSON.parse(localStorage.getItem('tickets')).ticket.length) {
        // 	localStorage.setItem('tickets', JSON.stringify(ticketsJson));
        // }
    }
    function print2DemArr(inpArr) {
        $('.stp').remove();
        let totalTickets = 0;
        for (let i of inpArr) {
            totalTickets += i.tickets.length;
        }
        ticketsJson = { "ticket": [] };

        var newEl = $('<div class="span24 cont stp"></div>').appendTo('#res-col-1');
        newEl = $('<div class="accordion-group stp"></div>').appendTo(newEl);
        var innner = $('<div class="accordion-body collapse stp"></div>').appendTo(newEl)
            .attr('id', 'steps-area');
        innner = $('<div class="accordion-inner stp"></div>').appendTo(innner)
        newEl = $('<div class="accordion-heading accordionize stp"></div>').prependTo(newEl);
        newEl = $('<a class="accordion-toggle stp" data-toggle="collapse" data-parent="#accordionArea"></a>')
            .appendTo(newEl)
            .text('Билеты (' + totalTickets + ')')
            .attr('href', '#steps-area');
        var newEl2 = $('<div class="span24 cont stp"></div>').appendTo('#res-col-1');
        newEl2 = $('<div class="accordion-group stp"></div>').appendTo(newEl2);
        var innner2 = $('<div class="accordion-body collapse stp"></div>').appendTo(newEl2)
            .attr('id', 'done-area');
        innner2 = $('<div class="accordion-inner stp"></div>').appendTo(innner2)
        newEl2 = $('<div class="accordion-heading accordionize stp"></div>').prependTo(newEl2);
        newEl2 = $('<a class="accordion-toggle stp" data-toggle="collapse" data-parent="#accordionArea"></a>')
            .appendTo(newEl2)
            .text('Готово (0)')
            .attr('href', '#done-area');
        var newEl2 = $('<div class="span24 cont stp"></div>').appendTo('#res-col-1');
        newEl2 = $('<div class="accordion-group stp"></div>').appendTo(newEl2);
        var innner2 = $('<div class="accordion-body collapse stp"></div>').appendTo(newEl2)
            .attr('id', 'error-area');
        innner2 = $('<div class="accordion-inner stp"></div>').appendTo(innner2)
        newEl2 = $('<div class="accordion-heading accordionize stp"></div>').prependTo(newEl2);
        newEl2 = $('<a class="accordion-toggle stp" data-toggle="collapse" data-parent="#accordionArea"></a>')
            .appendTo(newEl2)
            .text('Ошибки (0)')
            .attr('href', '#error-area');
        $('<a id="start-but" class="button button-large dynamic stp">Старт</a>')
            .appendTo('#buttons');
        $('<a id="pause-but" class="button button-large dynamic stp">Пауза</a>')
            .appendTo('#buttons');
        $('<a id="stop-but" class="button button-large dynamic stp">Стоп</a>')
            .appendTo('#buttons');
        $('<a id="rebet-but" class="button button-large dynamic stp">Повторить непоставленные (0)</a>')
            .appendTo('#buttons');
        $('<a id="show-container" class="button button-large dynamic stp">Контейнер</a>')
            .appendTo('#buttons');
        $('<a id="clear-container" class="button button-large dynamic stp">X</a>')
            .appendTo('#buttons');
        $('<a id="rem-tikets" class="button button-large dynamic stp">-</a>')
            .appendTo('#buttons');
        $('<a id="add-tikets" class="button button-large dynamic stp">+</a>')
            .appendTo('#buttons');


        var tCont = "",
            tCont2 = "";

        var plusSymbol = '<span style="color: #333;font-size: 140%"> + </span>';
        var minusSymbol = '<span style="color:#333;font-size: 145%"> - </span>';
        let currentIter = 1;
        for (let inpObj of inpArr) {
            let arr = inpObj.tickets;
            for (var i = 0; i < arr.length; i++) {
                let coeff = 1,
                    coeff2 = 1;
                var newEll = $('<div class="row cont stp">').appendTo('#steps-area .accordion-inner')
                    .attr('data-ticket-num', i);
                var newDiv = ((currentIter - 1) % 2 == 0) ?
                    $('<div class="alert alert-error fade in span24 stp">').appendTo(newEll) :
                    $('<div class="alert alert-info fade in span24 stp">').appendTo(newEll);
                var newDiv2 = ((currentIter - 1) % 2 == 0) ?
                    $('<div class="alert alert-error fade in span24 stp">').appendTo(newEll) :
                    $('<div class="alert alert-info fade in span24 stp">').appendTo(newEll);
                tCont = "";
                tCont2 = "";
                ticketsJson.ticket[currentIter - 1] = [];
                for (var j = 0; j < arr[i].length; j++) {
                    var dist = 0;
                    for (var ii = j + 1; ii < arr[i].length; ii++) {
                        if (arr[i][j] == arr[i][ii]) break;
                        dist++;
                        if (ii == arr[i].length - 1) dist = 0;
                    }
                    coeff = arr[i][j] == 1 ? parseFloat(selectedTeamsJson.team[j].TBFactor) * coeff : parseFloat(selectedTeamsJson.team[j].TMFactor) * coeff;
                    coeff2 = arr[i][j] == 0 ? parseFloat(selectedTeamsJson.team[j].TBFactor) * coeff2 : parseFloat(selectedTeamsJson.team[j].TMFactor) * coeff2;
                    var prName = "&nbsp;" + selectedTeamsJson.team[j].name + " " + selectedTeamsJson.team[j].date;
                    tCont += parseInt(j + 1) + '. ';
                    tCont2 += parseInt(j + 1) + '. ';
                    var plusArrow = k_ <= n_ - k_ && dist != 0 ? ('<span style="color:black;font-size: 120%">' + " &darr; " + dist + '</span>') : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                    var minusArrow = k_ > n_ - k_ && dist != 0 ? ('<span style="color:black;font-size: 120%">' + " &darr; " + dist + '</span>') : "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                    let TBCoeff = ' <span style="color:black;font-size: 120%">x' + parseFloat(selectedTeamsJson.team[j].TBFactor).toFixed(2) + '</span>';
                    let TMCoeff = ' <span style="color:black;font-size: 120%">x' + parseFloat(selectedTeamsJson.team[j].TMFactor).toFixed(2) + '</span>';

                    tCont += (arr[i][j] == 1) ? (plusSymbol + plusArrow + prName + TBCoeff + "</br>") : (minusSymbol + minusArrow + prName + TMCoeff + "</br>");
                    tCont2 += (arr[i][j] == 0) ? plusSymbol + (plusArrow + prName + TBCoeff + "</br>") : (minusSymbol + minusArrow + prName + TMCoeff + "</br>");
                    var obj = {};
                    obj['name'] = selectedTeamsJson.team[j].name;
                    obj['date'] = selectedTeamsJson.team[j].date;
                    obj['bet'] = arr[i][j];
                    obj['coeff'] = (arr[i][j] == 1) ? parseFloat(selectedTeamsJson.team[j].TBFactor) : parseFloat(selectedTeamsJson.team[j].TMFactor);
                    ticketsJson.ticket[currentIter - 1][j] = obj;
                }
                tCont = `Билет №${parseInt(currentIter)} | ${inpObj.ratio}/${inpObj.events - inpObj.ratio} | x${coeff.toFixed(3)} </br> ${tCont}`;
                tCont2 = `Билет №${parseInt(currentIter)} | ${inpObj.ratio}/${inpObj.events - inpObj.ratio} | x${coeff2.toFixed(3)} </br> ${tCont2}`;
                newDiv.html(tCont);
                newDiv2.html(tCont2);
                document.title = parseInt(currentIter) + " из " + totalTickets;
                newEl.text(`Билеты (${currentIter}/${totalTickets})`);
                currentIter++;
            }
        }
        newEl.text('Билеты (' + totalTickets + ')');
    }
});