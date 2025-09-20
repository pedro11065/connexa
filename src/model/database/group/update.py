import psycopg2
from src.settings.colors import *
from src import cache

from ..connect import connect_database

def db_update_groupo(id_group, materia=None, objetivo=None, local=None, limite_participantes=None, status=None, data_encerramento=None):
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
    if materia is not None:
        updates.append('materia = %s')
        params.append(materia)
    if objetivo is not None:
        updates.append('objetivo = %s')
        params.append(objetivo)
    if local is not None:
        updates.append('local = %s')
        params.append(local)
    if limite_participantes is not None:
        updates.append('limite_participantes = %s')
        params.append(limite_participantes)
    if status is not None:
        updates.append('status = %s')
        params.append(status)
    if data_encerramento is not None:
        updates.append('data_encerramento = %s')
        params.append(data_encerramento)
    if not updates:
        print(yellow('Nenhum campo para atualizar.'))
        return False
    params.append(id_group)
    query = f'UPDATE grupos_estudo SET {", ".join(updates)} WHERE id = %s'
    try:
        cur.execute(query, tuple(params))
        conn.commit()
        print(green(f'Grupo {id_group} atualizado com sucesso!'))
        return True
    except Exception as e:
        print(red(f'Erro ao atualizar grupo: {e}'))
        return False
    finally:
        cur.close()
        conn.close()

