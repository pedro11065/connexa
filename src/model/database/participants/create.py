import psycopg2
from ..connect import connect_database
import uuid
from datetime import datetime

def db_create_participante( usuario_id, grupo_id):
    db_login = connect_database()
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()
    participante_id = str(uuid.uuid4())
    try:
        cur.execute('''
            INSERT INTO participantes (id, grupo_id, usuario_id, data_entrada)
            VALUES (%s, %s, %s, %s)
        ''', (participante_id, grupo_id, usuario_id, datetime.now()))
        conn.commit()
        print(f'Participante adicionado com sucesso! (ID: {participante_id})')
        return True, participante_id
    except Exception as e:
        print(f'Erro ao adicionar participante: {e}')
        return False, None
    finally:
        cur.close()
        conn.close()