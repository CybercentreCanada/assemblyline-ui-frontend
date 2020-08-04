import time
from flask import request, session, make_response, jsonify, Flask

app = Flask(__name__)
app.config.update(
    SECRET_KEY="This does not look like it but it's a secret ! ;-)",
    SESSION_COOKIE_SECURE=False
)


@app.route('/api/v4/auth/login/', methods=["POST"])
def login():
    data = request.json
    if data.get('user', None) == "test" and data.get('password', None) == "test":
        session["user"] = data['user']
        out = {"api_response": {"success": True}, "api_status_code": 200, "api_error_message": ""}
        status = 200
    else:
        out = {"api_response": {}, "api_status_code": 400, "api_error_message": "Bad username/password"}
        status = 400

    return make_response(jsonify(out), status)


@app.route('/api/v4/auth/logout/', methods=["GET"])
def logout():
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
    if session.get('user', None) is not None:
        out = {"api_response": {"user": session['user']}, "api_status_code": 200, "api_error_message": ""}
        status = 200
    else:
        # Wait so we can showcase app loading page
        time.sleep(2)
        out = {"api_response": {}, "api_status_code": 401, "api_error_message": "You must login first"}
        status = 401

    return make_response(jsonify(out), status)


if __name__ == "__main__":
    app.jinja_env.cache = {}
    app.run(host="0.0.0.0", debug=False)