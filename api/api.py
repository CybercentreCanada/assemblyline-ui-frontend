import time
from flask import request, session, make_response, jsonify, Flask

app = Flask(__name__)
app.config.update(
    SECRET_KEY="This does not look like it but it's a secret ! ;-)",
    SESSION_COOKIE_SECURE=False
)


@app.route('/api/v4/auth/login/', methods=["POST"])
def login():
    time.sleep(1)
    data = request.json
    if data.get('user', None) == "test" and data.get('password', None) == "test":
        session["user"] = dict(
            username="sgaron",
            name="Steve Garon",
            email="steve.garon@cyber.gc.ca",
            avatar="https://cdn.iconscout.com/icon/free/png-512/avatar-370-456322.png"
        )
        out = {"api_response": {"success": True}, "api_status_code": 200, "api_error_message": ""}
        status = 200
    else:
        out = {"api_response": {}, "api_status_code": 400, "api_error_message": "Bad username/password"}
        status = 400

    return make_response(jsonify(out), status)


@app.route('/api/v4/auth/logout/', methods=["GET"])
def logout():
    time.sleep(1)
    try:
        session.pop('user', None)
        out = {"api_response": {"success": True}, "api_status_code": 200, "api_error_message": ""}
        status = 200
    except ValueError:
        out = {"api_response": {}, "api_status_code": 400, "api_error_message": "Are you even logged in?"}
        status = 400

    return make_response(jsonify(out), status)


@app.route('/api/v4/user/whoami/')
def whoami():
    time.sleep(1)
    if session.get('user', None) is not None:
        out = {"api_response": session['user'], "api_status_code": 200, "api_error_message": ""}
        status = 200
    else:
        # Wait so we can showcase app loading page
        out = {"api_response": {}, "api_status_code": 401, "api_error_message": "You must login first"}
        status = 401

    return make_response(jsonify(out), status)


if __name__ == "__main__":
    app.jinja_env.cache = {}
    app.run(host="0.0.0.0", debug=False)