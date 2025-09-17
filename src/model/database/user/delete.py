import psycopg2
from colorama import Fore, Style

from ..connect import connect_database

def db_delete_user(id):
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'deletando usuário - delete_user')

    db_login = connect_database() # Coleta os dados para conexão

    # Conecta ao banco de dados
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    # Cria um cursor
    cur = conn.cursor()

    # Deleta os dados encontrados naquele e-mail.
    cur.execute(f"DELETE FROM usuarios WHERE id = '{id}'")
    
    # Atualiza as informações.
    conn.commit()

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()

    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Usuário deletado com sucesso!')