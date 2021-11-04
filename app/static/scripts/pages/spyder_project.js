//var domane = 'https://colak.eu.pythonanywhere.com/';
var domane = 'http://localhost:8000/';

function get_data_for_ticker(){
    $('#candidate-flash').empty();
    ticker=$('#txt_ticker').val();
    if(ticker == ""){
        $('#candidate-flash').append(flashMessage("danger","Ticker is must!"));
    }
    else{
        $('#candidate-flash').empty();
        var loading = $(".candidate-loading")
        var spinner = $('<div class="spinner-border text-info" role="status"><span class="sr-only">Loading...</span></div>');
        loading.empty();
        loading.append(spinner);
        url = domane + 'research/get_info_ticker/' + ticker
        $.getJSON(url, function(data) {
            //var data_parsed = jQuery.parseJSON(data);
            if (data.longName == undefined)
            {
                $('#candidate-flash').append(flashMessage("danger","Wrong ticker"));
            }
            else{
                $('#txt_company_name').val(data.longName);
                $('#txt_company_description').val(data.longBusinessSummary);
                $('#txt_exchange').val(data.exchange);
                $('#txt_industry').val(data.industry);
                $('#txt_sector').val(data.sector);
                $('#txt_logo').val(data.logo_url);
                $('#txt_ticker').val($('#txt_ticker').val().toUpperCase());
                $('.content-hidden').prop('hidden',false);
                $("#btn_submit").prop('disabled', false);
            }
            loading.empty();
        })
    }
}

function update_candidate(remove_candidate_event, change_enabled_event){
    $('#candidate-flash').empty();
    ticker = $('#txt_ticker').val();
    reason = $('#txt_reason').val();
    email = $('#user-email').val();

    var loading = $(".candidate-loading")
    var spinner = $('<div class="spinner-border text-info" role="status"><span class="sr-only">Loading...</span></div>');
    loading.empty();
    loading.append(spinner);
    $('.content-hidden').prop('hidden',true);
    url = domane + 'candidates/updatecandidate/';
    $.post(url,{ticker: ticker, reason: reason, email: email}, function(data) {
        //candidates and market_data - global prop from today page
        var candidate = $.grep( candidates, function( n, i ) { return n.ticker == ticker;});
        if(candidate.length == 0){
            c = {
                logo: $('#txt_logo').val(),
                ticker: ticker,
                company_name: $('#txt_company_name').val(),
                sector: $('#txt_sector').val(),
                reason: reason,
                enabled: true
            };
            candidates.push(c);
            if(candidates.length <= 5){
                add_row_to_personal_candidates(c, market_data, 'personal-tbl', false);//from base.js
            }
            add_row_to_personal_candidates(c, market_data, 'personal-modal-tbl', true);  //from base.js
            $('#remove-' + c.ticker).on('click',remove_candidate_event);
            $('#enabled-' + c.ticker).on('click',change_enabled_event);
//            $('.personal-modal-tbl').on('click', '#remove-' + c.ticker, remove_candidate_event(ticker))
        }
        else{
            candidate.reason = reason;
        }
        loading.empty();
        $("#add_candidate_modal").hide();
    })
}

function update_market_data(ticker){
    url = domane + 'research/updatemarketdataforcandidate/';
    $.post(url,{ticker_to_update: ticker}, function(data) {
            window.location.reload();
    })
}





