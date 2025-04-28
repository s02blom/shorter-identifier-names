FROM ubuntu:jammy
MAINTAINER Johannes Hofmeister <docker@spam.cessor.de>

# To Build:
# docker build -t cessor/peter -f Dockerfile .

# To Run:
# docker run --name peter -d -p 5000:5000 --link mongodb:mongodb cessor/peter

WORKDIR /workdir

COPY docker_install.sh .
COPy requirements.txt .

RUN ./docker_install.sh


# RUN apk add --update bash curl g++ python python-dev py-pip && \
#     rm -rf /var/cache/apk/*


# RUN pip install pip --upgrade
# RUN pip install setuptools --upgrade
# RUN pip install tornado
# RUN pip install motor

# Add volume
ADD ./src /var/peter

# Generate Cookie Secret Key
RUN python2.7 -c "import random,string; print 'cookie_secret=\'%s\'' % ''.join([random.choice(string.letters+string.digits) for _ in range(32)])" >> /var/peter/config/docker.cfg

# Generate Admin Password
RUN python2.7 -c "import random,string; print ''.join([random.choice(string.letters+string.digits) for _ in range(12)])" > /var/peter/.key

# Write this down.
RUN echo Your Password for /admin/login is: $(cat /var/peter/.key)

ENV PETER_ENV=docker
ENTRYPOINT ["python2.7", "/var/peter/serve-fast.py"]