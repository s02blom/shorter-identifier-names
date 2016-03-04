def as_container(fn):
	def wrap(*args, **kwargs):
		obj = fn(*args, **kwargs)
		if not obj:	return None
		return Container(obj)
	return wrap

class Container(dict):
	__getattr__ = dict.__getitem__
	__setattr__ = dict.__setitem__
	__delattr__ = dict.__delitem__