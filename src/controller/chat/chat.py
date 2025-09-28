from src.model.db.DbController import Db; db = Db()
from flask import jsonify

class Chat:
    @staticmethod
    def create_message(user_id, request):
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Requisição inválida.'}), 400

        message = data.get('message')
        group_id = data.get('groupId') or data.get('group_id')

        result = db.messages.create(group_id, user_id, message)
        if result[0]:
            return jsonify({'success': True, 'message': 'Mensagem enviada com sucesso!', 'id': result[1]}), 200
        else:
            return jsonify({'success': False, 'message': 'Erro ao enviar mensagem.'}), 500

    @staticmethod
    def read_messages(user_id, group_id=None):
        result = db.messages.read(user_id)
        if not result[0]:
            return jsonify({'success': False, 'message': 'Erro ao ler mensagem.'}), 500

        messages = result[1] or []

        # Filtra por grupo, se fornecido
        if group_id is not None:
            try:
                messages = [m for m in messages if str(m.get('group_id')) == str(group_id)]
            except Exception:
                pass

        # Agrega informações dos usuários relacionados às mensagens
        users = []
        seen_ids = set()
        for m in messages:
            uid = m.get('user_id')
            if uid and uid not in seen_ids:
                u = db.users.read(uid)
                if isinstance(u, tuple):
                    ok, data = u
                    if ok:
                        seen_ids.add(data.get('id'))
                        users.append(data)
                else:
                    try:
                        seen_ids.add(u['id'])
                        users.append(u)
                    except Exception:
                        pass

        return jsonify({
            'success': True,
            'message': 'Mensagens encontradas com sucesso!',
            'data': {'message': messages, 'users': users}
        }), 200
