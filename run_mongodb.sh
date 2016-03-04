#!/bin/bash
if [ -z "$(docker images | grep 'cessor/mongodb')" ]; then
    docker build -t cessor/mongodb -f mongodb.Dockerfile .
fi
docker run --name mongodb -d -v $(pwd)/data:/data/db cessor/mongodb