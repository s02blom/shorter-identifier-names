set -e

sudo apt update 
sudo apt upgrade -y 
sudo apt install bc wget -y
sudo apt install python2.7 -y 
wget https://bootstrap.pypa.io/pip/2.7/get-pip.py
python2.7 get-pip.py
pip2.7 install -r requirements.txt
#apt-get install libglib2.0-0 libsm6 libxext6 libxrender-dev -y