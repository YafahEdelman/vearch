apt-get install build-essential
apt-get install linux-headers-`uname -r`
apt-get install curl
apt-get install -y libprotobuf-dev libleveldb-dev libsnappy-dev libopencv-dev libboost-all-dev libhdf5-serial-dev protobuf-compiler gfortran libjpeg62 libfreeimage-dev libatlas-base-dev git python-dev python-pip libgoogle-glog-dev libbz2-dev libxml2-dev libxslt-dev libffi-dev libssl-dev libgflags-dev liblmdb-dev python-yaml
cd ..
git clone https://github.com/BVLC/caffe.git
cd caffe
sudo ln -s /usr/include/python2.7/ /usr/local/include/python2.7
sudo ln -s /usr/local/lib/python2.7/dist-packages/numpy/core/include/numpy/ /usr/local/include/python2.7/numpy
cp Makefile.config.example Makefile.config
make pycaffe
make all
make test
make runtest
./scripts/download_model_binary.py models/bvlc_reference_caffenet
sh ./data/ilsvrc12/get_ilsvrc_aux.sh
