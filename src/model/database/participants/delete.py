import psycopg2
from psycopg2 import sql
from colorama import Fore, Style

from ..connect import connect_database

def db_delete_participante(participante_id):
    db_login = connect_database()
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()
    print(Fore.GREEN + '[Exclusão de Participante] ' + Style.RESET_ALL + f'Deletando o participante com id {participante_id} do banco de dados...')
    try:
        cur.execute("DELETE FROM participantes WHERE id = %s;", (participante_id,))
        conn.commit()
        print(Fore.GREEN + '[Exclusão de Participante] ' + Style.RESET_ALL + f'Participante com id {participante_id} deletado com sucesso!')
        return True
    except Exception as e:
        print(Fore.RED + '[Exclusão de Participante] ' + Style.RESET_ALL + f'Erro ao deletar o participante: {e}')
        return False
    finally:
        cur.close()
        conn.close()
