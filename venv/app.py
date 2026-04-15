from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# current data method - move to database later
tasks = {}
origins = []


@app.route("/")
def home():
    return render_template("main.html")


@app.route('/add-task', methods=['POST'])
def add_task():
    json_data = request.get_json()

    tasks[json_data.get("id")] = json_data
    origins.append(json_data.get("id"))

    return jsonify(json_data)


@app.route('/get-tasks', methods=['GET'])
def return_tasks():
    return {
        "tasks": tasks,
        "origins": origins
    }


if __name__ == "__main__":
    app.run(debug=True)
