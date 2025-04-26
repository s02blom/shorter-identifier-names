python27:	## Install python2.7
	sudo apt install python2.7 -y 

pip27:	## Install pip2.7
	wget https://bootstrap.pypa.io/pip/2.7/get-pip.py
	sudo python2.7 get-pip.py

req:	## Installs requirements
	pip2.7 install -r requirements.txt
	
help: ## Show this help
	@grep -E '^[.a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'