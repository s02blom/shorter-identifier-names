import functools
import logging
import os
import uuid

from tornado import gen
from tornado.web import asynchronous, authenticated, RequestHandler, StaticFileHandler

from model import USER_SESSION_ID, ADMIN_ID

def fast(fn):
    return gen.coroutine(fn)

def familiar(fn):
    '''Decorator for request handlers that require a known user
        (someone who already has a session_id)
    '''
    return authenticated(gen.coroutine(fn))


# http://tornado.readthedocs.org/en/latest/guide/security.html
# http://stackoverflow.com/questions/7181785/send-cookies-with-curl
# curl -b cookies.txt -c cookies.txt http://example.com
class Authenticated(RequestHandler):
    IS_ADMIN = False
    def get_current_user(self):
        if self.IS_ADMIN == True:
            return self.get_secure_cookie(ADMIN_ID)
        return self.get_secure_cookie(USER_SESSION_ID)


class Home(Authenticated):
    def initialize(self, path, sessions, trials):
        self.path = path
        self.sessions = sessions
        self.trials = trials

    @fast
    def get(self):
        # new user
        if not self.get_secure_cookie(USER_SESSION_ID):

            # if there are no trials left, he will be redirected.
            trials_left = yield self.trials.count_left()
            if trials_left <= 0:
                self.redirect('/complete')
                return

            # Create a session for him and allow him through
            session_id = uuid.uuid4().hex
            headers = dict(agent=self.request.headers.get('User-Agent', 'None'),
                lang=self.request.headers.get('Accept-Language', 'None'))
            result = yield self.sessions.create(session_id, headers)
            self.set_secure_cookie(USER_SESSION_ID, session_id)
            logging.info('[Session] New user created %s' % session_id)

        self.render(self.path)


class Page(StaticFileHandler):
    def get_current_user(self):
        return self.get_secure_cookie(USER_SESSION_ID)

    @familiar
    def get(self, path, include_body=True):
        path += '.html'
        super(Page, self).get(path, include_body)


class CompletePage(StaticFileHandler):
    @fast
    def get(self, path, include_body=True):
        path += '.html'
        super(CompletePage, self).get(path, include_body)


class JsonAwareStaticFileHandler(StaticFileHandler):
    '''
        Automatically applies a Json Content-Type Header
        for static files ending with .json
    '''
    def prepare(self):
        path = self.request.uri
        path, ext = os.path.splitext(path)
        if ext == '.json':
            self.set_header("Content-Type", "application/json")


class Admin(Authenticated):
    IS_ADMIN = True
    def initialize(self, path, sessions):
        self.path = path
        self.sessions = sessions

    @familiar
    def get(self):
        self.render(self.path)


class AdminLogout(RequestHandler):
    @fast
    def get(self):
        self.clear_cookie(ADMIN_ID)
        self.redirect('/')


class AdminClearUserCookie(Authenticated):
    IS_ADMIN = True
    @familiar
    def put(self):
        self.clear_cookie(USER_SESSION_ID)
        self.finish(dict(data='Success'))


class AdminLogin(RequestHandler):
    @fast
    def get(self):
        self.write('''<form action="/admin/login" method="post">
            <input type="password" name="key" placeholder="key">
            <input type="submit" value="Sign in">
            </form>''')

    @fast
    def post(self):
        try:
            with open('.key', 'r') as f:
                t = f.read()
            key = self.get_argument("key")
            if key.strip() == t.strip():
                session_id = uuid.uuid4().hex
                self.set_secure_cookie(USER_SESSION_ID, session_id)
                self.set_secure_cookie(ADMIN_ID, session_id)
                self.redirect('/admin')
                return
            else:
                logging.warn("Wrong key: " + key)
        except Exception as e:
            print e
            logging.warn("ERROR IN POST TO ADMIN")
        self.redirect('/admin/login')