from mongocare import *
from os import listdir, path as os_path
from tornado import gen
import collections
import itertools
import logging
import random

AGENT_FIELD = 'agent'
EMAILS_COLLECTION = 'emails'
FORMS_FIELD = 'forms'
SESSIONS_COLLECTION = 'sessions'
TRIALS_COLLECTION = 'trials'
TRIALS_FIELD = 'trials'
USER_SESSION_ID = 'USER_SESSION_ID'
ADMIN_ID = 'ADMIN_ID'


class Pretest(object):
    SEQUENCE_LENGTH = 2

    def __init__(self):
        self.group_a = ['replace', 'parsequerystring', 'passwordgenerator', 'histogram', 'reverse']
        self.group_b = ['codestructure', 'parseini', 'mergelists', 'countchildren', 'sumscores']

    def ordering(self, snippets):
        return list(itertools.permutations(snippets, self.SEQUENCE_LENGTH))

    def trial(self, snippet, condition):
        return '%s.%s.html' % (snippet, condition)

    def seed(self):
        normal_condition = lambda s: self.trial(s, 'semantic.normal')
        pretest = self.ordering(self.group_a) + self.ordering(self.group_b)
        trials = [[normal_condition(a), normal_condition(b)] for a,b in pretest]
        random.shuffle(trials)
        return trials


class Final(object):
    SEQUENCE_LENGTH = 3
    def __init__(self):
        self.tasks = ['semantic', 'syntactic']
        self.identifier_quality = ['single','normal','abbrev']
        self.group_a = ['parsequerystring', 'histogram', 'concatlists']
        self.group_b = ['codestructure', 'readini', 'countchildren']

    def _task_group(self, snippets, task):
        return ["%s.%s" % (s, task) for s in snippets]

    def _multiply(self, snippets, conditions):
        snippet_perms = itertools.permutations(snippets, self.SEQUENCE_LENGTH)
        condition_perms = itertools.permutations(conditions)
        return itertools.product(snippet_perms, condition_perms)

    def _pairs(self, product):
        return [zip(*element) for element in product]

    def _snippet(self, pair):
        return "%s.%s.html" % pair

    def _make_block(self, group):
        block = self._multiply(group, self.identifier_quality)
        return [[self._snippet(item) for item in sequence] for sequence in self._pairs(block)]

    def _shuffle_blocks(self, semantic, syntactic):
        head = self._make_block(semantic)
        tail = self._make_block(syntactic)
        random.shuffle(head)
        random.shuffle(tail)
        return self._flatten_block(zip(head, tail))

    def _flatten_block(self, block):
        return (a + b for a,b in block)

    def seed(self):
        semantic,syntactic = self.tasks

        semantic_group_a = self._task_group(self.group_a, semantic)
        syntactic_group_a = self._task_group(self.group_a, syntactic)

        semantic_group_b = self._task_group(self.group_b, semantic)
        syntactic_group_b = self._task_group(self.group_b, syntactic)

        block1 = self._shuffle_blocks(semantic_group_a, syntactic_group_b)
        block2 = self._shuffle_blocks(semantic_group_b, syntactic_group_a)

        snippets = itertools.chain(block1, block2)
        return snippets


class SessionStatus(object):
    def check(self, data):
        '''Checks whether all data has been collected.
           The session is finished when there are two trials and three distinct forms submitted.
           No doubles are allowed.
        '''
        trials = data.get('trials', None)
        if not trials:
            return False

        forms = data.get('forms', None)
        if not trials:
            return False

        actual_forms = [form.get('source', '') for form in forms]

        expected_forms = [
            '/static/templates/forms/questions1.de.html',
            '/static/templates/forms/questions2.de.html',
            '/static/templates/forms/questions3.de.html'
        ]

        all_forms_available = self.compare(expected_forms, actual_forms)

        # trials that were not surrendered
        finished_trials = [trial.get('file', None) for trial in trials if not trial.get('surrender', 0)]
        return (all_forms_available and (len(finished_trials) == 6))

    def compare(self, x, y):
        return collections.Counter(x) == collections.Counter(y)

class Emails(object):
    def __init__(self, db):
        self.collection = db[EMAILS_COLLECTION]

    def add(self, data):
        return self.collection.insert(data)

    def all(self,):
        return self.collection.find({})


class Snippets(object):
    PATH = './static/snippets/'
    @gen.coroutine
    def names(self):
        return [file_ for file_ in listdir(self.PATH) if file_.endswith('.html')]

    @gen.coroutine
    def file(self, name):
        _, ext = os_path.splitext(name)
        if not ext == ".html":
            return None
        path = os_path.join(self.PATH, os_path.basename(name))
        logging.info("Requesting %s" % path)
        return (path if os_path.exists(path) else None)


class Sessions(object):
    def __init__(self, db):
        self.collection = db[SESSIONS_COLLECTION]

    def create(self, session_id, headers):
        doc = document(USER_SESSION_ID, session_id)
        doc = combine(doc, headers)
        return self.collection.insert(doc)

    def full(self):
        '''Complete dump'''
        return self.collection.find(and_(exists(FORMS_FIELD), exists(TRIALS_FIELD)))

    def stats(self):
        count_future = self.collection.count()
        empty_future = self.collection.find(
            and_(
                not_exists(FORMS_FIELD),
                not_exists(TRIALS_FIELD)
            )).count()
        return [count_future, empty_future]

    def list(self):
        js_map = """
            function () {

                var merged = {};
                this.forms.forEach(function (form) {
                    for(var key in form) {
                        merged[key] = form[key];
                    }
                });

                merged.USER_SESSION_ID = this.USER_SESSION_ID;

                merged.duplicate = this.duplicate;
                merged.forms = this.forms.length;
                merged.snippets = this.snippets;
                merged.trials = this.trials.length;
                merged.valid = this.valid;

                var failed_trials = 0;
                var successful_trials = 0;
                var elapsed_trials = 0;
                this.trials.forEach(function (trial) {
                    if(trial.state == 'failure') {
                        failed_trials += 1;
                    }
                    if(trial.state == 'success') {
                        successful_trials += 1;
                    }
                    if(trial.state == 'elapsed') {
                        elapsed_trials += 1;
                    }
                });

                merged.failed_trials = failed_trials;
                merged.elapsed_trials = elapsed_trials;
                merged.successful_trials = successful_trials;

                emit(this.USER_SESSION_ID, merged);
            }
        """

        js_reduce = """function () {}"""

        map_reduce_query = {
            '$and': [
                {'forms':  {'$exists': True}},
                {'trials': {'$exists': True}}
            ]
        }
        return self.collection.inline_map_reduce(js_map, js_reduce, query=map_reduce_query)

    def data_for_user(self, id_):
        return self.collection.find_one(document(USER_SESSION_ID, id_))

    def data_for(self, id_):
        return self.collection.find_one(by_id(id_))

    def drop_empty(self):
        return self.collection.remove(not_exists(FORMS_FIELD), multi=True)

    def drop_all(self):
        return self.collection.remove({}, multi=True)

    def issue_key_to_user(self, trials, session_id):
        return self.collection.update(
            document(USER_SESSION_ID, session_id),
            set_('snippets', trials),
            upsert=True
        )

    def is_session_valid(self, session_id):
        return self.collection.find_one(
            document(USER_SESSION_ID, session_id),
            get('valid')
        )

    def change_valid(self, session_id, value):
        return self.collection.update(
            document(USER_SESSION_ID, session_id),
            set_('valid', value),
            upsert=False
        )

    def mark_as_duplicate(self, session_id):
        return self.collection.update(
            document(USER_SESSION_ID, session_id),
            {'$set': {
                'valid': False,
                'duplicate': True
            }},
            upsert=False
        )

    def provided_data(self, session_id):
        '''Data to evaluate, whether or not a session was completed'''
        project = combine(
            get('trials.file'),
            get('trials.surrender'),
            get('forms.source')
        )
        return self.collection.find_one(document(USER_SESSION_ID, session_id), project)

    def seal(self, session_id):
        return self.collection.update(document(USER_SESSION_ID, session_id), set_('done', True))

    def for_(self, session_id):
        return self.collection.find_one(document(USER_SESSION_ID, session_id))

    def save_form(self, session_id, questions):
        questions = mark(questions)
        return self.collection.update(
            document(USER_SESSION_ID, session_id),
            push(FORMS_FIELD, questions),
            upsert=True
        )

    def save_trial(self, session_id, data):
        data = mark(data)
        return self.collection.update(
            document(USER_SESSION_ID, session_id),
            push(TRIALS_FIELD, data),
            upsert=True
        )


class Trials(object):
    def __init__(self, db):
        self.collection = db[TRIALS_COLLECTION]

    def add_sequence(self, sequence):
        return self.collection.insert(dict(snippets=sequence, issued=0, finished=0))

    def clear(self):
        return self.collection.remove({})

    def all(self):
        return self.collection.find()

    def issued(self):
        return self.collection.find({}, get('issued'))

    def finished(self):
        return self.collection.find(dict(finished=1))

    def count_left(self):
        return self.collection.find(dict(finished=0)).count()

    def open(self, _id):
        return self.collection.update(by_id(_id), set_('finished', 0), multi=False)

    def close(self, _id):
        return self.collection.update(by_id(_id), set_('finished', 1),  multi=False)

    def reset_issued(self):
        return self.collection.update({}, set_('issued', 0), multi=True)

    def seal(self, snippets):
        return self.collection.update(equals('snippets', snippets), set_('finished', 1),  multi=False)

    def stop_all(self):
        return self.collection.update({}, set_('finished', 1), multi=True)

    def unique(self):
        return self.collection.find_and_modify(
            query=document('finished', 0),
            update=increment('issued'),
            sort=[('issued', 1), ('finished', 1)],
            fields=['snippets']
        )
