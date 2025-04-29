#!/usr/bin/bash
sudo apt update 
sudo apt upgrade -y 
sudo apt install bc

sudo apt install python2.7 -y 
wget https://bootstrap.pypa.io/pip/2.7/get-pip.py
python2.7 get-pip.py
pip2.7 install -r requirements.txt