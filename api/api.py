import time
import json
from flask import request, session, make_response, jsonify, Flask

app = Flask(__name__)
app.config.update(
    SECRET_KEY="This does not look like it but it's a secret ! ;-)",
    SESSION_COOKIE_SECURE=False
)

API_DELAY = 0

Error401_data = {
    "oauth_providers": [],
    "allow_userpass_login": True,
    "allow_signup": False,
    "allow_pw_rest": False
}

# AUTH #######################################


@app.route('/api/v4/auth/login/', methods=["POST"])
def login():
    time.sleep(API_DELAY)
    data = request.json
    if data.get('user', None) == "admin" and data.get('password', None) == "adminpassword":
        if data.get('otp', None) == "136987":
            session["user"] = "admin"
            out = {"api_response": {"success": True},
                   "api_status_code": 200, "api_error_message": ""}
            status = 200
        else:
            out = {"api_response": Error401_data, "api_status_code": 401,
                   "api_error_message": "Wrong OTP token"}
            status = 401
    elif data.get('user', None) == "user" and data.get('password', None) == "password":
        session["user"] = "user"
        out = {"api_response": {"success": True},
               "api_status_code": 200, "api_error_message": ""}
        status = 200
    else:
        out = {"api_response": Error401_data, "api_status_code": 400,
               "api_error_message": "Bad username/password"}
        status = 401

    return make_response(jsonify(out), status)


@app.route('/api/v4/auth/logout/', methods=["GET"])
def logout():
    time.sleep(API_DELAY)
    try:
        session.pop('user', None)
        out = {"api_response": {"success": True},
               "api_status_code": 200, "api_error_message": ""}
        status = 200
    except ValueError:
        out = {"api_response": {}, "api_status_code": 400,
               "api_error_message": "Are you even logged in?"}
        status = 400

    return make_response(jsonify(out), status)

# USER #####################################


@app.route('/api/v4/user/<user>/')
def get_user(user):
    time.sleep(API_DELAY)
    if user in ["admin", "user"]:
        out = {"api_response": json.load(open(
            f'outputs/get_user_{user}.json')), "api_status_code": 200, "api_error_message": ""}
        status = 200
    else:
        out = {"api_response": {}, "api_status_code": 404,
               "api_error_message": "User not found"}
        status = 404

    return make_response(jsonify(out), status)


@app.route('/api/v4/user/whoami/')
def whoami():
    time.sleep(API_DELAY)
    if session.get('user', None) == "user":
        out = {"api_response": json.load(open(
            'outputs/whoami_user.json')), "api_status_code": 200, "api_error_message": ""}
        status = 200
    elif session.get('user', None) == "admin":
        out = {"api_response": json.load(open(
            'outputs/whoami_admin.json')), "api_status_code": 200, "api_error_message": ""}
        status = 200
    else:
        # Wait so we can showcase app loading page
        out = {"api_response": Error401_data, "api_status_code": 401,
               "api_error_message": "You must login first"}
        status = 401

    return make_response(jsonify(out), status)

# SUBMISSIONS ###############################


@app.route('/api/v4/submission/list/<sub_list_type>/<sub_list_value>/')
def submission_list(sub_list_type, sub_list_value):
    time.sleep(API_DELAY)
    return make_response(jsonify({"api_response": json.load(open('outputs/submission_list.json')), "api_status_code": 200, "api_error_message": ""}), 200)

# ALERTS ####################################


@app.route('/api/v4/alert/grouped/<group_by>/')
def alert_list(group_by):
    time.sleep(API_DELAY)
    return make_response(jsonify({"api_response": json.load(open('outputs/alert_list.json')), "api_status_code": 200, "api_error_message": ""}), 200)


@app.route('/api/v4/alert/labels/')
def alert_labels():
    time.sleep(API_DELAY)
    return make_response(jsonify({"api_response": json.load(open('outputs/alert_labels.json')), "api_status_code": 200, "api_error_message": ""}), 200)


@app.route('/api/v4/alert/statuses/')
def alert_statuses():
    time.sleep(API_DELAY)
    return make_response(jsonify({"api_response": json.load(open('outputs/alert_status.json')), "api_status_code": 200, "api_error_message": ""}), 200)


@app.route('/api/v4/alert/priorities/')
def alert_priorities():
    time.sleep(API_DELAY)
    return make_response(jsonify({"api_response": json.load(open('outputs/alert_priority.json')), "api_status_code": 200, "api_error_message": ""}), 200)


if __name__ == "__main__":
    app.jinja_env.cache = {}
    app.run(host="0.0.0.0", debug=False)
