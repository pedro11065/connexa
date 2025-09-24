from src.model.db.DbController import Db; db = Db()
from flask_login import current_user

def validate_cpf_and_email(cpf, email):
    errors = [] 
    cpf_error = False
    email_error = False
    
def validate_cpf_and_email(cpf, email):
    errors = [] 
    cpf_error = False
    email_error = False
    
    # Verifica se o CPF já existe no banco e compara com o CPF do usuário atual
    if cpf is not None:
        existing_cpf_result = db.users.read(cpf)
        if existing_cpf_result[0]:  # Se encontrou um usuário
            existing_cpf = existing_cpf_result[1]
            if current_user.is_authenticated: # Checa se ele já está logado (Visto que este código é usado para registrar ou na tela de configurações)
                if existing_cpf.get('cpf') != getattr(current_user, 'cpf', None):
                    errors.append('CPF já cadastrado.')
                    cpf_error = True
            else:
                errors.append('CPF já cadastrado.')
                cpf_error = True

    # Verifica se o e-mail já existe no banco e compara com o e-mail do usuário atual
    if email is not None:
        existing_email_result = db.users.read(email)
        if existing_email_result[0]:  # Se encontrou um usuário
            existing_email = existing_email_result[1]
            if current_user.is_authenticated:
                if existing_email.get('email') != getattr(current_user, 'email', None):
                    errors.append('E-mail já cadastrado.')
                    email_error = True
            else:
                errors.append('E-mail já cadastrado.')
                email_error = True

    return errors, cpf_error, email_error