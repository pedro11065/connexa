import psycopg2
from colorama import Fore, Style
from ..connect import connect_database

def db_search_user(search_data):
    db_login = connect_database()
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()

    # Novo padrão: busca por id, nome, email, curso, periodo ou status
    try:
        if len(search_data) == 36:  # UUID
            print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando usuário por id: {search_data}')
            cur.execute("SELECT * FROM usuarios WHERE id = %s;", (search_data,))
        elif '@' in search_data:
            print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando usuário por email: {search_data}')
            cur.execute("SELECT * FROM usuarios WHERE email = %s;", (search_data,))
        else:
            print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando usuário por nome: {search_data}')
            cur.execute("SELECT * FROM usuarios WHERE nome = %s;", (search_data,))
        db_data = cur.fetchone()
        if not db_data:
            print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + 'Nenhum usuário encontrado.')
            return False
        print(Fore.CYAN + '[Banco de dados] ' + Fore.GREEN + 'Dados do usuário encontrados com sucesso!' + Style.RESET_ALL)
        return {
            "id": db_data[0],
            "nome": db_data[1],
            "email": db_data[2],
            "senha": db_data[3],
            "curso": db_data[4],
            "periodo": db_data[5],
            "status": db_data[6]
        }
    except Exception as error:
        print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Houve um erro: {error}')
        return False
    finally:
        cur.close()
        conn.close()