$(document).ready(function () {

    $(window).resize(function() {
        set_min_height_to_divs();
    }).resize();

    var emotion_settings = parseInt($('#user-emotion').val());
    var user_email = $('#user_email').val();
    var main_snp = [];
    var main_emotion = [];
    var count_days_emotion = 0;

    fill_sectors_dropdown_list();
    upload_personal_list();
    upload_today_improovers_data();
    upload_telegram_signals();
    get_stock_news();
    upload_top_candidates_data("all");
    fill_emotion_and_snp_graphs(emotion_settings, false, main_snp, main_emotion);

    $('.sectors-dropdown').on('change',function(){
        $('.sector-item').removeAttr('selected');
        $('.sector-item[value="' + $(this).val() + '"]').attr('selected', true);
        upload_top_candidates_data($(this).val());
    })

//    echartsLineAreaChartInit();

})

function fill_sectors_dropdown_list(){
    url = '/candidates/candidates_sectors';
    $.getJSON(url, function(data) {
//        $('.improovers-tbl tbody').empty();
//        $('.improovers-modal-tbl tbody').empty();
        $.each(data, function( index, c ){
            var option = $('<option  class="sector-item" value="' + c.sector + '">' + c.sector + '</option>');
            $('.sectors-dropdown').append(option);
        })
    });
}

function get_stock_news(){
    loading('news-card-body');
    $.getJSON("/api/stock_all_news", function(data) {
        $.each(data, function( index, c ){
            if(parseInt(index) < 5){
                add_row_to_today_news(c, 'news-top')       //from base.js
            }
            add_row_to_today_news(c, 'news-top-modal')       //from base.js
        })
        stop_loading('news-card-body'); //from base.js
    })
}

function set_min_height_to_divs(){
    if(screen.width > 767){
        var height = Math.max($('.improovers').height(), $('.personal-list').height(), $('.signals').height());
        $('.personal-list').css('min-height', height);
        $('.signals').css('min-height', height);
        $('.improovers').css('min-height', height);
    }
}

function upload_today_improovers_data(){
    loading('improovers-card-body');
    url = '/candidates/today_improovers';
    $.getJSON(url, function(data) {
        draw_today_improovers_tbl(data);
        stop_loading('improovers-card-body');
    });
}

function upload_top_candidates_data(sector){
    $('.top-candidates-tbl tbody').empty();
    $('.top-candidates-modal-tbl tbody').empty();
    loading('top-candidates-card-body');
    loading('top-candidates-modal-body');
    url = '/candidates/top_candidates';
    $.getJSON(url,{sector: sector}, function(data) {
        draw_top_candidates_tbl(data);
        stop_loading('top-candidates-card-body');
        stop_loading('top-candidates-modal-body');
    });
}

function upload_personal_list(){
    loading('personal-list-card-body');
    url = '/candidates/user_candidates';
    $.getJSON(url, function(data) {
        if(data.length >0){
            $('.add-tickers-card').addClass('d-none');
            $('.personal-list .div-content').removeClass('d-none');
            $('.personal-list .card-footer').removeClass('d-none');
            draw_user_candidates_tbl(data); //from base.js
        }
        else{
            $('.add-tickers-card').removeClass('d-none');
            $('.personal-list .div-content').addClass('d-none');
            $('.personal-list .card-footer').addClass('d-none');
        }
        stop_loading('personal-list-card-body');
    });
}

function upload_telegram_signals(){
    loading('signals-card-body');
    url = '/candidates/telegram_signals';
    $.getJSON(url, function(data) {
        draw_telegram_signals_tbl(data);
        stop_loading('signals-card-body');
    });
}

function change_enabled(ticker, enabled){
    if($(this).data('ticker') != undefined){
        ticker = $(this).data('ticker');
        enabled = $(this).is(':checked');
    }
    $.post("/candidates/enabledisable_ajax",{ticker: ticker}, function(data) {
        var data_parsed = jQuery.parseJSON(data);
        create_toast(data_parsed["color_status"], 'Enable result', data_parsed["message"]);
        if(data_parsed["color_status"]=='success'){
            $('#action-enabled-' + ticker).prop('checked', enabled);
            $('#enabled-' + ticker).prop('checked', enabled);
        }
    });
}

function remove_candidate(ticker){
    if($(this).data('ticker') != undefined){
        ticker = $(this).data('ticker');
    }
    loading('personal-list-card-body'); //from base.js
    $.post("/candidates/removecandidate_ajax",{ticker: ticker}, function(data) {
        var data_parsed = jQuery.parseJSON(data);
        if(data_parsed.length >0){
            $('.add-tickers-card').addClass('d-none');
            $('.personal-list .div-content').removeClass('d-none');
            $('.personal-list .card-footer').removeClass('d-none');
            draw_user_candidates_tbl(data_parsed); //from base.js
        }
        else{
            $('.add-tickers-card').removeClass('d-none');
            $('.personal-list .div-content').addClass('d-none');
            $('.personal-list .card-footer').addClass('d-none');
        }
        create_toast('success', 'Success', 'Ticker removed from your favorits list');
        stop_loading('personal-list-card-body'); //from base.js
    });
}

function edit_candidate(){
    $('.ticker-desc').val('');
    $('.candidate-bottom').prop('hidden', true);
    $('.loading-section').removeClass('d-none');
    ticker=$(this).siblings('.h_tick')[0].value;
    reason=$(this).siblings('.h_reason')[0].value;
    $('#modal-search .search-input').val(ticker);
    $('#txt_reason').val(reason);
    get_ticker_info(ticker);
    $('.loading-section').addClass('d-none');
}

function draw_today_improovers_tbl(data){
    $('.improovers-tbl tbody').empty();
    $('.improovers-modal-tbl tbody').empty();
    $.each(data, function( index, c ){
        if(parseInt(index) < 5){
            add_row_to_today_improovers(c, 'improovers-tbl')       //from base.js
        }
        add_row_to_today_improovers(c, 'improovers-modal-tbl')       //from base.js
    })
}

function draw_top_candidates_tbl(data){
    $('.top-candidates-tbl tbody').empty();
    $('.top-candidates-modal-tbl tbody').empty();
    $.each(data, function( index, c ){
        if(parseInt(index) < 5){
            add_row_to_top_candidates(c, 'top-candidates-tbl')       //from base.js
        }
        add_row_to_top_candidates(c, 'top-candidates-modal-tbl')       //from base.js
    })
}

function draw_telegram_signals_tbl(data){
    $('.signals-tbl tbody').empty();
    $('.signals-modal-tbl tbody').empty();
    $.each(data, function( index, c ){
        if(parseInt(index) < 5){
            add_row_to_telegram_signals(c, 'signals-tbl', false)
        }
        add_row_to_telegram_signals(c, 'signals-modal-tbl', true)
    })
}

function draw_user_candidates_tbl(data){
    $('.personal-tbl tbody').empty();
    $('.personal-modal-tbl tbody').empty();
    $.each(data, function( index, c ){
        if(parseInt(index) < 5){
            add_row_to_personal_candidates(c, 'personal-tbl', false)       //from base.js
        }
        add_row_to_personal_candidates(c, 'personal-modal-tbl', true)       //from base.js
        $('#remove-' + c.ticker).on('click',remove_candidate);
        $('#action-remove-' + c.ticker).on('click',remove_candidate);
        $('#enabled-' + c.ticker).on('click',change_enabled);
        $('#action-enabled-' + c.ticker).on('click',change_enabled);
        $('#edit-' + c.ticker).on('click',edit_candidate);
        $('#action-edit-' + c.ticker).on('click',edit_candidate);
    })
}

function add_row_to_personal_candidates(c, tbl_class, is_modal){
    var score = c.algotrader_rank || 0;
    var under_priced_pnt = c.under_priced_pnt != null ? c.under_priced_pnt.toFixed(2) : 0;
    var twelve_month_momentum = c.twelve_month_momentum != null ? c.twelve_month_momentum.toFixed(2) : 0;
    var beta = c.beta != null ? c.beta.toFixed(2) : 0;
    var max_intraday_drop_percent = c.max_intraday_drop_percent != null ? c.max_intraday_drop_percent.toFixed(2) : 0;
    var tr = $('<tr class="btn-reveal-trigger" title="' + c.reason + '"></tr>');
    var td_logo =$('<td class="text-center p-0 pt-2 pe-2"><img src="' + c.logo + '" onerror="this.src=\'/static/images/default_ticker.png\'" width="20" height="20"></td>');
    tr.append(td_logo);
    var td_company = $('<td class="p-0"><a class="fs--1" href="/candidates/info/' + c.ticker + '">' + c.ticker + '</a><div class="fs--2">' + c.company_name + '</div></td>');
    tr.append(td_company);
    if(is_modal){
        var td_remove = $('<td class="text-center p-0 pt-2"><button id="remove-' + c.ticker +'" type="submit" data-ticker="' + c.ticker + '" class="border-0 bg-body remove-candidate"><i class="fa fa-trash"></i></button></td>');
        tr.append(td_remove);
        var td_edit = $('<td class="text-center p-0 pt-2"><button data-bs-toggle="modal" data-bs-target="#add-candidate-modal" class="btn_edit border-0 bg-body" id="edit-' + c.ticker + '"><i class="fa fa-edit mt-1"></i></button><input type="hidden" class="h_tick" value="' + c.ticker + '"><input type="hidden" class="h_reason" value="' + c.reason + '"></td>');
        tr.append(td_edit);
        var td_enabled = $('<td class="text-center p-0 pt-2"><input class="form-check-input enable-checkbox" id="enabled-' + c.ticker + '" data-ticker="' + c.ticker + '" type="checkbox"></td>');
        tr.append(td_enabled);
    }

    var td_score = $('<td class="text-center p-0 pt-2">'+score+'</td>');
    tr.append(td_score);

    if(is_modal){
        var td_sector = $('<td class="p-0 pt-2 text-center fs--1">' + c.sector + '</td>');
        tr.append(td_sector);
        var td_under_price = $('<td class="text-center p-0 pt-2">' + under_priced_pnt + '</td>');
        tr.append(td_under_price);
        var td_momentum = $('<td class="text-center p-0 pt-2">' + twelve_month_momentum + '</td>');
        tr.append(td_momentum);
        var td_beta = $('<td class="text-center p-0 pt-2">' + beta + '</td>');
        tr.append(td_beta);
    }

    var td_intraday_drop = $('<td class="text-center p-0 pt-2">' + max_intraday_drop_percent + '</td>');
    tr.append(td_intraday_drop);

    if(!is_modal){
        var actions = $('<td class="text-end p-0 pt-2"></td>');
        var actions_dropdown = $('<div class="dropdown font-sans-serif position-static"></div>');
        var actions_btn = $('<button class="btn btn-link text-600 btn-sm dropdown-toggle btn-reveal" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false"><span class="fas fa-ellipsis-h fs--1"></span></button>');
        var actions_dropdown_menu = $('<div class="dropdown-menu dropdown-menu-end border py-0"></div>');
        var actions_div = $('<div class="bg-white py-2"></div>');
        var actions_edite = $('<button data-bs-toggle="modal" data-bs-target="#add-candidate-modal" class="dropdown-item btn_edit border-0 bg-none" id="action-edit-' + c.ticker + '"><i class="fa fa-edit mt-1"></i><span class="ps-2">Edit</span></button><input type="hidden" class="h_tick" value="' + c.ticker + '"><input type="hidden" class="h_reason" value="' + c.reason + '">');
        var actions_delete = $('<button id="action-remove-' + c.ticker +'" type="submit" data-ticker="' + c.ticker + '" class="dropdown-item border-0 bg-none remove-candidate"><i class="fa fa-trash"></i><span class="ps-2">Delete</span></button>');
        var enabled = $('<div class="dropdown-item"><input class="mt-2 enable-checkbox" id="action-enabled-' + c.ticker + '" data-ticker="' + c.ticker + '" type="checkbox"><span class="ps-2">Enabled</span></div>');
        actions_div.append(actions_edite);
        actions_div.append(actions_delete);
        actions_div.append(enabled);
        actions_dropdown_menu.append(actions_div);
        actions_dropdown.append(actions_btn);
        actions_dropdown.append(actions_dropdown_menu);
        actions.append(actions_dropdown);
        tr.append(actions);
    }
    $('.' + tbl_class + ' tbody').append(tr);
    $('#action-enabled-' + c.ticker).prop('checked', c.enabled);
    $('#enabled-' + c.ticker).prop('checked', c.enabled);
}

function add_row_to_telegram_signals(c, tbl_class, is_modal){
    var price = c.signal_price != null ? c.signal_price.toFixed(2) : 0;
    var target = c.target_price != null ? c.target_price.toFixed(2) : 0;

    var tr = $('<tr></tr>');
    var td_logo =$('<td class="text-center p-0 pt-2 pe-2"><img src="' + c.logo + '" onerror="this.src=\'/static/images/default_ticker.png\'" width="20" height="20"></td>');
    tr.append(td_logo);
    var td_company = $('<td class="p-0"><a class="fs--1" href="/candidates/info/' + c.ticker + '">' + c.ticker + '</a><div class="fs--2">' + c.company_name + '</div></td>');
    tr.append(td_company);

    var td_price = $('<td class="text-center p-0 pt-2 fs--1">'+price+'</td>');
    tr.append(td_price);
    var td_target = $('<td class="text-center p-0 pt-2 fs--1">' + target + '</td>');
    tr.append(td_target);

    if(is_modal){
        var td_received = $('<td class="text-center p-0 pt-2 fs--1">' + c.received + '</td>');
        tr.append(td_received);
    }
    $('.' + tbl_class + ' tbody').append(tr);
}

function add_row_to_today_improovers(c, tbl_class){
    var score = c.last_rank || 0;
    var change = c.change_val != null ? c.change_val.toFixed(2) : 0;
    var tr = $('<tr></tr>');
    var td_logo =$('<td class="text-center p-0 pt-2 pe-2"><img src="' + c.logo + '" onerror="this.src=\'/static/images/default_ticker.png\'" width="20" height="20"></td>');
    tr.append(td_logo);
    var td_company = $('<td class="p-0"><a class="fs--1" href="/candidates/info/' + c.ticker + '">' + c.ticker + '</a><div class="fs--2">' + c.company_name + '</div></td>');
    tr.append(td_company);
    var td_score = $('<td class="text-center p-0 pt-2">' + score + '</td>');
    tr.append(td_score);
    var td_change = $('<td class="text-center text-success p-0 pt-2">' + change + '</td>');
    tr.append(td_change);
    $('.' + tbl_class + ' tbody').append(tr);
}

function add_row_to_top_candidates(c, tbl_class){
    var score = c.algotrader_rank || 0;
    var upside = c.under_priced_pnt || 0;
    var tr = $('<tr></tr>');
    var td_logo =$('<td class="text-center p-0 pt-2 pe-2"><img src="' + c.logo + '" onerror="this.src=\'/static/images/default_ticker.png\'" width="20" height="20"></td>');
    tr.append(td_logo);
    var td_company = $('<td class="p-0"><a class="fs--1" href="/candidates/info/' + c.ticker + '">' + c.ticker + '</a><div class="fs--2">' + c.company_name + '</div></td>');
    tr.append(td_company);
    var color = upside > 0 ? "success" : "danger";
    var td_upside = $('<td class="text-center text-' + color + ' p-0 pt-2">' + upside + '</td>');
    tr.append(td_upside);
    var td_score = $('<td class="text-center p-0 pt-2">' + score + '</td>');
    tr.append(td_score);
    $('.' + tbl_class + ' tbody').append(tr);
}

function add_update_candidate(){
//    loading('add-candidate-body'); //from base.js
    $('.candidate-bottom').prop('hidden', true);
    $('.loading-section').removeClass('d-none');
    ticker = $('#modal-search .search-input').val();
    reason = $('#txt_reason').val();
    email = $('#user-email').val();

    url = SPYDER_API + 'candidates/updatecandidate/';
    $.post(url,{ticker: ticker, reason: reason, email: email}, function(data) {
        var data_parsed = jQuery.parseJSON(data);
        upload_personal_list(); //from base.js
        $('.loading-section').addClass('d-none');
        $('.candidate-bottom').prop('hidden', false);
        create_toast(data_parsed["color_status"], 'Update result', data_parsed["message"]);
//        stop_loading('add-candidate-body'); //from base.js
    })
}

function add_row_to_today_news(c, tbl_class){
    var li =$('<li class="list-group-item"></li>');

    var div = $('<div class="row gx-0 flex-between-center flex-fill d-flex"></div');

    var div_first =$('<div class="col-auto align-self-start"></div');
    var img = $('<img width="100" class="rounded img-fluid" src="' + c.image + '" alt="">');
    var ticker = $('<div><span class="fs--1">Ticker:</span><a href="/candidates/info/' + c.symbol + '" class="ps-2 fs--1">' + c.symbol + '</a></div>');
    var div_img_content = $('<div class="align-self-start d-lg-none"></div>');
    var div_site = $('<div><a href="' + c.url + '" target="_blank" class="fs--1">' + c.site + '</a></div>');
    var published_date = $('<div class="fs--2">' + c.publishedDate + '</div>');
    var div_url = $('<div><a href="' + c.url + '" target="_blank" class="fs--1">Go to Article</a></div>');
    div_img_content.append(div_site);
    div_img_content.append(published_date);
    div_img_content.append(div_url);
    div_first.append(img);
    div_first.append(ticker);
    div_first.append(div_img_content);

    var div_second = $('<div class="col ps-3 pe-5 bd-highlight"></div>');
    var title = $('<div class="card-title"><ins>[' + c.title + '</ins></div>');
    var text = $('<div class="fs--1">' + c.text + '</div>');
    div_second.append(title);
    div_second.append(text);

    var div_third = $('<div class="col-md-2 align-self-start d-none d-lg-inline"></div>');
    div_third.append(div_site);
    div_third.append(published_date);
    div_third.append(div_url);

    div.append(div_first);
    div.append(div_second);
    div.append(div_third);
    li.append(div);

    $('.' + tbl_class).append(li);
}






