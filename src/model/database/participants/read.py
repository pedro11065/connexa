# Pesquisa um valor na tabela "table_user_companies" que registra as relações entre os demais usuários de uma empresa, além do criador

import psycopg2
from src.settings.colors import *
from src import cache

from ..connect import connect_database

def db_participants_read(user_id, group_id):
        db_login = connect_database() # Coleta os dados para conexão

        #Conecta ao banco de dados.
        conn = psycopg2.connect(
            host=db_login[0],
            database=db_login[1],
            user=db_login[2],
            password=db_login[3]
        )
        cur = conn.cursor() # Cria um cursor no PostGreSQL

        if group_id is None:
            # Se company_id for None, busque todas as empresas para o user_id
            query = "SELECT * FROM participantes WHERE usuario_id = %s"
            cur.execute(query, (user_id,))
        else:
            # Se company_id for fornecido, busque a relação específica
            print('[Banco de dados] ' + cyan(f'Buscando relação do usuário ({user_id}) com o grupo ({group_id})...  '))
            query = "SELECT * FROM participantes WHERE usuario_id = %s AND groupo_id = %s"
            cur.execute(query, (user_id, group_id))
        
        #---------------------------------------------------------------INDICES---------------------
                                 #                        0         1             2     
        db_data = cur.fetchall() # Valores da linha: #company_id, user_id, user_access_level

        conn.commit()
        cur.close() # Fecha o cursor
        conn.close() # Fecha a conexão geral

        if db_data:
            return True, db_data
        else:
            return False, None