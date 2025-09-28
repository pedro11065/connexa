from flask import Blueprint, request, render_template, redirect, session, jsonify
from flask_login import logout_user, login_required, current_user

from src.controller.dashboard.dashboard import Group

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
            return jsonify({'success': True, 'user_id': user_id, 'user_name': current_user.fullname})
        else:
            return Group.info_groups(user_id, request)
    
    if request.method == 'GET':
        return render_template('dashboard/dashboard.html')
    

@dashboard_request.route(f'create/group', methods=['POST','GET']) 
@login_required
def createGroup():
    if request.method == 'POST':
        user_id = str(current_user.id); user_email = str(current_user.email)
        return Group.create_group(user_id, user_email, request)
    
    
@dashboard_request.route(f'read/group', methods=['POST','GET']) 
@login_required
def readGroup():
    if request.method == 'GET':
        user_id = str(current_user.id)
        return Group.read_group(user_id, request)