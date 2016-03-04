from container import as_container
from activities import ActivityStates
import datetime
from bson.objectid import ObjectId


class Participants(object):
	""" for testing use: test_empra """
	DB_NAME = 'empra'
	COLLECTION_NAME = 'participants'
	def __init__(self, client, db_name=DB_NAME, collection_name=COLLECTION_NAME):
		self.collection = self._get_collection_or_default(client, db_name, collection_name)
	def _get_collection_or_default(self, client, db_name, collection_name):
		return client[db_name][collection_name]

	def clear(self):
		self.collection.remove()

	def create(self):
		now = datetime.datetime.now().isoformat()
		_id = str(ObjectId())
		self.collection.insert({ '_id' : _id, 'created' : now })
		return str(_id)

	@as_container
	def find_one(self, id):
		return self.collection.find_one({ '_id' : id })

	@as_container
	def get_activity(self, participant_id):
		document = self.collection.find_one({ '_id' : participant_id }, { "activity" : True })
		if document and 'activity' in document:
			return document['activity']
		return None

	def add_form(self, id, formdata):
		self._push(id, 'formdata', formdata)

	def add_events(self, id, events):
		self._push(id, 'events', events)

	def _push(self, participant_id, name, data):
		self.collection.update({ '_id' : participant_id }, { "$push" : { name : data }}, upsert=True)

	def assign_activity(self, participant_id, activity):
		self.collection.update({ '_id' : participant_id }, { "$set" : { 'activity' : activity }})

	def start_activity(self, participant_id):
		now = datetime.datetime.now().isoformat()
		self.collection.update({ '_id': participant_id }, { '$set': { 'activity.started': now, 'activity.current_trial' : 1, 'activity.state' : ActivityStates.STARTED }})

	def finish_activity(self, participant_id):
		now = datetime.datetime.now().isoformat()
		self.collection.update({ '_id': participant_id }, { '$set': { 'activity.finished': now, 'activity.state' : ActivityStates.FINISHED }})

	def next_trial(self, participant_id):
		self.collection.update({ '_id': participant_id }, { '$inc': { 'activity.current_trial' : 1 }})