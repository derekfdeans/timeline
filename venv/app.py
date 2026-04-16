import json
import time
import uuid

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# current data method - move to database later
tasks = {}
origins = []


@app.route("/")
def home():
    return render_template("main.html")


class BaseTask:
    def __init__(self, name, description=""):
        self.id = str(uuid.uuid4())
        self.date = time.time_ns()
        self.name = name
        self.description = description
        self.completed = False
        self.before = 0
        self.after = 0


@app.route('/add-task', methods=['POST'])
def add_task():
    form_data = request.form
    task = BaseTask(form_data["taskName"], form_data["taskDescription"])

    tasks[task.id] = task
    origins.append(task.id)

    return jsonify("added task")


@app.route('/get-tasks', methods=['GET'])
def return_tasks():
    return {
        "tasks": jsonify(tasks),
        "origins": jsonify(origins)
    }


@app.route('/complete', methods=['POST'])
def complete_task():
    data = request.get_json()
    tasks[data['taskId']]['completed'] = True
    return jsonify({"response": 'task completed'})


if __name__ == "__main__":
    app.run(debug=True)
