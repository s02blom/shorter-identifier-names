import logging
import os

# Set abspath to local
abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.options import define, options
from tornado.web import Application, asynchronous, url, StaticFileHandler

from config import environment, config_file

import api
import web
import model

from motor import MotorClient
from mongocare import ObjectIdAsTimestamp

def initialize(connection_string):
    database = MotorClient(connection_string).experiment
    database.add_son_manipulator(ObjectIdAsTimestamp())

    session_status = model.SessionStatus()
    sessions = model.Sessions(database)
    seeder = model.Final()
    snippets = model.Snippets()
    emails = model.Emails(database)
    trials = model.Trials(database)

    template_path = './static/templates/'
    def static(pattern):
        return url(pattern, web.Page, dict(path=template_path))

    def template(file_, **kwargs):
        t = dict(path= template_path + '%s' % file_)
        t.update(kwargs)
        return t

    routes = [
        url(r'/', web.Home, template('home.html', sessions=sessions, trials=trials)),
        static(r'/(questions)/?'),
        static(r'/(tutorial)/?'),
        static(r'/(experiment)/?'),
        url(r'/(complete)/?', web.CompletePage, dict(path=template_path)),
        url(r'/admin/?', web.Admin, template('admin.html', sessions=sessions)),
        url(r'/admin/login?', web.AdminLogin),
        url(r'/admin/logout?', web.AdminLogout),
        url(r'/admin/clear?', web.AdminClearUserCookie),

        url(r'/api/trial/?', api.Trial, dict(sessions=sessions,trials=trials)),
        url(r'/api/form/?', api.Form, dict(sessions=sessions, session_status=session_status, trials=trials)),   # post
        url(r'/api/email/?', api.EmailForm, dict(emails=emails)),   # post
        url(r'/api/admin/db\.json', api.AdminDbDump, dict(sessions=sessions)),
        url(r'/api/admin/sessions/?', api.AdminSessions, dict(sessions=sessions)),
        url(r'/api/admin/emails/?', api.AdminEmails, dict(emails=emails)),
        url(r'/api/admin/sessions/([\w^/]+)?', api.AdminSessionData, dict(sessions=sessions)),
        url(r'/api/admin/trials/?', api.AdminTrials, dict(trials=trials, seeder=seeder)),
        url(r'/api/admin/trials/([\w^/]+)?', api.AdminUpdateTrials, dict(trials=trials)),
        url(r'/api/admin/duplicates/?', api.Duplicates, dict(sessions=sessions, trials=trials)),
        url(r'/api/admin/missing/?', api.Missing, dict(sessions=sessions, trials=trials)),
        url(r'/api/admin/snippets/?', api.AdminSnippets, dict(snippets=snippets)),
    ]

    return routes

def sanity_check(options):
    with open('.key') as admin_keyfile:
        if not admin_keyfile.read().strip():
            message = ("Please define a password for the administrative account"
            " by writing the key into the .key file")
            print message
            exit(-1)

    if not options.cookie_secret:
        environment = os.environ.get('PETER_ENV', 'local').strip()
        message = """You did not define a cookie key for the current environment. The cookie secret is used to secure sessions on the server. You are currently running the "'%s"' environment. The environment is "'local"' by default. It can be changed using the PETER_ENV environment variable, or by passing a --cookie_secret option to this script.
            \nBefore starting up, please define secret cookie key by setting the 'cookie_secret' variable in the file \n\n
\tconfig/%s.cfg
\n
You can generate a secret key by running:\n\n
\t$ python -c "import os; print(os.urandom(32))\n
"""
        message = message % (environment, environment)
        print message
        exit(-1)

def main():
    options.parse_config_file(config_file, final=False)
    options.parse_command_line()

    sanity_check(options)

    settings = dict(
        compress_response=True,
        cookie_secret=options.cookie_secret,
        debug=options.debug,
        login_url=options.login_url,
        static_handler_class=web.JsonAwareStaticFileHandler,
        static_path='static/',
        xheaders=True,
    )

    routes = initialize(options.database)

    application = Application(routes, **settings)

    server = HTTPServer(application, xheaders=True)
    server.bind(options.port)
    server.start(1)  # Forks multiple sub-processes
    logging.info('Configured for "%s"' % environment)
    logging.info('Running on port %s' % options.port)
    IOLoop.current().start()

if __name__ == '__main__':
    main()