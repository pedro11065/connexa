import psycopg2
import uuid
from src.settings.colors import *

from ..connect import connect_database

def db_create_grupo(user_id, materia, objetivo, local, limite_participantes):
    db_login = connect_database()
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()
    grupo_id = str(uuid.uuid4())
    try:
        cur.execute('''
            INSERT INTO grupos_estudo (
                id, usuario_criador_id, materia, objetivo, local, limite_participantes
            ) VALUES (%s, %s, %s, %s, %s, %s)
        ''', (
            grupo_id,
            user_id,
            materia,
            objetivo,
            local,
            limite_participantes
        ))
        conn.commit()
        print(green(f'Grupo de estudo "{materia}" criado com sucesso (ID: {grupo_id}).'))
        return True, grupo_id
    
    except Exception as e:
        print(red(f'Erro ao criar grupo de estudo: {e}'))
        return False, None
    finally:
        cur.close()
        conn.close()



