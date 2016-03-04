# encoding: utf-8
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from nose.tools import *
from readability import *
from container import Container
from activities import Activities
from pymongo import MongoClient

Browser = webdriver.Chrome
Browser.find = Browser.find_element_by_css_selector

page = Container({
	'root':	'http://localhost:5000/',
	'experiment':	'http://localhost:5000/experiment.html',
	'steuerung':	'http://localhost:5000/steuerung.html',
	'restart':	'http://localhost:5000/restart.html',
	'end':	'http://localhost:5000/end.html',
})

browser = None
S = lambda x: None

def setup():
	global browser, S
	browser = Browser()
	S = browser.find

def teardown():
	global browser
	browser.close()

def test_web():
	global browser
	browser.get(page.experiment)

def test_accessing_the_pages_one_after_the_other():
	global browser
	browser.delete_all_cookies()
	browser.get(page.root)

	h1 = browser.find_element_by_tag_name('h1')
	assert_text(h1, 'Willkommen!')

	btn = browser.find('.btn-primary')
	assert_visible(btn)
	assert_text(btn, "Weiter")
	btn.click()

	h1 = browser.find_element_by_tag_name('h1')
	assert_text(h1, 'Datenschutz')
	browser.find('.btn-primary').click()

	h1 = browser.find_element_by_tag_name('h1')
	assert_text(h1, 'Ein paar Fragen...')
	browser.find('.btn-primary').click()

	h1 = browser.find_element_by_tag_name('h1')
	assert_text(h1, 'Sprachen')
	browser.find('.btn-primary').click()

	h1 = browser.find_element_by_tag_name('h1')
	assert_text(h1, 'Anleitung')
	browser.find('.btn-primary').click()

	h1 = browser.find_element_by_tag_name('h1')
	assert_text(h1, 'Steuerung')


def test_experiment():
	def should_be_on_the_model_page(browser):
		assert_visible(browser.find('#model'))
		assert_invisible(browser.find('#map'))
		assert_invisible(browser.find('#code'))

	def should_be_on_the_map_page(browser):
		assert_invisible(browser.find('#model'))
		assert_visible(browser.find('#map'))
		assert_invisible(browser.find('#code'))

	def should_be_on_the_code_page(browser):
		assert_invisible(browser.find('#model'))
		assert_invisible(browser.find('#map'))
		assert_visible(browser.find('#code'))

	browser.get(page.experiment)
	wait(1) # for loading

	should_be_on_the_model_page(browser)
	S('#right').send_keys(Keys.RIGHT)

	should_be_on_the_map_page(browser)
	S('#right').send_keys(Keys.RIGHT)

	should_be_on_the_code_page(browser)
	S('#space').send_keys(Keys.SPACE)

	assert_visible(S('#report'))

# This test works but takes ages to complete. 
def _test_steuerung():
	global browser
	browser.delete_all_cookies()
	browser.get(page.steuerung)
	message = browser.find_element_by_id('message')
	assert_empty(message)
	wait(3)
	message = browser.find_element_by_id('message')
	assert_text(message, 'Drücke die Leertaste!')

	spacebar = browser.find_element_by_id('space');
	spacebar.send_keys(Keys.SPACE)

	assert_text(message, 'Drücke die Leertaste nochmal!')
	spacebar.send_keys(Keys.SPACE)

	left = browser.find_element_by_id('left');
	assert_text(message, 'Drücke links oder rechts!')
	left.send_keys(Keys.RIGHT)

	assert_invisible(message)
	wait(7)

	btn = browser.find_element_by_id('next')
	assert_visible(btn)

	# This test works but takes ages to complete. 

def test_unauthorized_restart():
	"""When I go to the 'restart' page and I have not completed a trial first, I get redirected. """ 
	global browser
	browser.delete_all_cookies()
	browser.get(page.restart)
	assert_equal(browser.current_url, page.root)


def test_pageflow():
	global browser
	browser.delete_all_cookies()
	browser.get(page.root)

	S('.btn-primary').click()
	assert_equal(browser.current_url, 'http://localhost:5000/datenschutz.html')

	S('.btn-primary').click()
	assert_equal(browser.current_url, 'http://localhost:5000/questions1.html')

	

def _test_doing_an_experiment():
	"""Doing an experiment""" 
	global browser
	browser.delete_all_cookies()
	browser.get(page.root)

	S('.btn-primary').click()
	assert_equal(browser.current_url, 'http://localhost:5000/datenschutz.html')

	
	browser.get(page.experiment)
	wait(2) # Wait for peter to load...

	# 1. First
	# =========================
	print 'First trial'
	# I land on the model page for the first snippet and condition
	assert_equal(S('#model_description').text, 'rot-13')
	# I skip to the end of the trial
	S('#right').send_keys(Keys.RIGHT)
	assert_invisible(S('#space'))
	S('#right').send_keys(Keys.RIGHT)
	assert_visible(S('#space'))

	# I press space, then accept 
	S('#space').send_keys(Keys.SPACE)
	assert_visible(S('#report'))
	assert_visible(S('#btn-victory'))
	S('#btn-victory').click()

	# I am on the restart page!
	assert_equal(browser.current_url, page.restart)
	assert_equal(S('h1').text, 'Auf ein Neues!')
	assert_visible(S('.btn-massive'))

	# I hit the right button
	# Update: I can't sent keys to the button, therefore I will just redirect to the other item. S('.btn-massive').send_keys(Keys.RIGHT)
	browser.get(page.experiment)
	wait(2)

	# 2. Second
	# =========================
	print 'Second trial'
	# I am on the second trial of the experiment!
	assert_equal(S('#model_description').text, 'kfz')
	# I skip to the end of the trial
	S('#right').send_keys(Keys.RIGHT)
	assert_invisible(S('#space'))
	S('#right').send_keys(Keys.RIGHT)
	assert_visible(S('#space'))

	# I press space, then accept 
	S('#space').send_keys(Keys.SPACE)
	assert_visible(S('#report'))
	assert_visible(S('#btn-victory'))
	S('#btn-victory').click()

	# I am on the restart page!
	assert_equal(browser.current_url, page.restart)
	assert_equal(S('h1').text, 'Auf ein Neues!')
	assert_visible(S('.btn-massive'))

	# I hit the right button
	browser.get(page.experiment)
	wait(2)

	# 3. Third
	# =========================
	print 'Third trial'

	wait(2)

	# I am on the third trial of the experiment!
	assert_equal(S('#model_description').text, 'palindrome')
	# I skip to the end of the trial
	S('#right').send_keys(Keys.RIGHT)
	assert_invisible(S('#space'))
	S('#right').send_keys(Keys.RIGHT)
	assert_visible(S('#space'))

	# I press space, then accept 
	S('#space').send_keys(Keys.SPACE)
	assert_visible(S('#report'))
	assert_visible(S('#btn-victory'))
	S('#btn-victory').click()

	# I am on the final page!
	assert_equal(browser.current_url, page.end)
