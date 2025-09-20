import psycopg2
from src.settings.colors import *
from src import cache

from ..connect import connect_database

def db_read_grupo(user_id=None, id_group=None):
    db_login = connect_database()
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()
    query = "SELECT * FROM grupos_estudo WHERE 1=1"
    params = []
    
    if user_id is not None:
        query += " AND usuario_criador_id = %s"
        params.append(user_id)
        
    if id_group is not None:
        query += " AND id = %s"
        params.append(id_group)

    cur.execute(query, tuple(params))
    grupos = cur.fetchall()
    cur.close()
    conn.close()
    if not grupos:
        print(yellow('Nenhum grupo encontrado com os parâmetros fornecidos.'))
        return []
    else:
        print(green(f'{len(grupos)} grupo(s) encontrado(s).'))
        return grupos

