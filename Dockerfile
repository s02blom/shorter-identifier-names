FROM alpine:latest
MAINTAINER Johannes Hofmeiater <docker@spam.cessor.de>

# To Build:
# docker build -t cessor/peter -f Dockerfile .

# To Run:
# docker run --name peter -d --link mongodb:mongodb -v $(pwd)/data:/data/db cessor/peter

RUN apk add --update bash curl g++ python python-dev py-pip && \
    rm -rf /var/cache/apk/*

RUN pip install pip --upgrade
RUN pip install setuptools --upgrade
RUN pip install tornado
RUN pip install motor

ADD ./src /var/peter

# Generate Secret Cookie Password
RUN python -c "import random,string; print 'cookie_secret=\'%s\'' % ''.join([random.choice(string.letters+string.digits) for _ in range(32)])" >> /var/peter/config/docker.cfg

# Generate Admin Password
RUN python -c "import random,string; print ''.join([random.choice(string.letters+string.digits) for _ in range(12)])" > /var/peter/.key

# Write this down.
RUN echo Your Password for /admin/login is: $(cat /var/peter/.key)

ENV PETER_ENV=docker
CMD python /var/peter/serve-fast.py