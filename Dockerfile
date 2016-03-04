FROM alpine:latest
MAINTAINER Johannes Hofmeiater <docker@spam.cessor.de>

# To Build:
# docker build -t cessor/peter -f Dockerfile .
# To Run:
# docker run --name peter -d --link mongodb:mongodb -v $(pwd)/data:/data/db cessor/peter

# Run Terminal:
# docker run --name peter --rm -it -p 5000:5000 --link mongodb:mongodb -v $(pwd):/var/peter cessor/peter /bin/bash

RUN apk add --update bash curl g++ python python-dev py-pip && \
    rm -rf /var/cache/apk/*
#RUN curl -O https://bootstrap.pypa.io/get-pip.py && \
#    python3 get-pip.py && \
#    rm get-pip.py
RUN pip install pip --upgrade
RUN pip install setuptools --upgrade
RUN pip install tornado
RUN pip install motor

ADD ./src /var/peter

RUN python -c "import os;print '\ncookie_secret=\'%s\'' % os.urandom(32)" >> /var/peter/config/docker.cfg

RUN python -c "import random,string; print ''.join([random.choice(string.letters+string.digits) for _ in range(12)])" > /var/peter/.key

RUN echo Your Password for /admin/login is: $(cat /var/peter/.key)

ENV PETER_ENV=docker
CMD python /var/peter/serve-fast.py