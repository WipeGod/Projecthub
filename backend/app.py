import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change in production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=1)
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})
jwt = JWTManager(app)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Simulated in-memory data stores
users = {}
projects = {}
tasks = {}
comments = {}
notifications = []

# To simulate autoincrement IDs
user_id_counter = 1
project_id_counter = 1
task_id_counter = 1
comment_id_counter = 1

# User roles and sample admin creation
def create_admin():
    global user_id_counter
    if "admin" not in users:
        users["admin"] = {
            "id": user_id_counter,
            "username": "admin",
            "password": generate_password_hash("adminpass"),
            "role": "admin"
        }
        user_id_counter += 1

create_admin()

# Helper functions
def add_notification(text):
    notifications.append({"id": len(notifications)+1, "text": text, "timestamp": datetime.datetime.utcnow().isoformat()})

# ===============================
# AUTH ROUTES
# ===============================
@app.route('/')
def home():
    return jsonify(message="Welcome to the ProjectHub API!")
   
@app.route('/auth/register', methods=['POST'])
def register():
    global user_id_counter
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400
    if username in users:
        return jsonify({"msg": "Username already exists"}), 409
    users[username] = {
        "id": user_id_counter,
        "username": username,
        "password": generate_password_hash(password),
        "role": "user"
    }
    user_id_counter += 1
    add_notification(f"New user registered: {username}")
    return jsonify({"msg": "User registered successfully"}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = users.get(username)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"msg": "Bad username or password"}), 401
    access_token = create_access_token(identity=user['id'])
    refresh_token = create_refresh_token(identity=user['id'])
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "username": username,
        "role": user["role"],
        "user_id": user["id"]
    })

@app.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    return jsonify({"access_token": new_token})

# ===============================
# USERS API (ADMIN ONLY)
# ===============================

@app.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    current_user = None
    for u in users.values():
        if u['id'] == current_user_id:
            current_user = u
            break
    if not current_user or current_user.get("role") != "admin":
        return jsonify({"msg": "Admin privilege required"}), 403
    return jsonify([
        {k: v for k, v in u.items() if k != "password"} for u in users.values()
    ])

@app.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def change_role(user_id):
    current_user_id = get_jwt_identity()
    current_user = None
    for u in users.values():
        if u['id'] == current_user_id:
            current_user = u
            break
    if not current_user or current_user.get("role") != "admin":
        return jsonify({"msg": "Admin privilege required"}), 403
    data = request.get_json()
    role = data.get("role")
    if role not in ["user", "admin"]:
        return jsonify({"msg": "Invalid role"}), 400
    user_to_update = None
    for u in users.values():
        if u['id'] == user_id:
            user_to_update = u
            break
    if not user_to_update:
        return jsonify({"msg": "User not found"}), 404
    user_to_update["role"] = role
    add_notification(f"User {user_to_update['username']} role changed to {role} by admin")
    return jsonify({"msg": "User role updated"})

# ===============================
# PROJECTS API
# ===============================

@app.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    current_user_id = get_jwt_identity()
    # Return projects where user is assigned or owner (simple ownership model: user created project)
    user_projects = [p for p in projects.values() if p['owner_id'] == current_user_id]
    return jsonify(user_projects)

@app.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    global project_id_counter
    current_user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')
    if not name:
        return jsonify({"msg": "Project name is required"}), 400
    project = {
        "id": project_id_counter,
        "name": name,
        "description": description,
        "owner_id": current_user_id,
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    projects[project_id_counter] = project
    project_id_counter += 1
    add_notification(f"Project '{name}' created by user ID {current_user_id}")
    return jsonify(project), 201

@app.route('/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    project = projects.get(project_id)
    if not project:
        return jsonify({"msg": "Project not found"}), 404
    if project['owner_id'] != current_user_id:
        return jsonify({"msg": "Permission denied"}), 403
    project['name'] = data.get('name', project['name'])
    project['description'] = data.get('description', project['description'])
    add_notification(f"Project '{project['name']}' updated by user ID {current_user_id}")
    return jsonify(project)

@app.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    current_user_id = get_jwt_identity()
    project = projects.get(project_id)
    if not project:
        return jsonify({"msg": "Project not found"}), 404
    if project['owner_id'] != current_user_id:
        return jsonify({"msg": "Permission denied"}), 403
    # Remove associated tasks
    to_delete_tasks = [tid for tid, t in tasks.items() if t['project_id'] == project_id]
    for tid in to_delete_tasks:
        del tasks[tid]
    del projects[project_id]
    add_notification(f"Project '{project['name']}' deleted by user ID {current_user_id}")
    return jsonify({"msg": "Project deleted"})

# ===============================
# TASKS API
# ===============================

@app.route('/projects/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
def get_tasks(project_id):
    current_user_id = get_jwt_identity()
    project = projects.get(project_id)
    if not project or project['owner_id'] != current_user_id:
        return jsonify({"msg": "Project not found or access denied"}), 404
    project_tasks = [t for t in tasks.values() if t['project_id'] == project_id]
    return jsonify(project_tasks)

@app.route('/projects/<int:project_id>/tasks', methods=['POST'])
@jwt_required()
def create_task(project_id):
    global task_id_counter
    current_user_id = get_jwt_identity()
    project = projects.get(project_id)
    if not project or project['owner_id'] != current_user_id:
        return jsonify({"msg": "Project not found or access denied"}), 404
    data = request.get_json()
    title = data.get('title')
    assigned_to = data.get('assigned_to', None)  # user id
    if not title:
        return jsonify({"msg": "Task title is required"}), 400
    task = {
        "id": task_id_counter,
        "project_id": project_id,
        "title": title,
        "completed": False,
        "assigned_to": assigned_to,
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    tasks[task_id_counter] = task
    task_id_counter += 1
    add_notification(f"Task '{title}' created in project '{project['name']}'")
    return jsonify(task), 201

@app.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    current_user_id = get_jwt_identity()
    task = tasks.get(task_id)
    if not task:
        return jsonify({"msg": "Task not found"}), 404
    project = projects.get(task['project_id'])
    if not project or project['owner_id'] != current_user_id:
        return jsonify({"msg": "Permission denied"}), 403
    data = request.get_json()
    task['title'] = data.get('title', task['title'])
    task['completed'] = data.get('completed', task['completed'])
    task['assigned_to'] = data.get('assigned_to', task['assigned_to'])
    add_notification(f"Task '{task['title']}' updated")
    return jsonify(task)

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    current_user_id = get_jwt_identity()
    task = tasks.get(task_id)
    if not task:
        return jsonify({"msg": "Task not found"}), 404
    project = projects.get(task['project_id'])
    if not project or project['owner_id'] != current_user_id:
        return jsonify({"msg": "Permission denied"}), 403
    del tasks[task_id]
    add_notification(f"Task ID {task_id} deleted")
    return jsonify({"msg": "Task deleted"})

# ===============================
# COMMENTS API
# ===============================

@app.route('/tasks/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(task_id):
    current_user_id = get_jwt_identity()
    task = tasks.get(task_id)
    if not task:
        return jsonify({"msg": "Task not found"}), 404
    project = projects.get(task['project_id'])
    if project['owner_id'] != current_user_id:
        return jsonify({"msg": "Permission denied"}), 403
    task_comments = [c for c in comments.values() if c['task_id'] == task_id]
    return jsonify(task_comments)

@app.route('/tasks/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(task_id):
    global comment_id_counter
    current_user_id = get_jwt_identity()
    task = tasks.get(task_id)
    if not task:
        return jsonify({"msg": "Task not found"}), 404
    project = projects.get(task['project_id'])
    if project['owner_id'] != current_user_id:
        return jsonify({"msg": "Permission denied"}), 403
    data = request.get_json()
    content = data.get("content")
    if not content:
        return jsonify({"msg": "Empty comment not allowed"}), 400
    comment = {
        "id": comment_id_counter,
        "task_id": task_id,
        "user_id": current_user_id,
        "content": content,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    comments[comment_id_counter] = comment
    comment_id_counter += 1
    add_notification(f"New comment added to task {task_id}")
    return jsonify(comment), 201

@app.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = get_jwt_identity()
    comment = comments.get(comment_id)
    if not comment:
        return jsonify({"msg": "Comment not found"}), 404
    if comment['user_id'] != current_user_id:
        return jsonify({"msg": "Permission denied"}), 403
    del comments[comment_id]
    add_notification(f"Comment ID {comment_id} deleted")
    return jsonify({"msg": "Comment deleted"})

# ===============================
# DASHBOARD API
# ===============================

@app.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    print("Authorization header:", request.headers.get("Authorization"))
    current_user_id = get_jwt_identity()
    user_projects = [p for p in projects.values() if p['owner_id'] == current_user_id]
    user_tasks = [t for t in tasks.values() if any(p['id'] == t['project_id'] for p in user_projects)]
    completed_tasks = [t for t in user_tasks if t.get('completed', False)]
    
    stats = {
        "totalProjects": len(user_projects),
        "totalTasks": len(user_tasks),
        "completedTasks": len(completed_tasks),
        "totalUsers": len(users)
    }
    return jsonify(stats)

# ===============================
# NOTIFICATIONS API
# ===============================

@app.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    return jsonify(notifications[-20:])  # last 20 notifications

# ===============================
# ZENO AI ASSISTANT API
# ===============================

@app.route('/zeno', methods=['POST'])
@jwt_required()
def zeno():
    data = request.get_json()
    user_message = data.get("message", "").lower()
    response = ""

    if not user_message:
        response = "Please tell me something, I'm here to assist you!"
    elif "hello" in user_message or "hi" in user_message:
        response = "Hello! I’m Zeno, your AI assistant. How can I help you in ProjectHub today?"
    elif "help" in user_message:
        response = "You can ask me about managing your projects, tasks, comments, or how to use the app."
    elif "projects" in user_message:
        response = "To manage projects, go to the Projects section where you can create, update, or delete projects."
    elif "tasks" in user_message:
        response = "Tasks can be created within projects, assigned, updated, and marked complete."
    else:
        response = "I'm Zeno, always learning to assist better. Could you please rephrase or ask specific questions?"

    return jsonify({"response": response})

# ===============================
# Run the app
# ===============================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
