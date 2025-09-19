from flask import Blueprint, request, render_template, redirect, session, jsonify
from flask_login import logout_user, login_required, current_user
from src import cache

from src.controller.dashboard.dashboard import info_dashboard
from src.model.database.participants.create import db_create_grupo_estudo

# Tudo aqui é: /user...

dashboard_request = Blueprint('auth_dashboard', __name__, template_folder='templates', static_folder='static')

# -------------------------------------------------------------------------------------

@dashboard_request.route(f'/user', methods=['POST','GET']) 
@login_required
def dashboard():
    if request.method == 'POST':
        data = request.get_json()
        user_id = str(current_user.id)
        group_name = data.get('name')
        materia = data.get('materia')
        objetivo = data.get('objetivo')
        local = data.get('local')
        emails = data.get('emails')
        limite_participantes = len(emails) + 1  # +1 para o criador
        
        # Cria o grupo
        success = db_create_grupo_estudo(user_id, materia, objetivo, local, limite_participantes)
        if success:
            return jsonify({'success': True, 'message': 'Grupo criado com sucesso!'}), 200
        else:
            return jsonify({'success': False, 'message': 'Erro ao criar o grupo.'}), 500
    
    if request.method == 'GET':
        return render_template('dashboard/dashboard.html')