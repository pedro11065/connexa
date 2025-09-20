import psycopg2
from src.settings.colors import *
from src import cache

from ..connect import connect_database

def db_update_participante(participante_id, grupo_id=None, usuario_id=None, data_entrada=None):
    db_login = connect_database()
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()
    updates = []
    params = []
    if grupo_id is not None:
        updates.append('grupo_id = %s')
        params.append(grupo_id)
    if usuario_id is not None:
        updates.append('usuario_id = %s')
        params.append(usuario_id)
    if data_entrada is not None:
        updates.append('data_entrada = %s')
        params.append(data_entrada)
    if not updates:
        print(f'{Fore.CYAN}[Banco de dados]{Fore.RED} Nenhum campo para atualizar!{Style.RESET_ALL}')
        return False
    params.append(participante_id)
    query = f'UPDATE participantes SET {", ".join(updates)} WHERE id = %s'
    try:
        cur.execute(query, tuple(params))
        conn.commit()
        print(f'{Fore.CYAN}[Banco de dados]{Fore.GREEN} Participante atualizado com sucesso!{Style.RESET_ALL}')
        return True
    except Exception as e:
        print(f"{Fore.CYAN}[Banco de dados]{Fore.RED} Erro ao atualizar participante: {e}{Style.RESET_ALL}")
        return False
    finally:
        cur.close()
        conn.close()




