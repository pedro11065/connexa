import psycopg2
from src.settings.colors import *

from ..connect import connect_database

def db_delete_grupo(id_grupo):
    db_login = connect_database()
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM grupos_estudo WHERE id = %s;", (id_grupo,))
        conn.commit()
        print(green(f'Grupo com id {id_grupo} deletado com sucesso!'))
        return True
    except Exception as e:
        print(red(f'Erro ao deletar grupo: {e}'))
        return False
    finally:
        cur.close()
        conn.close()
