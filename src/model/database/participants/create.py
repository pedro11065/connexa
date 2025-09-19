import psycopg2
from ..connect import connect_database
import uuid

def db_create_grupo_estudo(usuario_criador_id, materia, objetivo, local, limite_participantes):
    db_login = connect_database()  # Coleta os dados para conexão

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()

    grupo_id = str(uuid.uuid4())

    try:
        cur.execute("""
            INSERT INTO grupos_estudo (
                id, usuario_criador_id, materia, objetivo, local, limite_participantes
            ) VALUES (%s, %s, %s, %s, %s, %s);
        """, (
            grupo_id,
            usuario_criador_id,
            materia,
            objetivo,
            local,
            limite_participantes
        ))

        conn.commit()
        print(f'Grupo de estudo "{materia}" criado com sucesso (ID: {grupo_id}).')
        return True

    except Exception as e:
        print(f"Erro ao criar grupo de estudo: {e}")
        return False

    finally:
        cur.close()
        conn.close()