import psycopg2
from colorama import Fore, Style
from src import cache

from ..connect import connect_database

def db_search_group(search_data):

    # Caso não esteja no cache, busca no banco de dados
    db_login = connect_database() # Coleta os dados para conexão
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL
    data = search_data

    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando dados do grupo com id: {search_data}')
    cur.execute(f"SELECT * from table_groups WHERE group_id = '{data}';")
    
    db_data = cur.fetchall()

    #---------------------------------------------------------------INDICES---------------------
                   #                         0         1            2            3             4             5
    conn.commit(); # Valores da linha: #group_id, user_id, group_name, group_email, group_cnpj, group_password
    cur.close();
    conn.close()

    try:
        if db_data:
            print(Fore.CYAN + '[Banco de dados] ' + Fore.GREEN + 'Dados do grupo encontrados com sucesso!' + Style.RESET_ALL)

            cache.set(f'group_{search_data}', db_data, timeout=600) # Armazena o grupo no cache
            return db_data
        else:
            print(Fore.CYAN + '[Banco de dados] ' + Fore.RED + 'Dados do grupo não foram encontrados!' + Style.RESET_ALL)
            return None
    
    except:
        print(Fore.CYAN + '[Banco de dados] ' + Fore.RED  + f'Erro ao responder dados solicitados.' + Style.RESET_ALL)
        return False
