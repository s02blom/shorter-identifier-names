Peter *
=====

\* *Psychologische Erhebung Total Erheblicher Reaktionszeiten*

This repository contains the source code for the web app I used to obtain the data for my Bachelor thesis. I tested the influence of identifier length and semantics on source code comprehension.

The software was written in Python 2.7 using the Tornado web framework and stores all data in a MongoDB. To setup you can either run everything from bare metal or use the provided Dockerfiles to create custom images.

Table of Contents
-----------------

 - [Setup](https://github.com/empathic-code/peter#setup)
   - [Docker](https://github.com/empathic-code/peter#using-docker)
   - [Bare Metal](https://github.com/empathic-code/peter#bare-metal)
     - [Installation](https://github.com/empathic-code/peter#installation)
     - [Configuration](https://github.com/empathic-code/peter#configure-secret-keys)
     - [Start](https://github.com/empathic-code/peter#starting-the-local-server)
 - [Notes](https://github.com/empathic-code/peter#notes)
 - [Trivia](https://github.com/empathic-code/peter#trivia)

Setup
=====

Using Docker
------------

The simplest way to get the software to run is to use the provided docker file to build an image and run it containers. I provided one for mongodb and one for the application itself. To build & run the mongodb image, use the script ```<repository>/run_mongo.sh``` and ```<repository>/run.sh``` or manually run the following commands from the root of the checked out repository:

Build the mongodb image:

    $ docker build -t cessor/mongodb -f mongodb.Dockerfile .

Build the web application's image:

    $ docker build -t cessor/peter -f Dockerfile .

Please watch the build. During the build, docker creates a random password for the admin interface. Write it down, as you will need it later. If you miss this step or forget the password, you can [retrieve it](https://github.com/empathic-code/peter#notes).

Fire up the mongdb container:

    $ docker run --name mongodb -d -v $(pwd)/data:/data/db cessor/mongodb

I am using the empty data folder provided with this repository to store the mongodb files. You can, of course, use any other folder you like.

Fire up the mongdb container:

    $ docker run --name peter -d -p 5000:5000 --link mongodb:mongodb cessor/peter

If you wish to manipulate the source code, you can also fire up the container and override the source code directory in the image (you don't need to rebuild):

    $ docker run --name peter -d -p 5000:5000 --link mongodb:mongodb -v $(pwd)/src:/var/peter cessor/peter

If everything worked out fine you should have two containers running (see ```docker ps```): mongodb and peter


Bare Metal
----------

To setup, check out this repository to a local folder. [Install and start MongoDb](https://docs.mongodb.org/manual/installation/) locally.

You need to [install Python 2.7](http://docs.python-guide.org/en/latest/starting/installation/). You can use a virtual environment to not clutter up your local Python install.

### Installation

From the command line, change to the directory where you installed the repository:

    $ cd <repository>

Then, create a new virtual environment. Here, I use python 2.7 and call the directory venv

    $ virtualenv -p python2.7 venv

Then activate the virtual environment

    $ source venv/bin/activate

To install all dependencies, run:

    $ pip install --upgrade pip
    $ pip install -r requirements.txt

It should suffice to install 'tornado' and 'motor'. Both packages build some extensions, therefore make sure you have appropriate development tools installed.

### Configure secret keys

Before you can run the application, you will need to set a cookie session key, and a password for the admin interface.

Generate a random string, for example using:

    $ python2 -c 'import os; print os.urandom(32).encode("hex")'

Add the following line to the file ```<repository>/config/local.cfg```

    cookie_secret='<your random key>'

Generate another random key, or think up a password, and place it in the .key file found in ```<repository>/.key```

### Configure mongodb if necessary

By default, the local environment tries to access a local mongodb instance on port 27017. If you wish to access an existing instance, please change the connection string in the file ```<repository>/config/local.cfg```, which says: ```database = 'mongodb://localhost:27017'``` to point to whatever instance you require.

### Starting the local server

To run the application, execute:

    $ python serve-fast.py

This will open the server on localhost 5000. If you didn't setup the secrets, the application will complain and not run.


Running the application
=======================

You will first need to seed the data from the admin interface. To access the admin interface, go to:

[http://localhost:5000/admin/login](http://localhost:5000/admin/login)

The password is the password you thought and placed in the ```<repository>/.key``` file.

From the left, choose ```Setup```. Then, ```Seed Trials```. The other items on the allow you to monitor the running study.

 - *Sessions* shows running sessions and allows to view their data.
 - *Trials* helps overview individual conditions (for now, it shows when all required trials have collected at least one valid dataset)
 - *Emails* tracks participants who were interested in the results
 - *Snippets* shows the individual snippets for review.

To access the client view of the study, go to:

[http://localhost:5000](http://localhost:5000)

Here, you can simply click your way to the study. Make sure to return to the backend, to view your data. Note: A session starts, as soon as you view a questionnaire. In the admin interface, only completed sessions are shown. The "With Data" field indicates that people have provided some data, but the record does not show up until the complete study was finished.


Notes
=====
In case you lose the admin password or forgot to write it down during build, you can retrieve it by checking inside the container:

    $ docker exec -it peter cat /var/peter/.key

Trivia
======
The software is called Peter, which is kind of a backronym for 'Psychologische Erhebung Total Erheblicher Reaktionszeiten' (Psychological Evaluation of Totally Relevant Reaction Times). When discussing my thesis with my my supervisor, I kept calling my software the "data client", which we both didn't like very much. He asked me to come up with a name. Jokingly I responded: Ok, so I'll call it Peter.

I renamed the solution to Peter and sticked with it but I didn't stop there. As you might have noticed, in the top left corner of the admin interface, there is a picture of jumping man around. His name is Peter and he is the singer of a band I like. The picture was taken by Florian Stangl @ [http://www.metal-fotos.de/](http://www.metal-fotos.de/), who nicely allowed me to republish it (as I am using it in a non commercial context).

 This might not tickle your sense of humor as much as it tickles mine. I had a good time writing this.