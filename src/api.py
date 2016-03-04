from collections import Counter
import json
import logging
import datetime

from model import ADMIN_ID
from bson import json_util
from web import Authenticated, familiar


class Api(Authenticated):
    def _prepare_request(self):
        content_type = self.request.headers.get("Content-Type", '')
        if content_type and content_type.startswith("application/json"):
            json_args = json.loads(self.request.body)
            self.json = json_args.get('data', {})

    def _prepare_response(self):
        self.set_header("Content-Type", "application/json")

    def prepare(self):
        self._prepare_request()
        self._prepare_response()

    def data(self, result):
        self.finish(dict(data=result))

    def _label(self, message):
        return "[%s] %s" % (self.__class__.__name__.upper(), message)

    def debug(self, message):
        logging.debug(self._label(message))

    def info(self, message):
        logging.info(self._label(message))

    def warn(self, message):
        logging.warn(self._label(message))


class Admin(Api):
    IS_ADMIN = True


class AdminSessionData(Admin):
    def initialize(self, sessions):
        self.sessions = sessions

    @familiar
    def get(self, user_session_id):
        result = yield self.sessions.data_for_user(user_session_id)
        self.data(result)

    def mark_as_duplicate(self, user_session_id):
        result = yield self.sessions.mark_as_duplicate(user_session_id)
        self.data(result)

    def change_valid_state(self, user_session_id):
        data = yield self.sessions.is_session_valid(user_session_id)
        valid = not data.get('valid', False)
        result = yield self.sessions.change_valid(user_session_id, valid)
        self.data(result)

    @familiar
    def put(self, user_session_id):
        try:
            duplicate = json.loads(self.request.body)['duplicate']
        except:
            duplicate = False

        if duplicate:
            return self.mark_as_duplicate(user_session_id)
        return self.change_valid_state(user_session_id)


class AdminEmails(Admin):
    def initialize(self, emails):
        self.emails = emails

    @familiar
    def get(self):
        cursor = self.emails.all()
        result = yield cursor.to_list(1024)
        self.data(result)


class AdminSessions(Admin):
    def initialize(self, sessions):
        self.sessions = sessions

    @familiar
    def delete(self):
        empty = self.get_argument("empty", "", strip=True).lower()
        if empty == "true":
            return self.drop_empty()
        return self.drop_all()

    def drop_empty(self):
        result = yield self.sessions.drop_empty()
        self.finish()

    def drop_all(self):
        result = yield self.sessions.drop_all()
        self.finish()

    @familiar
    def get(self):
        stats = self.get_argument("stats", "", strip=True).lower()
        if stats == 'true':
            return self.stats()
        return self.list()

    def stats(self):
        total,empty = yield self.sessions.stats()
        self.data(dict(total=total,empty=empty))

    def list(self):
        result = yield self.sessions.list()
        result.sort(key=lambda o:o['value']['created'], reverse=False)
        self.data(result)

class AdminDbDump(Admin):
    '''Allows downloading of complete db dump'''
    def initialize(self, sessions):
        self.sessions = sessions

    @familiar
    def get(self):
        cursor = self.sessions.full()
        result = yield cursor.to_list(1024)
        date = datetime.date.today().strftime('%Y-%m-%d')
        self.set_header("Content-Disposition", 'attachment; filename="db-%s.json"' % date)
        self.data(result)


class AdminSnippets(Admin):
    def initialize(self, snippets):
        self.snippets = snippets

    @familiar
    def get(self):
        name = self.get_argument("file", None, strip=True)
        if not name:
            names = yield self.snippets.names()
            self.debug("Retrieving all snippets")
            self.data(names)
        else:
            file_ = yield self.snippets.file(name)
            if file_:
                self.debug('Delivering %s' % name)
                self.set_header("Content-Type", "text/html")
                self.render(file_)
            else:
                self.set_status(404)
                self.finish()


class AdminTrials(Admin):
    def initialize(self, trials, seeder):
        self.seeder = seeder # seeder is pretest, at the moment
        self.trials = trials

    @familiar
    def get(self):
        issued = self.get_argument("issued", "", strip=True).lower()
        if issued == 'true':
            return self.get_issued()

        finished = self.get_argument("finished", "", strip=True).lower()
        if finished == 'true':
            return self.get_finished()

        return self.get_all()

    @familiar
    def post(self):
        yield self.trials.clear()
        sequences = self.seeder.seed()
        for sequence in sequences:
            result = yield self.trials.add_sequence(sequence)
        self.data("Success")

    @familiar
    def put(self):
        stop = self.get_argument("stop", "", strip=True).lower()
        if stop == 'true':
            return self.stop_all()
        return self.reset_issued()

    def stop_all(self):
        cursor = yield self.trials.stop_all()
        self.finish()

    def reset_issued(self):
        cursor = yield self.trials.reset_issued()
        self.finish()

    def get_all(self):
        cursor = self.trials.all()
        result = yield cursor.to_list(1024)
        self.data(result)

    def get_issued(self):
        cursor = self.trials.issued()
        result = yield cursor.to_list(1024)
        self.data(result)

    def get_finished(self):
        finished = yield self.trials.finished().count()
        all_ = yield self.trials.all().count()
        self.data(dict(all=all_, finished=finished))


class AdminUpdateTrials(Admin):
    def initialize(self, trials):
        self.trials = trials

    @familiar
    def put(self, key):
        finished = 0
        try:
            finished = int(self.json.get('finished', 0))
        except Exception as e:
            self.info(e)
        if finished:
            return self._close(key)
        return self._open(key)

    def _open(self, key):
        yield self.trials.open(key)
        self.finish()

    def _close(self, key):
        yield self.trials.close(key)
        self.finish()


class EmailForm(Api):
    def initialize(self, emails):
        self.emails = emails

    @familiar
    def post(self):
        result = yield self.emails.add(self.json)
        self.data("Success")


class Form(Api):
    def initialize(self, sessions, session_status, trials):
        self.status = session_status
        self.sessions = sessions
        self.trials = trials

    @familiar
    def post(self):
        self.debug('Storing data for %s: %s' % (self.current_user, self.json))
        self.info('Storing data for %s' % (self.current_user))
        result = yield self.sessions.save_form(self.current_user, self.json)

        # check if all data was collected and seal the document.
        provided_data = yield self.sessions.provided_data(self.current_user)
        session_completed = self.status.check(provided_data)

        if session_completed:
            # seal it all up
            session = yield self.sessions.for_(self.current_user)
            snippets = session.get('snippets', None)
            self.info("Sealing Snippets : %s" % snippets)
            result = yield [
                self.sessions.seal(self.current_user),
                self.trials.seal(snippets)
            ]

        self.data("Success")


class Duplicates(Admin):
    def initialize(self, sessions, trials):
        self.sessions = sessions
        self.trials = trials

    def _valid_sessions(self, sessions):
        return [
            session['value'] for session in sessions
            if session['value']['valid'] == True
        ]

    @familiar
    def get(self):
        sessions, trials = yield [
            self.sessions.list(),
            self.trials.all().to_list(1024)
        ]

        def key(snippets):
            return ','.join(snippets)

        valid_sessions = self._valid_sessions(sessions)

        seen = {}
        for session in valid_sessions:
            chain = key(session['snippets'])
            if chain not in seen.keys():
                seen[chain] = []

            seen[chain].append(session['USER_SESSION_ID'])

        duplicates = [[key.split(','), sessions] for key,sessions in seen.iteritems() if len(sessions) > 1]
        self.data(duplicates)

class Missing(Admin):
    def initialize(self, sessions, trials):
        self.sessions = sessions
        self.trials = trials

    @familiar
    def get(self):
        sessions = yield self.sessions.list()
        trials = yield self.trials.all().to_list(1024)

        def key(snippets):
            return ','.join(snippets)

        finished_sessions = {key(session['value']['snippets']) for session in sessions if session['value']['valid'] == True}
        all_trials = {key(trial['snippets']) for trial in trials}
        missing =[k.split(',') for k in (all_trials - finished_sessions)]
        self.data(missing)


class Trial(Api):
    def initialize(self, sessions, trials):
        self.sessions = sessions
        self.trials = trials

    @familiar
    def post(self):
        self.debug('Storing data for %s: %s' % (self.current_user, self.json))
        self.info('Storing data for %s' % (self.current_user))
        result = yield self.sessions.save_trial(self.current_user, self.json)
        self.data("Success")

    @familiar
    def get(self):
        user = self.current_user
        session = yield self.sessions.for_(user)
        trials = None
        if not session or not session.get('snippets', None):
            # Issue new one
            self.info("Key requested by session %s" % user)
            document = yield self.trials.unique()
            if not document:
                self.data("Done")
                return
            trials = document['snippets']
            self.info("Issued %s to session %s" % (trials, user))
            yield self.sessions.issue_key_to_user(trials, user)
        else:
            # Reissue
            trials = session['snippets']
            self.info(" Reissued %s to session %s" % (trials, user))
        self.data(trials)