import datetime
import uuid

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

database = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///timeline.db"
database.init_app(app)

# current data storage - move to database later

'''
new system:
task -> task -> task
        - subtask
        - subtask        
task -> task

so: store a list of tasks
parent object - title, completed data, etc
then child tasks inside object

'''


class BaseTask:
    def __init__(self, name, description=""):
        self.id = str(uuid.uuid4())
        self.date = datetime.date.today()
        self.name = name
        self.description = description
        self.completed = False
        self.subtasks = []

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'name': self.name,
            'description': self.description,
            'completed': self.completed,
            'subtasks': [subtask.to_dict() for subtask in self.subtasks],
        }

class ListHeader:
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.date = datetime.date.today()
        self.tasks = []

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'tasks': {
                task.id: task.to_dict()
                for task in self.tasks
            },
        }

class BaseSubtask:
    def __init__(self, description):
        self.id = str(uuid.uuid4())
        self.description = description
        self.completed = False

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'completed': self.completed,
        }

lists = []

@app.route("/")
def home():
    return render_template("main.html")


@app.route('/add-task', methods=['POST'])
def add_task():
    form_data = request.form
    task = BaseTask(form_data["taskName"], form_data["taskDescription"])

    header = ListHeader()
    header.tasks.append(task)
    lists.append(header.to_dict())
    return {"response": "added task"}


@app.route('/get-tasks', methods=['GET'])
def return_tasks():
    return jsonify(lists)


@app.route('/complete', methods=['POST'])
def complete_task():
    data = request.get_json()
    task_id = data.get("taskId")
    lists.tasks[task_id].completed = True

    return jsonify({"response": 'task completed'})


@app.route('/delete-task', methods=['POST'])
def delete_task():
    data = request.get_json()

'''
            let currentTask = JSON.parse(localStorage.getItem(event.target.dataset.id));
            let taskBefore = currentTask.before ? JSON.parse(localStorage.getItem(currentTask.before)) : 0;
            let taskAfter = currentTask.after ? JSON.parse(localStorage.getItem(currentTask.after)) : 0;
            let originsList = JSON.parse(localStorage.getItem('ORIGINS'));

            // if it's between two objects
            if (taskBefore && taskAfter) {
                taskBefore.after = taskAfter.id;
                taskAfter.before = taskBefore.id;
            }

            // if it's at end of list
            if (taskBefore && !taskAfter) {
                taskBefore.after = 0;
            }

            // if it's at start of a list and there's a next
            if (!taskBefore && taskAfter) {
                taskAfter.before = 0;

                // make sure to update origins list
                originsList.push(taskAfter.id);
            }

            // remove task from storage and origins list
            originsList = originsList.filter(id => id !== currentTask.id);
            localStorage.removeItem(event.target.dataset.id);

            if (taskBefore !== 0) {
                localStorage.setItem(taskBefore.id, JSON.stringify(taskBefore));
            }
            if (taskAfter !== 0) {
                localStorage.setItem(taskAfter.id, JSON.stringify(taskAfter));
            }

            localStorage.setItem('ORIGINS', JSON.stringify(originsList));

'''

if __name__ == "__main__":
    app.run(debug=True)
