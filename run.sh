#!/bin/bash
if [ -z "$(docker images | grep 'cessor/peter')" ]; then
    docker build -t cessor/peter -f Dockerfile .
fi
docker run --name peter -d -p 5000:5000 --link mongodb:mongodb cessor/peter
