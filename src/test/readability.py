from nose.tools import *
from time import sleep

def wait(seconds):
	print "Waiting ", seconds, " seconds"
	sleep(seconds)

def assert_empty(element):
	assert_equal(element.text, '')

def assert_text(element, text):
	etext = element.text
	text = text.decode('utf-8')
	assert_equal(etext, text)	

def assert_invisible(element):
	assert_false(element.is_displayed())

def assert_visible(element):
	assert_true(element.is_displayed())