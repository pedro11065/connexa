
import uuid
from src.settings.colors import *
from src.model.db.DbConnect import *
from src.model.classes.user import *

class Users:

    @staticmethod
    def create(nome, email, senha, curso, periodo, status): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Registrando novo usuário...')

        # Conecta ao banco de dados
        db = Db_connect()
        cur = db.conn.cursor()

        id = str(uuid.uuid4()) # Gera um UUID e o converte para string
        
        # Insere os dados principais do usuário para armazenar na tabela
    
        cur.execute(f"INSERT INTO usuarios (id, nome, email, senha_hash, curso, periodo, status) VALUES ('{id}', '{nome}', '{email}', '{senha}', '{curso}', '{periodo}', '{status}');")

        # Confirma as mudanças
        db.conn.commit()

        # Fecha o cursor e encerra a conexão.
        cur.close()
        db.conn.close()

    @staticmethod
    def delete(id):
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'deletando usuário - delete_user')

        db = Db_connect()
        cur = db.conn.cursor()

        # Deleta os dados encontrados naquele e-mail.
        cur.execute(f"DELETE FROM usuarios WHERE id = '{id}'")
        
        # Atualiza as informações.
        db.conn.commit()

        # Fecha o cursor e encerra a conexão.
        cur.close()
        db.conn.close()

        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Usuário deletado com sucesso!')

    @staticmethod
    def read(search_data):

        db = Db_connect()
        cur = db.conn.cursor()

        # Novo padrão: busca por id, nome, email, curso, periodo ou status
        try:
            if len(search_data) == 36:  # UUID
                print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando usuário por id: {search_data}')
                cur.execute("SELECT * FROM usuarios WHERE id = %s;", (search_data,))
            elif '@' in search_data:
                print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando usuário por email: {search_data}')
                cur.execute("SELECT * FROM usuarios WHERE email = %s;", (search_data,))
            else:
                print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando usuário por nome: {search_data}')
                cur.execute("SELECT * FROM usuarios WHERE nome = %s;", (search_data,))
            db_data = cur.fetchone()
            if not db_data:
                print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + 'Nenhum usuário encontrado.')
                return False
            print(Fore.CYAN + '[Banco de dados] ' + Fore.GREEN + 'Dados do usuário encontrados com sucesso!' + Style.RESET_ALL)
            
            return {
                "id": db_data[0],
                "nome": db_data[1],
                "email": db_data[2],
                "senha_hash": db_data[3],
                "curso": db_data[4],
                "periodo": db_data[5],
                "status": db_data[6]
            }
        except Exception as error:
            print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Houve um erro: {error}')
            return False
        finally:
            cur.close()
            db.conn.close()

    @staticmethod
    def update(user_id, nome=None, email=None, senha=None, curso=None, periodo=None, status=None):

        db = Db_connect()
        cur = db.conn.cursor()

        print(Fore.GREEN + '[Alteração de dados] ' + Style.RESET_ALL + f'Alterando dados do usuário com id: {user_id}')
        try:
            # Monta dinamicamente os campos a serem atualizados
            fields = []
            values = []
            if nome is not None:
                fields.append('nome = %s')
                values.append(nome)
            if email is not None:
                fields.append('email = %s')
                values.append(email)
            if senha is not None:
                fields.append('senha = %s')
                values.append(senha)
            if curso is not None:
                fields.append('curso = %s')
                values.append(curso)
            if periodo is not None:
                fields.append('periodo = %s')
                values.append(periodo)
            if status is not None:
                fields.append('status = %s')
                values.append(status)
            if not fields:
                print(Fore.YELLOW + '[Alteração de dados] ' + Style.RESET_ALL + 'Nenhum campo para atualizar.')
                return False
            values.append(user_id)
            query = f"UPDATE usuarios SET {', '.join(fields)} WHERE id = %s;"
            cur.execute(query, tuple(values))
            conn.commit()
            print(Fore.GREEN + '[Alteração de dados] ' + Style.RESET_ALL + 'Ação realizada com sucesso!')
            return True
        except Exception as e:
            print(Fore.RED + '[Alteração de dados] ' + Style.RESET_ALL + f'Ocorreu um erro: {e}')
            return False
        finally:
            cur.close()
            db.conn.close()



