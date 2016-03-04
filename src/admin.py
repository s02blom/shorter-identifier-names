ADMIN_KEY = 'admin'
ADMIN_SECRET = ''
ADMIN_PASSWORD = ''

class AdminAuthenticated(RequestHandler):
    def get_current_user(self):
        if self.get_secure_cookie(ADMIN_KEY) == ADMIN_SECRET:
            return self.get_secure_cookie(SESSION_KEY)
        return None


class Secret(AdminAuthenticated):
    def initialize(self, path):
        self.path = path

    @authenticated
    @gen.coroutine
    def get(self):
        self.finish("THIS IS MY SECRET!!!")


class AdminLogin(RequestHandler):
    @gen.coroutine
    def get(self):
        self.finish('<html><body><form action="/admin_login" method="post">'
                   'Name: <input type="text" name="name"><br>'
                   'Password: <input type="password" name="password">'
                   '<input type="submit" value="Sign in">'
                   '</form></body></html>')

    @gen.coroutine
    def post(self):
        name = self.get_argument('name')
        password = self.get_argument('password')
        if name == ADMIN_KEY and password == ADMIN_PASSWORD:
            self.set_secure_cookie(ADMIN_KEY, ADMIN_SECRET)
        self.finish()