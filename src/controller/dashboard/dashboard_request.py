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
        return Group.read(user_id, request)
    
    if request.method == 'GET':
        return render_template('dashboard/dashboard.html')
    

@dashboard_request.route(f'create/group', methods=['POST','GET']) 
@login_required
def criar_grupo():
    if request.method == 'POST':
        user_id = str(current_user.id); user_email = str(current_user.email)
        return Group.create(user_id, user_email, request)