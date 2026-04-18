# Debug Checklist

Use this when a request, JSON payload, render path, or database action breaks. Debug from the browser inward: what did the frontend send, what did Flask read, what did the database store, and what shape did the UI expect back?

## Core Questions

Ask these first:

- What exactly am I sending?
- What exactly is the server receiving?
- What exactly is the server returning?
- What exact shape does the next layer expect?
- Am I still assuming the old `localStorage` structure anywhere?

Most bugs in this project will be one of these:

- JSON serialization/parsing mismatch
- Response shape mismatch
- Async timing issue
- Old frontend assumptions after backend migration
- SQLAlchemy model/relationship mismatch

## 1. Frontend Request Checklist

Before blaming Flask or SQLAlchemy, verify the browser request.

- Is the request method correct (`GET`, `POST`, etc.)?
- If I set `Content-Type: application/json`, am I sending `JSON.stringify(...)` on a plain object?
- Did I accidentally send `FormData` directly instead of converting it?
- Do my key names match the backend exactly (`taskName` vs `name`)?
- Am I sending empty strings, `undefined`, `null`, or `NaN`?
- Am I waiting for `fetch()` to complete before resetting the form or rerendering?

Safe pattern for form submission:

```js
const payload = Object.fromEntries(new FormData(form));
console.log("sending payload:", payload);

fetch("/add-task", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
})
```

If a request is failing, inspect the browser Network tab:

- Request URL
- Request method
- Request headers
- Request payload
- Response status
- Response body

## 2. JSON Checklist

Use this when Flask says JSON is missing, `None`, invalid, or the response fails to parse.

Ask:

- Am I actually sending JSON?
- Does the request header say `Content-Type: application/json`?
- Am I calling `request.get_json()` only for JSON requests?
- Should this route read `request.form` instead?
- Is the payload a plain object or array, not `FormData`, a class instance, or a DOM object?
- Did the backend return JSON, or did it return an HTML error page?
- Am I calling `response.json()` on a non-JSON response?

Useful Flask debug pattern:

```python
data = request.get_json(silent=True)
print("received json:", data)
```

Useful fetch pattern:

```js
fetch("/route", options)
    .then(async response => {
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text);
        }
        return response.json();
    })
```

That separates these cases cleanly:

- the request failed
- the server returned a non-JSON error page
- the response JSON shape is wrong

## 3. Response Shape Checklist

This project is moving from `localStorage` objects to Flask/SQLAlchemy JSON responses. Shape mismatches are expected during that migration.

Ask:

- Is this value an array or an object?
- Am I iterating the right thing (`list.tasks` vs `list`)?
- Did the backend response change shape recently?
- Does the frontend still assume old fields that no longer exist?
- Are dates, ids, or nested data now represented differently?

Useful browser checks:

```js
console.log("response data:", data);
console.log("is array:", Array.isArray(data));
console.log("first item:", data[0]);
```

Common migration bug:

- backend returns `{ id, date, tasks: [...] }`
- frontend loops over `list` instead of `list.tasks`

## 4. Async and Timing Checklist

Use this when things work inconsistently or the UI refreshes before the backend update lands.

Ask:

- Am I calling `displayTaskLists()` before the POST finishes?
- Am I resetting the form before I know the request succeeded?
- Am I assuming a fetch succeeded without checking `response.ok`?
- Is the rerender using stale data from before the commit?

Preferred pattern:

```js
fetch("/add-task", options)
    .then(response => response.json())
    .then(data => {
        form.reset();
        displayTaskLists(container);
    })
    .catch(error => console.error(error));
```

Avoid:

- resetting the form immediately after `fetch(...)`
- rerendering immediately after `fetch(...)`

## 5. SQLAlchemy Checklist

Use this when inserts, deletes, updates, or queries fail.

Ask:

- Did I create the model object with all required fields?
- Are any non-null columns missing values?
- Are the types valid for those columns?
- Did I add the right object to the session?
- Did I commit the session?
- If there is a relationship, is the foreign key actually valid?
- Is the relationship cardinality what I think it is: one-to-many, many-to-one, etc.?
- Did the database schema drift from the current model definitions?

Useful debug points before commit:

```python
print("task name:", new_task.name)
print("task description:", new_task.description)
database.session.add(new_list)
database.session.commit()
```

If commit fails, read the traceback carefully. It usually tells you which class of problem you have:

- missing table
- missing column
- null constraint failure
- type mismatch
- foreign key problem
- relationship configuration issue

## 6. Relationship Checklist

Use this when parent/child objects are not linking correctly.

Ask:

- Does the child model have the correct `ForeignKey(...)`?
- Does the parent model have the matching `relationship()`?
- Did I append the child to the parent correctly?
- Am I expecting one object where SQLAlchemy gives me a list?
- Am I expecting a list where the relationship is scalar?

Typical pattern:

```python
new_list = BaseListHeader()
new_task = BaseTask(name=name, description=description)
new_list.tasks.append(new_task)

database.session.add(new_list)
database.session.commit()
```

If the relationship does not persist, verify:

- the parent was added to the session
- the foreign key exists in the child model
- the relationship matches the foreign key

## 7. Migration Checklist

This app still has mixed assumptions between old client-side storage and the new backend.

Ask:

- Am I still reading or writing `localStorage` for data now owned by the database?
- Am I still treating ids like timestamps even though they are now UUIDs?
- Am I still computing UI values from old client-side structure?
- Did I migrate only create/read while edit/delete still use old storage?
- Is one feature using backend data while another still mutates local browser state?

Common migration warning signs:

- `new Date(+task.id)` when ids are now UUID strings
- `localStorage.getItem(taskId)` inside code that should now call Flask
- different code paths using different sources of truth

## 8. Route Contract Checklist

For each route, write down the contract and keep it stable.

For example:

```text
POST /add-task
request: { taskName: string, taskDescription: string }
response: { response: "added task" }
errors: { error: string }
```

Do this for every route:

- `/add-task`
- `/get-tasks`
- `/complete`
- `/delete-task`

When something breaks, compare:

- expected request shape
- actual request shape
- expected response shape
- actual response shape

## 9. Practical Debug Order

When something fails, debug in this order:

1. Browser console: what payload am I creating?
2. Network tab: what was actually sent, and what came back?
3. Flask log: what did `request.get_json()` or `request.form` contain?
4. SQLAlchemy layer: what object was created, added, queried, or committed?
5. UI render: am I reading the returned shape correctly?

This order matters. It keeps you from guessing too early.

## 10. Project-Specific Reminders

For this codebase right now:

- Convert form data with `Object.fromEntries(new FormData(form))` before JSON stringifying.
- Do not rerender the list until the POST succeeds.
- `/get-tasks` returns list objects, so iterate `list.tasks`, not `list`.
- UUID ids are not timestamps.
- Any code still using `localStorage` for task data is part of the old system and can conflict with the Flask/SQLAlchemy migration.

## 11. Small Debug Snippets

Frontend:

```js
const payload = Object.fromEntries(new FormData(addEventForm));
console.log("payload", payload);
```

Backend:

```python
@app.route('/add-task', methods=['POST'])
def add_task():
    data = request.get_json(silent=True) or {}
    print("incoming data:", data)
    return jsonify(data)
```

Database query check:

```python
statement = database.select(BaseListHeader)
lists = database.session.execute(statement).scalars().all()
print([item.to_dict() for item in lists])
```

## 12. Rule of Thumb

If a bug feels confusing, stop and write down:

- the exact request body
- the exact Flask-parsed body
- the exact JSON response
- the exact frontend code that consumes that response

Do not debug from assumptions. Debug from the actual payloads and actual shapes.
