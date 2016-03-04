from container import Container, as_container
import datetime

ActivityStates = Container({
	'NEW' : 'new',
	'STARTED' : 'started',
	'FINISHED' : 'finished'
})


class Activity(object):
	"""
	Snippets: Semantically Rich Domain [Login, ,Customer, Tax], Semantically Neutral [KFZ, Rot-13, Palindrome]
	Conditions: [Normal, Abbrev, Single]
	For example: LSTACN	means
		Login (Single), Tax (Abbrev), Customer Points (Normal)
	"""
	MAXIMUM_TRIALS = 3

	def __init__(self):
		self._id = None
		self.state = ActivityStates.NEW
		self.trials = []

	def __str__(self):
		return self._id

	def trials_left(self):
		return self.current_trial <= self.MAXIMUM_TRIALS

	def get_snippet(self):
		index = (self.current_trial - 1)
		return self.trials[index]

	@classmethod
	def from_keys(self, keys):
		activity = Activity()
		activity._id = keys[0]
		activity.trials = keys[2]
		return activity

	@classmethod
	def from_document(self, document):
		activity = Activity()
		activity.current_trial = 1
		for key,value in document.items():
			setattr(activity, key, value)
		return activity


class Activities(object):
	DB_NAME = 'empra'
	COLLECTION_NAME = 'activities'
	def __init__(self, client, db_name=DB_NAME, collection_name=COLLECTION_NAME):
		self.collection = self._get_collection_or_default(client, db_name, collection_name)
	def _get_collection_or_default(self, client, db_name, collection_name):
		return client[db_name][collection_name]

	@as_container
	def find_new(self):
		return self.collection.find_one({ 'state' : ActivityStates.NEW })

	@as_container
	def find_used(self):
		document = self.collection.find_one({ 'state' : ActivityStates.STARTED })
		if not document:
			raise NoActivitiesLeftComplaint()
		return document

	def count_left(self):
 		return self.collection.find({ 'state' : {'$in' : [ActivityStates.NEW, ActivityStates.STARTED]}}).count()

	def start(self, id):
		self._set_state(id, ActivityStates.STARTED)

	def finish(self, id):
		self._set_state(id, ActivityStates.FINISHED)

	def _set_state(self, id, state):
		self.collection.update({ '_id': id }, { '$set' : { 'state': state }})

	def clear(self):
		self.collection.remove()

	def add(self, document):
		self.collection.insert(document)

	def count(self):
		return self.collection.count()


class ActivityNotFoundComplaint(Exception):
	def __init__(self, value):
		self.value = value
	def __str__(self):
		return repr(self.value)


class NoActivitiesLeftComplaint(Exception):
	pass