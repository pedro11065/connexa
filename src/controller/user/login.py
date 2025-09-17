from werkzeug.security import check_password_hash
from flask_login import login_user
from flask_login import login_user, current_user
from flask import jsonify

from src.model.database.users.search import db_search_user
from src.model.database.participants.search import participants_search
from src.model.user_model import User

from colorama import Fore, Style

def process_login(data):
    email = data.get('email')
    password = data.get('senha')

    user_data = db_search_user(email)

    print(Fore.GREEN + '\n[API Login] ' + Style.RESET_ALL + f'Dados recebidos: \nEmail/cpf: {email}\nSenha: {password}')

    print(user_data)
    if user_data and check_password_hash(user_data['senha_hash'], password):
        user = User(
            id=user_data['id'],
            nome=user_data['nome'],
            email=user_data['email'],
            senha=user_data['senha_hash']           
        )

        login_user(user)
        id = user_data['id']

        
        if participants_search(id, None):
            print(Fore.GREEN + '[API Login] ' + Style.RESET_ALL + f'Usuário está relacionado a uma empresa!')
            return jsonify({'login': True, 'company': True, 'redirect_url': '/dashboard/user'}), 200
        else:
            print(Fore.GREEN + '[API Login] ' + Style.RESET_ALL + f'Usuário não está relacionado a uma empresa!')
            return jsonify({'login': True, 'company': False, 'redirect_url': '/dashboard/user'}), 200      

    
    print(Fore.RED + '[API Login] ' + Style.RESET_ALL + f'Login mal sucedido, a senha ou email/cpf está incorreto.')
    return jsonify({'login': False}), 200
