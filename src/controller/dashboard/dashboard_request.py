from flask import Blueprint, request, render_template, redirect, session, jsonify
from flask_login import logout_user, login_required, current_user
from src import cache

from src.controller.dashboard.dashboard import Group
# Tudo aqui é: /user...

dashboard_request = Blueprint('auth_dashboard', __name__, template_folder='templates', static_folder='static')

# -------------------------------------------------------------------------------------

@dashboard_request.route(f'/user', methods=['POST','GET']) 
@login_required
def dashboard():
    if request.method == 'POST':    
        user_id = str(current_user.id)
        request_data = request.get_json()
        request_type = request_data.get('type') if request_data else None
        
        if request_type == 'user_info':
            return jsonify({'success': True, 'user_id': user_id, 'user_name': current_user.nome})
        else:
            return Group.info_groups(user_id, request)
    
    if request.method == 'GET':
        return render_template('dashboard/dashboard.html')
    

@dashboard_request.route(f'create/group', methods=['POST','GET']) 
@login_required
def create():
    if request.method == 'POST':
        user_id = str(current_user.id); user_email = str(current_user.email)
        return Group.create_group(user_id, user_email, request)
    
@dashboard_request.route(f'messages/send', methods=['POST','GET']) 
@login_required
def send_message():
    if request.method == 'POST':
        user_id = str(current_user.id)
        return Group.create_message(user_id, request)
    

@dashboard_request.route(f'messages/read', methods=['POST','GET']) 
@login_required
def read_messages():
    if request.method == 'GET':
        user_id = str(current_user.id)
        return Group.read_messages(user_id)
        
@dashboard_request.route(f'messages/read/<group_id>', methods=['GET']) 
@login_required
def read_group_messages(group_id):
    user_id = str(current_user.id)
    return Group.read_messages(user_id, group_id)

@dashboard_request.route(f'chat/advanced', methods=['GET']) 
@login_required
def chat_advanced():
    return render_template('dashboard/chat_advanced.html')