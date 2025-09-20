

from src.model.db.DbController import Db; db = Db()
from flask import jsonify
import os
class Group:
    
    @staticmethod
    def create(user_id, user_email, request):

        request = request.get_json()
        name = request.get('name')
        subject = request.get('subject')
        objective = request.get('objective')
        place = request.get('place')
        emails = request.get('emails')
        limit = len(emails) + 1  # +1 para o criador
        
        # Cria o grupo
        i = db.groups.create(user_id, subject, objective, place, limit)

        if i[0] == True:
            emails.append(user_email)

            for email in emails:
                user = db.users.read(email)
                db.participants.create(user["id"], i[1]) 
            
        if i:
            return jsonify({'success': True, 'message': 'Grupo criado com sucesso!'}), 200
        else:
            return jsonify({'success': False, 'message': 'Erro ao criar o grupo.'}), 500
            

    @staticmethod
    def read(user_id, request):

        #buscar no participantes e dps disso pesquisar no grupos, é possivel de se fazer isso com um join.      

        type = request.get_json().get('type')
        i = db.participants.read(user_id, None) #dados dos grupos que eu participo

        l = []

        if i[0]:
            
            for j in i[1]:
                
                k = db.groups.read(j["id_grupo"]) #puxar os dados do grupo
                l.append(k)


            return jsonify({'success': True, 'data':l, 'message': 'Grupo(s) encotrado(s) com sucesso!'}), 200
        else:
            return jsonify({'success': False, 'data':None, 'message': 'O usuário não está em nenhum grupo.'}), 500


            



    



        