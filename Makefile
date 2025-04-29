python27:	## Install python2.7
	sudo apt install python2.7 -y 

pip27:	## Install pip2.7
	wget https://bootstrap.pypa.io/pip/2.7/get-pip.py
	sudo python2.7 get-pip.py

req:	## Installs requirements
	pip2.7 install -r requirements.txt
	
buildAll: buildDB buildApp	## Builds the database and application

buildApp:	# Builds the application
	@docker build -t cessor/peter -f Dockerfile .

buildDB:
	@docker build -t cessor/mongodb -f mongodb.Dockerfile .

run: runDB	runApp	## Run's the containers

runDB:	## Run's the database in detatched mode
	@docker run --name mongodb -d -v $(pwd)/data:/data/db cessor/mongodb

runApp:	## Run's the application in detatched mode
	@docker run --name peter -d -p 5000:5000 --link mongodb:mongodb cessor/peter

secrets:	## Uses python3 to generate secrets for the database
	python3 generate_secrets.py

compose: 	## Uses the docker compose file to run everything
	@docker compose -f docker-compose.yaml up

help: ## Show this help
	@grep -E '^[.a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'