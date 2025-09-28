import psycopg2, uuid, datetime
import traceback
from src.settings.colors import *
from src.model.db.DbConnect import *

class Participants:

    @staticmethod
    def create( usuario_id, grupo_id):

        db = Db_connect()
        cur = db.conn.cursor()

        participante_id = str(uuid.uuid4())
        try:
            print(cyan("[Banco de dados]: ") + green(f'Criando relação de participantes no banco de dados...'))
            cur.execute('''
                INSERT INTO participantes (id, grupo_id, usuario_id, data_entrada)
                VALUES (%s, %s, %s, %s)
            ''', (participante_id, grupo_id, usuario_id, datetime.datetime.now()))
            db.conn.commit()
            
            print(cyan("[Banco de dados]: ") + green(f'Participante adicionado com sucesso! (ID: {participante_id})'))
            return True, participante_id
        except Exception as e:
            print(cyan("[Banco de dados]: ") + red(f'Erro ao adicionar participante: {e}'))
            print(cyan("[Banco de dados]: ") + red('Traceback:\n' + traceback.format_exc()))
            return False, None
        finally:
            cur.close()
            db.conn.close()

    @staticmethod
    def delete(participante_id):

        db = Db_connect()
        cur = db.conn.cursor()

        print(cyan("[Banco de dados]: ") + Style.RESET_ALL + f'Deletando o participante com id {participante_id} do banco de dados...')
        try:
            cur.execute("DELETE FROM participantes WHERE id = %s;", (participante_id,))
            db.conn.commit()
            print(cyan("[Banco de dados]: ")  + Style.RESET_ALL + f'Participante com id {participante_id} deletado com sucesso!')
            return True
        except Exception as e:
            print(cyan("[Banco de dados]: ")  + Style.RESET_ALL + f'Erro ao deletar o participante: {e}')
            print(cyan("[Banco de dados]: ")  + Style.RESET_ALL + 'Traceback:\n' + traceback.format_exc())
            return False
        finally:
            cur.close()
            db.conn.close()

    @staticmethod
    def read(user_id, group_id):
            
            db = Db_connect()
            cur = db.conn.cursor()

            if group_id is None:
                # Se company_id for None, busque todas as empresas para o user_id
                query = "SELECT * FROM participantes WHERE usuario_id = %s"
                cur.execute(query, (user_id,))
            else:
                # Se company_id for fornecido, busque a relação específica
                print('[Banco de dados] ' + cyan(f'Buscando relação do usuário ({user_id}) com o grupo ({group_id})...'))
                query = "SELECT * FROM participantes WHERE usuario_id = %s AND groupo_id = %s"
                cur.execute(query, (user_id, group_id))
            
            #---------------------------------------------------------------INDICES---------------------
                                    #                        0         1             2     
            db_data = cur.fetchall() # Valores da linha: #company_id, user_id, user_access_level

            db.conn.commit()
            cur.close() # Fecha o cursor
            db.conn.close() # Fecha a conexão geral

            if db_data:

                l = []

                for i in db_data:
                    l.append({
                        "id":i[0],
                        "id_grupo":i[1],
                        "id_usuario":i[2],
                        "data_entrada":i[3]})

                return True, l
            else:
                return False, None
            

    @staticmethod
    def update(participante_id, grupo_id=None, usuario_id=None, data_entrada=None):

        db = Db_connect()
        cur = db.conn.cursor()

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
            db.conn.commit()
            print(f'{Fore.CYAN}[Banco de dados]{Fore.GREEN} Participante atualizado com sucesso!{Style.RESET_ALL}')
            return True
        
        except Exception as e:
            print(f"{Fore.CYAN}[Banco de dados]{Fore.RED} Erro ao atualizar participante: {e}{Style.RESET_ALL}")
            print(f"{Fore.CYAN}[Banco de dados]{Fore.RED} Traceback:\n{traceback.format_exc()}{Style.RESET_ALL}")
            return False
        
        finally:
            cur.close()
            db.conn.close()
