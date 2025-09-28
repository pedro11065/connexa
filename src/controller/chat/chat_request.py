from flask import Blueprint, request, render_template
from flask_login import login_required, current_user

from src.controller.chat.chat import Chat

chat_request = Blueprint('auth_chat', __name__, template_folder='templates', static_folder='static')

# /chat/messages/create
@chat_request.route('/messages/create', methods=['POST'])
@login_required
def sendMessage():
    user_id = str(current_user.id)
    return Chat.create_message(user_id, request)

# /chat/messages/read
@chat_request.route('/messages/read', methods=['GET'])
@login_required
def readMessages():
    user_id = str(current_user.id)
    return Chat.read_messages(user_id)

# /chat/messages/read/<group_id>
@chat_request.route('/messages/read/<group_id>', methods=['GET'])
@login_required
def read_group_messages(group_id):
    return Chat.read_messages(group_id)

# /dashboard/chat/advanced (assuming blueprint is registered under /dashboard/chat)
@chat_request.route('/advanced', methods=['GET'])
@login_required
def chat_advanced():
    return render_template('dashboard/chat_advanced.html')
