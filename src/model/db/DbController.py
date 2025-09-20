from src.model.db.tables.users import Users
from src.model.db.tables.groups import Groups
from src.model.db.tables.participants import Participants


class Db:

    def __init__(self):
        
        self.users : object = Users()
        self.groups : object = Groups()
        self.participants : object = Participants()
