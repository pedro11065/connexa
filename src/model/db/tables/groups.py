import psycopg2
import uuid
import traceback
from src.settings.colors import *
from src.model.db.DbConnect import *

class Groups:

    @staticmethod
    def create(user_id, materia, objetivo, local, limite_participantes):

        db = Db_connect()
        cur = db.conn.cursor()

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
            db.conn.commit()
            print(cyan("[Banco de dados]: ") + green(f'Grupo de estudo "{materia}" criado com sucesso (ID: {grupo_id}).'))
            return True, grupo_id
        
        except Exception as e:
            print(cyan("[Banco de dados]: ") + red(f'Erro ao criar grupo de estudo: {e}'))
            print(cyan("[Banco de dados]: ") + red('Traceback:\n' + traceback.format_exc()))
            return False, None
        finally:
            cur.close()
            db.conn.close()

    @staticmethod
    def delete(id_grupo):

        db = Db_connect()
        cur = db.conn.cursor()

        try:
            cur.execute("DELETE FROM grupos_estudo WHERE id = %s;", (id_grupo,))
            db.conn.commit()
            print(green(f'Grupo com id {id_grupo} deletado com sucesso!'))
            return True
        except Exception as e:
            print(red(f'Erro ao deletar grupo: {e}'))
            print(red('Traceback:\n' + traceback.format_exc()))
            return False
        finally:
            cur.close()
            db.conn.close()

    @staticmethod    
    def read(id):

        db = Db_connect()
        cur = db.conn.cursor()

        params = []
        
        query = """
        SELECT * FROM grupos_estudo 
        WHERE usuario_criador_id = %s OR id = %s
        """
        params.extend([id, id])

        print(cyan("[Banco de dados]: ") + 'Pesquisando por usuário/grupo na tabela de grupos...')
        cur.execute(query, tuple(params))
        data = cur.fetchall()

        cur.close()
        db.conn.close()

        if not data:
            print(cyan("[Banco de dados]: ") + yellow('Nenhum grupo encontrado com os parâmetros fornecidos.'))
            return False, []
        
        else:
            print(cyan("[Banco de dados]: ") + green(f'{len(data)} grupo(s) encontrado(s).'))

            grupos = []

            if len(data) > 1:

                for grupo in data: 

                    grupos.append({
                        "id_grupo": grupo[0],
                        "id_criador": grupo[1],
                        "materia": grupo[2],
                        "objetivo": grupo[3],
                        "local": grupo[4],
                        "limite_participantes": grupo[5],
                        "status": grupo[6],
                        "criado_em": grupo[6]
                    })

                return True, grupos
            
            return True, {
                        "id_grupo": data[0][0],
                        "id_criador": data[0][1],
                        "materia": data[0][2],
                        "objetivo": data[0][3],
                        "local": data[0][4],
                        "limite_participantes": data[0][5],
                        "status": data[0][6],
                        "criado_em": data[0][7]
                    }


    @staticmethod
    def update(id_group, materia=None, objetivo=None, local=None, limite_participantes=None, status=None, data_encerramento=None):

        db = Db_connect()
        cur = db.conn.cursor()

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
            db.conn.commit()
            print(green(f'Grupo {id_group} atualizado com sucesso!'))
            return True
        
        except Exception as e:
            print(red(f'Erro ao atualizar grupo: {e}'))
            print(red('Traceback:\n' + traceback.format_exc()))
            return False
        
        finally:
            cur.close()
            db.conn.close()

