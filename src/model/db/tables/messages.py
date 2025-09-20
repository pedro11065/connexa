import uuid
import datetime
from src.settings.colors import *
from src.model.db.DbConnect import *

class Messages:
    @staticmethod
    def create(grupo_id, usuario_id, conteudo):
        db = Db_connect()
        cur = db.conn.cursor()
        mensagem_id = str(uuid.uuid4())
        try:
            print(cyan("[Banco de dados]: ") + green(f'Criando mensagem no banco de dados...'))
            cur.execute('''
                INSERT INTO mensagens (id, grupo_id, usuario_id, conteudo, data_envio)
                VALUES (%s, %s, %s, %s, %s)
            ''', (mensagem_id, grupo_id, usuario_id, conteudo, datetime.datetime.now()))
            db.conn.commit()
            print(cyan("[Banco de dados]: ") + green(f'Mensagem adicionada com sucesso! (ID: {mensagem_id})'))
            return True, mensagem_id
        except Exception as e:
            print(cyan("[Banco de dados]: ") + red(f'Erro ao adicionar mensagem: {e}'))
            return False, None
        finally:
            cur.close()
            db.conn.close()

    @staticmethod
    def delete(mensagem_id):
        db = Db_connect()
        cur = db.conn.cursor()
        print(cyan("[Banco de dados]: ") + f'Deletando a mensagem com id {mensagem_id} do banco de dados...')
        try:
            cur.execute("DELETE FROM mensagens WHERE id = %s;", (mensagem_id,))
            db.conn.commit()
            print(cyan("[Banco de dados]: ") + green(f'Mensagem com id {mensagem_id} deletada com sucesso!'))
            return True
        except Exception as e:
            print(cyan("[Banco de dados]: ") + red(f'Erro ao deletar a mensagem: {e}'))
            return False
        finally:
            cur.close()
            db.conn.close()

    @staticmethod
    def read(grupo_id=None, usuario_id=None):
        db = Db_connect()
        cur = db.conn.cursor()
        try:
            if grupo_id and usuario_id:
                cur.execute("SELECT * FROM mensagens WHERE grupo_id = %s AND usuario_id = %s ORDER BY data_envio ASC", (grupo_id, usuario_id))
            elif grupo_id:
                cur.execute("SELECT * FROM mensagens WHERE grupo_id = %s ORDER BY data_envio ASC", (grupo_id,))
            elif usuario_id:
                cur.execute("SELECT * FROM mensagens WHERE usuario_id = %s ORDER BY data_envio ASC", (usuario_id,))
            else:
                cur.execute("SELECT * FROM mensagens ORDER BY data_envio ASC")
            mensagens = cur.fetchall()
            db.conn.commit()
            return True, mensagens
        
        except Exception as e:
            print(cyan("[Banco de dados]: ") + red(f'Erro ao buscar mensagens: {e}'))
            return False, []
        finally:
            cur.close()
            db.conn.close()

    @staticmethod
    def update(mensagem_id, conteudo=None):
        db = Db_connect()
        cur = db.conn.cursor()
        updates = []
        params = []
        if conteudo is not None:
            updates.append('conteudo = %s')
            params.append(conteudo)
        if not updates:
            print(cyan("[Banco de dados]: ") + red('Nenhum campo para atualizar!'))
            return False
        params.append(mensagem_id)
        query = f'UPDATE mensagens SET {", ".join(updates)} WHERE id = %s'
        try:
            cur.execute(query, tuple(params))
            db.conn.commit()
            print(cyan("[Banco de dados]: ") + green('Mensagem atualizada com sucesso!'))
            return True
        except Exception as e:
            print(cyan("[Banco de dados]: ") + red(f'Erro ao atualizar mensagem: {e}'))
            return False
        finally:
            cur.close()
            db.conn.close()


