

from src.model.db.DbController import Db; db = Db()
from flask import jsonify

class Group:
    
    @staticmethod
    def create(user_id, request):

            request = request.get_json()
            name = request.get('name')
            subject = request.get('subject')
            objective = request.get('objective')
            place = request.get('place')
            emails = request.get('emails')
            limit = len(emails) + 1  # +1 para o criador
            
            # Cria o grupo
            success = db.groups.create(user_id, subject, objective, place, limit)
            if success[0] == True:
                success = db.participants.create(user_id, success[0]) 
                
            if success:
                return jsonify({'success': True, 'message': 'Grupo criado com sucesso!'}), 200
            else:
                return jsonify({'success': False, 'message': 'Erro ao criar o grupo.'}), 500
            
    @staticmethod
    def read(user_id, request):

            #buscar no participantes e dps disso pesquisar no grupos, é possivel de se fazer isso com um join.

            type = request.get_json().get('type')
            success = db.groups.read(type, user_id, None)

            if success:
                return jsonify({'success': True, 'data':success[0], 'message': 'Grupo(s) encotrado(s) com sucesso!'}), 200
            else:
                return jsonify({'success': False, 'data':None, 'message': 'O usuário não está em nenhum grupo.'}), 500

    
            



    



        