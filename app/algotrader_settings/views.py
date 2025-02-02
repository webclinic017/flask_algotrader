import json
import app.generalutils as general
from flask import (
    Blueprint,
    flash,
    render_template,
    request, url_for,
    jsonify
)
from sqlalchemy import text

from flask_login import login_required, current_user

from werkzeug.utils import redirect

from app import csrf, db
from app.models import UserSetting, Strategy, UserStrategySettingsDefault, ClientCommand, Fgi_score, ReportStatistic
from app.email import send_email
import app.enums as enum
from app.research import yahoo_research as yahoo

algotradersettings = Blueprint('algotradersettings', __name__)


@csrf.exempt
@algotradersettings.route('/usersettings', methods=['GET'])
@login_required
def usersettings():

    if not current_user.admin_confirmed and current_user.subscription_type_id == enum.Subscriptions.MANAGED_PORTFOLIO.value:
        return redirect(url_for('station.registration_steps', step=1))
    user_settings = UserSetting.query.filter_by(email=current_user.email).first()
    strategies = Strategy.query.filter(Strategy.id != 4).all()
    reports = ReportStatistic.query.filter_by(email=current_user.email).all()

    df = yahoo.get_snp500_fails_intraday_lower_than(user_settings.algo_positions_for_swan)
    df.reset_index(level=0, inplace=True)
    # jhistory = df.to_dict(orient='records')
    jhistory = df.to_json(orient="index", date_format='iso')
    global_snp = jsonify(symbol='^GSPC', historical=jhistory)
    account_type_id=current_user.subscription_type_id

    return render_template('userview/algotraderSettings_new.html',
                           account_type_id=account_type_id,
                           user_settings=user_settings,
                           strategies=strategies,
                           reports=json.dumps(reports, cls=general.JsonEncoder),
                           global_snp=json.dumps(jhistory, cls=general.JsonEncoder))


@csrf.exempt
@algotradersettings.route('/get_default_strategy_settings', methods=['POST'])
@login_required
def get_default_strategy_settings():
    strategy_id = request.form['strategy_id']
    default_settings = UserStrategySettingsDefault.query.filter_by(id=strategy_id).first()
    return json.dumps(default_settings, cls=general.JsonEncoder)


@algotradersettings.route('/savesettings', methods=['POST'])
@login_required
def savesettings():
    # send_email(recipient='support@stockscore.company',
    #            subject='testing the email',
    #            template='account/email/test_message')
    user_settings = UserSetting.query.filter_by(email=current_user.email).first()
    user_settings.algo_max_loss = request.form['algo_max_loss']
    user_settings.algo_take_profit = request.form['algo_take_profit']
    user_settings.algo_bulk_amount_usd = request.form['algo_bulk_amount_usd']
    user_settings.algo_trailing_percent = request.form['algo_trailing_percent']
    if "algo_apply_accepted_fmp_ratings" in request.form.keys():
        user_settings.algo_apply_accepted_fmp_ratings = True
    else:
        user_settings.algo_apply_accepted_fmp_ratings = False
    user_settings.algo_accepted_fmp_ratings = request.form['algo_accepted_fmp_ratings']

    if "algo_apply_max_yahoo_rank" in request.form.keys():
        user_settings.algo_apply_max_yahoo_rank = True
    else:
        user_settings.algo_apply_max_yahoo_rank = False
    user_settings.algo_max_yahoo_rank = request.form['algo_max_yahoo_rank']

    if "algo_apply_max_hold" in request.form.keys():
        user_settings.algo_apply_max_hold = True
    else:
        user_settings.algo_apply_max_hold = False
    user_settings.algo_max_hold_days = request.form['algo_max_hold_days']

    if "algo_allow_buy" in request.form.keys():
        user_settings.algo_allow_buy = True
    else:
        user_settings.algo_allow_buy = False

    if "algo_allow_sell" in request.form.keys():
        user_settings.algo_allow_sell = True
    else:
        user_settings.algo_allow_sell = False

    if "algo_allow_margin" in request.form.keys():
        user_settings.algo_allow_margin = True
    else:
        user_settings.algo_allow_margin = False

    if "station_autorestart" in request.form.keys():
        user_settings.station_autorestart = True
    else:
        user_settings.station_autorestart = False

    if "algo_apply_min_rank" in request.form.keys():
        user_settings.algo_apply_min_rank = True
    else:
        user_settings.algo_apply_min_rank = False
    user_settings.algo_min_rank = request.form['algo_min_rank']

    if "algo_sell_on_swan" in request.form.keys():
        user_settings.algo_sell_on_swan = True
    else:
        user_settings.algo_sell_on_swan = False
    user_settings.algo_positions_for_swan = request.form['algo_positions_for_swan']

    if "notify_buy" in request.form.keys():
        user_settings.notify_buy = True
    else:
        user_settings.notify_buy = False

    if "notify_sell" in request.form.keys():
        user_settings.notify_sell = True
    else:
        user_settings.notify_sell = False

    if "notify_trail" in request.form.keys():
        user_settings.notify_trail = True
    else:
        user_settings.notify_trail = False

    if "notify_candidate_signal" in request.form.keys():
        user_settings.notify_candidate_signal = True
    else:
        user_settings.notify_candidate_signal = False

    if "algo_apply_min_underprice" in request.form.keys():
        user_settings.algo_apply_min_underprice = True
    else:
        user_settings.algo_apply_min_underprice = False
    user_settings.algo_min_underprice = request.form['algo_min_underprice']

    if "algo_apply_min_momentum" in request.form.keys():
        user_settings.algo_apply_min_momentum = True
    else:
        user_settings.algo_apply_min_momentum = False
    user_settings.algo_min_momentum = request.form['algo_min_momentum']

    if "algo_apply_min_stock_invest_rank" in request.form.keys():
        user_settings.algo_apply_min_stock_invest_rank = True
    else:
        user_settings.algo_apply_min_stock_invest_rank = False
    user_settings.algo_min_stock_invest_rank = request.form['algo_min_stock_invest_rank']

    if "algo_apply_min_beta" in request.form.keys():
        user_settings.algo_apply_min_beta = True
    else:
        user_settings.algo_apply_min_beta = False
    user_settings.algo_min_beta = request.form['algo_min_beta']

    if "algo_apply_min_emotion" in request.form.keys():
        user_settings.algo_apply_min_emotion = True
    else:
        user_settings.algo_apply_min_emotion = False
    user_settings.algo_min_emotion = request.form['algo_min_emotion']

    if "algo_apply_max_intraday_drop_percent" in request.form.keys():
        user_settings.algo_apply_max_intraday_drop_percent = True
    else:
        user_settings.algo_apply_max_intraday_drop_percent = False
    user_settings.algo_max_intraday_drop_percent = request.form['algo_max_intraday_drop_percent']

    if "algo_apply_algotrader_rank" in request.form.keys():
        user_settings.algo_apply_algotrader_rank = True
    else:
        user_settings.algo_apply_algotrader_rank = False
    user_settings.algo_min_algotrader_rank = request.form['algo_min_algotrader_rank']

    user_settings.connection_port = request.form['connection_port']
    user_settings.connection_account_name = request.form['connection_account_name']
    user_settings.connection_tws_user = request.form['connection_tws_user']
    user_settings.connection_tws_pass = request.form['connection_tws_pass']
    user_settings.server_url = request.form['server_url']
    user_settings.algo_portfolio_stoploss = request.form['algo_portfolio_stoploss']
    user_settings.server_report_interval_sec = request.form['server_report_interval_sec']

    if "server_use_system_candidates" in request.form.keys():
        user_settings.server_use_system_candidates = True
    else:
        user_settings.server_use_system_candidates = False

    user_settings.strategy_id = request.form['strategy_id']

    user_settings.update_user_settings()
    return redirect(url_for('algotradersettings.usersettings'))


@algotradersettings.route('/save_notifications_settings', methods=['POST'])
@login_required
def save_notifications_settings():
    user_settings = UserSetting.query.filter_by(email=current_user.email).first()

    if "notify_buy" in request.form.keys():
        user_settings.notify_buy = True
    else:
        user_settings.notify_buy = False

    if "notify_sell" in request.form.keys():
        user_settings.notify_sell = True
    else:
        user_settings.notify_sell = False

    if "notify_trail" in request.form.keys():
        user_settings.notify_trail = True
    else:
        user_settings.notify_trail = False

    user_settings.update_user_settings()
    return redirect(url_for('algotradersettings.usersettings'))


@algotradersettings.route('/save_station_settings', methods=['POST'])
@login_required
def save_station_settings():
    user_settings = UserSetting.query.filter_by(email=current_user.email).first()
    user_settings.connection_port = request.form['connection_port']
    user_settings.connection_account_name = request.form['connection_account_name']
    user_settings.connection_tws_user = request.form['connection_tws_user']
    user_settings.connection_tws_pass = request.form['connection_tws_pass']



    user_settings.update_user_settings()
    return redirect(url_for('algotradersettings.usersettings'))


@algotradersettings.route('/save_filters_settings', methods=['POST'])
@login_required
def save_filters_settings():
    user_settings = UserSetting.query.filter_by(email=current_user.email).first()

    # user_settings.strategy_id = request.form['strategy_id']

    if "notify_candidate_signal" in request.form.keys():
        user_settings.notify_candidate_signal = True
    else:
        user_settings.notify_candidate_signal = False

    if "algo_apply_algotrader_rank" in request.form.keys():
        user_settings.algo_apply_algotrader_rank = True
    else:
        user_settings.algo_apply_algotrader_rank = False
    user_settings.algo_min_algotrader_rank = request.form['algo_min_algotrader_rank']

    if "algo_apply_min_underprice" in request.form.keys():
        user_settings.algo_apply_min_underprice = True
    else:
        user_settings.algo_apply_min_underprice = False
    user_settings.algo_min_underprice = request.form['algo_min_underprice']

    if "algo_apply_min_momentum" in request.form.keys():
        user_settings.algo_apply_min_momentum = True
    else:
        user_settings.algo_apply_min_momentum = False
    user_settings.algo_min_momentum = request.form['algo_min_momentum']

    if "algo_apply_min_beta" in request.form.keys():
        user_settings.algo_apply_min_beta = True
    else:
        user_settings.algo_apply_min_beta = False
    user_settings.algo_min_beta = request.form['algo_min_beta']

    if "algo_apply_max_intraday_drop_percent" in request.form.keys():
        user_settings.algo_apply_max_intraday_drop_percent = True
    else:
        user_settings.algo_apply_max_intraday_drop_percent = False
    user_settings.algo_max_intraday_drop_percent = request.form['algo_max_intraday_drop_percent']

    if "algo_apply_min_emotion" in request.form.keys():
        user_settings.algo_apply_min_emotion = True
    else:
        user_settings.algo_apply_min_emotion = False
    user_settings.algo_min_emotion = request.form['algo_min_emotion']

    if "server_use_system_candidates" in request.form.keys():
        user_settings.server_use_system_candidates = True
    else:
        user_settings.server_use_system_candidates = False

    user_settings.update_user_settings()
    return redirect(url_for('algotradersettings.usersettings'))


@algotradersettings.route('/save_strategy_settings', methods=['POST'])
@login_required
def save_strategy_settings():
    user_settings = UserSetting.query.filter_by(email=current_user.email).first()
    user_settings.algo_max_loss = request.form['algo_max_loss']
    user_settings.algo_take_profit = request.form['algo_take_profit']
    user_settings.algo_bulk_amount_usd = request.form['algo_bulk_amount_usd']
    user_settings.algo_trailing_percent = request.form['algo_trailing_percent']

    if "algo_allow_buy" in request.form.keys():
        user_settings.algo_allow_buy = True
    else:
        user_settings.algo_allow_buy = False

    if "algo_allow_sell" in request.form.keys():
        user_settings.algo_allow_sell = True
    else:
        user_settings.algo_allow_sell = False

    if "algo_allow_margin" in request.form.keys():
        user_settings.algo_allow_margin = True
    else:
        user_settings.algo_allow_margin = False

    user_settings.algo_portfolio_stoploss = request.form['algo_portfolio_stoploss']

    if "algo_sell_on_swan" in request.form.keys():
        user_settings.algo_sell_on_swan = True
    else:
        user_settings.algo_sell_on_swan = False
    user_settings.algo_positions_for_swan = request.form['algo_positions_for_swan']

    if "algo_apply_max_hold" in request.form.keys():
        user_settings.algo_apply_max_hold = True
    else:
        user_settings.algo_apply_max_hold = False
    user_settings.algo_max_hold_days = request.form['algo_max_hold_days']

    user_settings.update_user_settings()
    return redirect(url_for('algotradersettings.usersettings'))


@algotradersettings.route('/saverequirementssettings', methods=['POST'])
@login_required
def saverequirementssettings():
    is_data_changed = request.form['data-changed']
    if is_data_changed == "1":
        connection_account_name = request.form['connection_account_name']
        connection_tws_user = request.form['connection_tws_user']
        connection_tws_pass = request.form['connection_tws_pass']

        if connection_account_name == 'U0000000' \
                or connection_tws_user == 'your_tws_user_name' \
                or connection_tws_pass == 'your_tws_user_password':
            flash('Validate credentials', 'error')
        else:
            user_settings = UserSetting.query.filter_by(email=current_user.email).first()
            user_settings.connection_account_name = connection_account_name
            user_settings.connection_tws_user = connection_tws_user
            user_settings.connection_tws_pass = connection_tws_pass

            user_settings.update_user_settings()
            flash('Credentials saved', 'success')

            current_user.tws_requirements = 1
            current_user.update_user()

            url = url_for('admin.pending_approval', _external=True)

            send_email(recipient='support@stockscore.company',
                       subject='StockScore Server: user provided all the details',
                       template='account/email/user_data_provided',
                       user=current_user,
                       url=url)

    return redirect(url_for('station.registration_steps', step=2))


@csrf.exempt
@algotradersettings.route('/retrieveusersettings', methods=['GET'])
def retrieve_user_settings():
    request_data = request.get_json()
    logged_user = request_data["user"]

    user_settings = UserSetting.query.filter_by(email=logged_user).first()
    # tdj = json.dumps(user_settings.toDictionary())
    tdj = json.dumps(user_settings, cls=general.JsonEncoder)
    parsed_response = json.dumps(tdj)
    return parsed_response


@csrf.exempt
@algotradersettings.route('/save_emotion_settings', methods=['POST'])
@login_required
def save_emotion_settings():
    user_settings = UserSetting.query.filter_by(email=current_user.email).first()
    user_settings.algo_min_emotion = int(request.form['emotion'])
    user_settings.update_user_settings()
    # flash('Emotion saved', 'success')
    return jsonify(success=1)



@csrf.exempt
@algotradersettings.route('/save_black_swan', methods=['POST'])
@login_required
def save_black_swan():
    user_settings = UserSetting.query.filter_by(email=current_user.email).first()
    user_settings.algo_positions_for_swan = float(request.form['bsw'])
    user_settings.update_user_settings()
    flash('Market fall safety saved', 'success')
    return jsonify(success=1)



@algotradersettings.route('/save_signature', methods=['POST'])
@login_required
def save_signature():
    signature_full_name = request.form['signature_full_name']
    signature = False

    if "signature" in request.form.keys():
        signature = True

    if general.check_is_empty(signature_full_name) or not signature:
        flash('Need to agree to accept the terms', 'error')
    elif len(signature_full_name.strip().split()) <= 1:
        flash('Enter full name', 'error')
    else:

        current_user.signature_full_name = signature_full_name.strip()
        current_user.signature = signature
        current_user.update_user()

    client_command = ClientCommand(current_user.email)
    db.session.add(client_command)
    db.session.commit()

    return redirect(request.args.get('next') or url_for('main.index'))



@csrf.exempt
@algotradersettings.route('/get_all_emotions', methods=['GET'])
def get_all_emotions():
    query_text = "select a.* " \
                 "from Fgi_Scores a " \
                 "JOIN (select DATE(Fgi_Scores.`score_time`) AS score_date, " \
                 "max(Fgi_Scores.`score_time`) as max_score_time, " \
                 "MAX(Fgi_Scores.`fgi_value`) AS max_fgi_value " \
                 "from Fgi_Scores " \
                 "group by DATE(Fgi_Scores.`score_time`)) b on b.`max_score_time`=a.`score_time` " \
                 "AND b.`max_fgi_value`=a.`fgi_value` " \
                 "ORDER BY a.`score_time`"
    fgi_scores = db.session.query(Fgi_score).from_statement(text(query_text)).all()
    # fgi_scores = Fgi_score.query.order_by(Fgi_score.score_time.asc()).all()
    t = json.dumps(fgi_scores, cls=general.JsonEncoder)
    return jsonify(historical=json.loads(t))



@csrf.exempt
@algotradersettings.route('/get_complete_graph_for_ticker/<ticker>', methods=['GET'])
# @cross_origin(origin='*', headers=['Content-Type', 'Authorization'])
def get_complete_graph_for_ticker(ticker):
    info = yahoo.get_complete_graph(ticker,"max")
    info.reset_index(level=0, inplace=True)
    jhistory = info.assign(
        **info.select_dtypes(['datetime']).astype(str).to_dict('list')
    ).to_dict('records')
    # jhistory=info.to_dict(orient='records')
    return jsonify(symbol=ticker, historical=jhistory)


@csrf.exempt
@algotradersettings.route('/get_snp500_data/<min_snp>', methods=['GET'])
@login_required
def get_snp500_data(min_snp):
    # min_snp = float(request.form['min_snp'])
    df = yahoo.get_snp500_fails_intraday_lower_than(float(min_snp))
    df.reset_index(level=0, inplace=True)
    jhistory = df.to_dict(orient='records')
    return jsonify(symbol='^GSPC', historical=jhistory)
    # return df.to_json(orient="index",date_format='iso')