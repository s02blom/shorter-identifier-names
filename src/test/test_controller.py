from nose.tools import *
from container import *
from activities import Activities, Activity, ActivityNotFoundComplaint


ID = 'ID'

class ActivityController(object):
	def __init__(self, activities):
		self.activities = activities
	def get_activity(self):
		fresh = self.activities.find_fresh_one()
		if not fresh:
			return self.activities.find_old_one()
		return fresh

class TestableActivites(object):
	def __init__(self):
		self.fresh = None
		self.old = None
	@as_container
	def find_fresh_one(self): 
		return self.fresh
	@as_container
	def find_old_one(self): 
		return self.old

def test_controller():
	activities = TestableActivites()
	controller = ActivityController(activities)
	assert_equal(controller.get_activity(), None)

def test_get_fresh_one():
	activities = TestableActivites()
	activities.fresh = { '_id' : ID }
	controller = ActivityController(activities)
	# Act
	result = controller.get_activity()
	assert_equal(result._id , ID)

def test_if_there_are_no_fresh_ones_get_an_old_one():
	
	activities = TestableActivites()
	activities.fresh = None
	activities.old = { '_id' : ID }

	controller = ActivityController(activities)
	# Act
	result = controller.get_activity()
	assert_equal(result._id , ID)
