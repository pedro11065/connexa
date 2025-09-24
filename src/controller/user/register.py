from datetime import datetime
from flask import request, jsonify
from werkzeug.security import generate_password_hash
from src.model.validation.user.validate import validate_cpf_and_email
from src.model.db.DbController import Db; db = Db()
from colorama import Fore, Style

def process_registration(create_data):
    # Espera um JSON com as chaves: nome, email, senha, curso, periodo
    nome = create_data.get('nome')
    email = create_data.get('email')
    senha = create_data.get('senha')
    curso = create_data.get('curso')
    periodo = create_data.get('periodo')
    status = "Ativo"  # Status padrão para todos os novos usuários

    # Validação de email pode ser mantida se necessário
    errors, _, email_error = validate_cpf_and_email(None, email)

    if errors:
        print(Fore.GREEN + '\n[API Usuário - Registro] ' + Fore.RED + f'Erro(s): {errors}' + Style.RESET_ALL)
        return jsonify({"register": False, "email_error": email_error}), 200
    else:
        hashed_password = generate_password_hash(senha)
        db.users.create(nome, email, hashed_password, curso, periodo, status)
        print(Fore.GREEN + '[API Usuário - Registro] ' + Style.RESET_ALL + 'Cadastro realizado com sucesso!')
        return jsonify({"register": True}), 200