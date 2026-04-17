# remember flask run --debug! auto reloads

import datetime
import uuid

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey, Date
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


# database work
class Base(DeclarativeBase):
    pass


database = SQLAlchemy(model_class=Base)

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///timeline.db"
database.init_app(app)

'''
new data system:
lists
    task -> task -> task -> task
            - subtask       - subtask
            - subtask       - subtask
    task -> task
'''


class Task:
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


class Subtask:
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


class BaseTask(Base):
    __tablename__ = "task"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
    date: Mapped[datetime.date] = mapped_column(Date, default=lambda: datetime.date.today())
    name: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()
    completed: Mapped[bool] = mapped_column(default=False)
    subtasks: Mapped[list[BaseSubtask]] = relationship()
    home_list: Mapped[str] = mapped_column(ForeignKey('list.id'))


class BaseSubtask(Base):
    __tablename__ = 'subtask'

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
    description: Mapped[str] = mapped_column()
    completed: Mapped[bool] = mapped_column(default=False)
    home_task: Mapped[str] = mapped_column(ForeignKey('task.id'))


class BaseListHeader(Base):
    __tablename__ = 'list'

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
    date: Mapped[datetime.date] = mapped_column(Date, default=lambda: datetime.date.today())
    tasks: Mapped[list['BaseTask']] = relationship()


lists = []


@app.route("/")
def home():
    return render_template("main.html")


@app.route('/add-task', methods=['POST'])
def add_task():
    form_data = request.form
    task = Task(form_data["taskName"], form_data["taskDescription"])

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
    pass


if __name__ == "__main__":
    app.run(debug=True)
