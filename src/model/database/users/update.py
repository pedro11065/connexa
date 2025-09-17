import psycopg2
from colorama import Fore, Style
from ..connect import connect_database

def db_update_user(user_id, nome=None, email=None, senha=None, curso=None, periodo=None, status=None):
    db_login = connect_database()
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()
    print(Fore.GREEN + '[Alteração de dados] ' + Style.RESET_ALL + f'Alterando dados do usuário com id: {user_id}')
    try:
        # Monta dinamicamente os campos a serem atualizados
        fields = []
        values = []
        if nome is not None:
            fields.append('nome = %s')
            values.append(nome)
        if email is not None:
            fields.append('email = %s')
            values.append(email)
        if senha is not None:
            fields.append('senha = %s')
            values.append(senha)
        if curso is not None:
            fields.append('curso = %s')
            values.append(curso)
        if periodo is not None:
            fields.append('periodo = %s')
            values.append(periodo)
        if status is not None:
            fields.append('status = %s')
            values.append(status)
        if not fields:
            print(Fore.YELLOW + '[Alteração de dados] ' + Style.RESET_ALL + 'Nenhum campo para atualizar.')
            return False
        values.append(user_id)
        query = f"UPDATE usuarios SET {', '.join(fields)} WHERE id = %s;"
        cur.execute(query, tuple(values))
        conn.commit()
        print(Fore.GREEN + '[Alteração de dados] ' + Style.RESET_ALL + 'Ação realizada com sucesso!')
        return True
    except Exception as e:
        print(Fore.RED + '[Alteração de dados] ' + Style.RESET_ALL + f'Ocorreu um erro: {e}')
        return False
    finally:
        cur.close()
        conn.close()



