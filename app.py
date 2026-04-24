# remember flask run --debug! auto reloads
# venv\Scripts\activate to enter venv

import datetime
import uuid

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey, Date
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    # add metadata if desired later
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


class BaseTask(database.Model):
    __tablename__ = "task"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
    date: Mapped[datetime.date] = mapped_column(Date, default=datetime.date.today)
    name: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column(default="")
    completed: Mapped[bool] = mapped_column(default=False)
    subtasks: Mapped[list['BaseSubtask']] = relationship()
    home_list: Mapped[str] = mapped_column(ForeignKey('list.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'name': self.name,
            'description': self.description,
            'completed': self.completed,
            'subtasks': [subtask.to_dict() for subtask in self.subtasks],
            'home_list': self.home_list,
        }


class BaseSubtask(database.Model):
    __tablename__ = 'subtask'

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
    content: Mapped[str] = mapped_column()
    completed: Mapped[bool] = mapped_column(default=False)
    home_task: Mapped[str] = mapped_column(ForeignKey('task.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'completed': self.completed,
            'home_task': self.home_task,
        }


# rewrite into some "list overview" manager; hold completed information for tasks
class BaseListHeader(database.Model):
    __tablename__ = 'list'

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column()
    date: Mapped[datetime.date] = mapped_column(Date, default=datetime.date.today)
    tasks: Mapped[list['BaseTask']] = relationship()

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'date': self.date,
            'tasks': [task.to_dict() for task in self.tasks],
        }


with app.app_context():
    database.create_all()


@app.route("/")
def home():
    return render_template("main.html")


@app.route('/add-task', methods=['POST'])
def add_task():
    form_data = request.get_json()

    name = form_data.get('listName')

    # new database way
    new_list = BaseListHeader(name=name)

    database.session.add(new_list)
    database.session.commit()

    return jsonify({"response": "added list"})


@app.route('/get-tasks', methods=['GET'])
def return_tasks():
    statement = database.select(BaseListHeader).order_by(BaseListHeader.date)
    lists = database.session.execute(statement).scalars()

    return jsonify([currentList.to_dict() for currentList in lists])


@app.route('/complete', methods=['POST'])
def complete_task():
    data = request.get_json()
    task_id = data.get("taskId")

    current_task = database.session.get(BaseTask, task_id)
    current_task.completed = True
    database.session.commit()

    return jsonify({"response": 'task completed'})


@app.route('/delete-task', methods=['POST'])
def delete_task():
    data = request.get_json()

    user = database.session.get(BaseTask, data.get('taskId'))
    parent_list = database.session.get(BaseListHeader, user.home_list)

    database.session.delete(user)
    database.session.commit()

    if len(parent_list.tasks) == 0:
        database.session.delete(parent_list)
        database.session.commit()

    return jsonify({"response": 'task deleted'})


@app.route('/add-next', methods=['POST'])
def add_next_task():
    data = request.get_json()

    current_list = database.session.get(BaseListHeader, data.get('listId'))

    new_name = data.get("newName")
    new_description = data.get("newDescription")
    new_task = BaseTask(name=new_name, description=new_description, home_list=current_list.id)

    database.session.add(new_task)
    database.session.commit()

    return jsonify({"response": 'next task added'})


@app.route('/add-subtask', methods=['POST'])
def add_subtask():
    data = request.get_json()

    current_task = database.session.get(BaseTask, data.get('taskId'))
    new_subtask = BaseSubtask(content=data.get('newName'))

    current_task.subtasks.append(new_subtask)
    database.session.commit()

    return jsonify({'response': 'subtask added'})

@app.route('/complete-subtask', methods=['POST'])
def complete_subtask():
    data = request.get_json()

    current_subtask = database.session.get(BaseSubtask, data.get('subtaskId'))

    database.session.delete(current_subtask)
    database.session.commit()

    return jsonify({'response': 'subtask completed'})


if __name__ == "__main__":
    app.run(debug=True)
