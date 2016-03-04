FROM alpine:edge
MAINTAINER Johannes Hofmeister <docker@spam.cessor.de>

# To Build:
# docker build -t cessor/mongodb -f mongodb.Dockerfile .
# To Run:
# docker run --name mongodb -d -v $(pwd)/data:/data/db cessor/mongodb

RUN echo http://dl-4.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories
RUN apk add --no-cache mongodb

VOLUME /data/db
EXPOSE 27017

CMD mongod