avg_pe = 0;
TOOLTIPS = jQuery.parseJSON(TOOLTIPS)

$(document).ready(function () {
    get_avg_pe_from_fmp($('.ticker-sector-val').data('sector'));
    get_fmp_ticker_data(ticker);
    get_stock_news(10);
    get_insider_actions();
    get_press_relises();
    get_fundamentals_summary();
    get_fundamentals_feed();
    get_company_info();
    fill_container_ticker_info(ticker); //from spider_project.js

    setInterval(function(){
       get_fmp_ticker_data(ticker);
    }, 15000);

    var ticker_modal = new jBox('Modal', {
        attach: '.page-title-heading',
        title: ticker+': '+company_name,
        width: 1000,
        content: $('#ticker-info-modal')
    });

    $('.add-candidate').on('click', function(){
        add_candidate_from_ticker_info() //from spyder_project.js
    })

    $('.candidate-in-list').on('click', function(){
        remove_candidate();
    })

    $('.news-btn').on('change',function(){
        var limit = $(this).data('limit');
        get_stock_news(limit);
    })

    var tooltip_ids = []
    $('.jb-tooltip-info').each(function( index ) {
      tooltip_ids.push($( this ).data('tooltip-id'));
    });
    create_info_tooltip(tooltip_ids);

})


function add_candidate_from_ticker_info(){
    loading('ticker-action', 0); //from base.js
    $('.flashes').empty();
    url = '/candidates/add_candidate_ajax';
    $.post(url,{ticker: ticker}, function(data) {
        var data_parsed = jQuery.parseJSON(data);
        $('.flashes').append(flashMessage("success","Ticker added to your list"));
        var button = $('<button type="button" class="btn btn-outline-success candidate-in-list"><i class="metismenu-icon fa fa-check"></i>Remove from list</button>');
        $('.ticker-action .ticket-info-val').empty();
        $('.ticker-action .ticket-info-val').append(button);
        $('.candidate-in-list').on('click',remove_candidate);
        stop_loading('ticker-action'); //from base.js
        setTimeout(function(){
            $('.flashes').empty();
        }, 2000);
    })
}

function remove_candidate(){
    loading('ticker-action', 0); //from base.js
    $('.flashes').empty();
    $.post("/candidates/removecandidate_ajax",{ticker: ticker}, function(data) {
        var data_parsed = jQuery.parseJSON(data);
        $('.flashes').append(flashMessage("success","Ticker removed from your list"));
        var button = $('<button type="button" class="btn btn-outline-info add-candidate">Add</button>');
        $('.ticker-action .ticket-info-val').empty();
        $('.ticker-action .ticket-info-val').append(button);
        $('.add-candidate').on('click',add_candidate_from_ticker_info);
        stop_loading('ticker-action'); //from base.js
        setTimeout(function(){
            $('.flashes').empty();
        }, 2000);
    })
}

function get_stock_news(limit){
    loading('tab-news-card');
    $('.tab-news-card .div-loading').css('height', 0);
    $('.tab-news-card .spinner-border').css('margin-right', '9%');

    $.getJSON("/api/stock_news",{tickers: ticker, limit: limit}, function(data) {
        $('.tab-news-card .div-content').empty();
        $('.tab-news-card .div-content').append($(data.data));
        stop_loading('tab-news-card'); //from base.js
    })
}

function get_insider_actions(){
    loading('tab-insiders-card');
    $('.tab-insiders-card .div-loading').css('height', 0);
    $('.tab-insiders-card .spinner-border').css('margin-right', '9%');

    $.getJSON("/api/insider_actions",{ticker: ticker}, function(data) {
        $('.tab-insiders-card .div-content').empty();
        $('.tab-insiders-card .div-content').append($(data.data));
        stop_loading('tab-insiders-card'); //from base.js
    })
}

function get_press_relises(){
    loading('tab-press-relises-card');
    $('.tab-press-relises-card .div-loading').css('height', 0);
    $('.tab-press-relises-card .spinner-border').css('margin-right', '9%');

    $.getJSON("/api/press_relises",{ticker: ticker}, function(data) {
        $('.tab-press-relises-card .div-content').empty();
        $('.tab-press-relises-card .div-content').append($(data.data));
        stop_loading('tab-press-relises-card'); //from base.js
    })
}

function get_fundamentals_summary(){
    loading('tab-fundamentals-summary-card');
    $('.tab-fundamentals-summary-card .div-loading').css('height', 0);
    $('.tab-fundamentals-summary-card .spinner-border').css('margin-right', '9%');

    $.getJSON("/api/fundamentals_summary",{ticker: ticker}, function(data) {
        $('.tab-fundamentals-summary-card .div-content').empty();
        $('.tab-fundamentals-summary-card .div-content').append($(data.data));
        var tooltip_ids = []
        $('.tab-fundamentals-summary-card .jb-tooltip-info').each(function( index ) {
          tooltip_ids.push($( this ).data('tooltip-id'));
        });
        create_info_tooltip(tooltip_ids);
        stop_loading('tab-fundamentals-summary-card'); //from base.js
    })
}

function get_fundamentals_feed(){
    loading('tab-fundamentals-feed-card');
    $('.tab-fundamentals-feed-card .div-loading').css('height', 0);
    $('.tab-fundamentals-feed-card .spinner-border').css('margin-right', '9%');

    $.getJSON("/api/fundamentals_feed",{ticker: ticker}, function(data) {
        $('.tab-fundamentals-feed-card').empty();
        $('.tab-fundamentals-feed-card').append($(data.data));
        var tooltip_ids = []
        $('.tab-fundamentals-feed-card .jb-tooltip-info').each(function( index ) {
          tooltip_ids.push($( this ).data('tooltip-id'));
        });
        create_info_tooltip(tooltip_ids);
        stop_loading('tab-fundamentals-feed-card'); //from base.js
    })
}

function get_company_info(){
    $.getJSON("/api/company_info",{ticker: ticker}, function(data) {
        $('#ticker-info-modal').empty();
        $('#ticker-info-modal').append($(data.data));
    })
}



