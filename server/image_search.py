from numpy import load

from sys import path
caffe_root = "../caffe"
path.insert(0, caffe_root + '/python')
from caffe import Classifier,set_mode_cpu,set_mode_gpu
from caffe.io import load_image
from os import listdir
from os.path import join
word_data_file_name = caffe_root + "/data/ilsvrc12/synset_words.txt"
word_data_file = open(word_data_file_name)
word_data = []
for i in word_data_file.read().split("\n"):
    if " " in i:
        word_data.append(i[i.index(" ")+1:])
word_data_file.close()
MODEL_FILE = caffe_root + '/models/bvlc_reference_caffenet/deploy.prototxt'
PRETRAINED = caffe_root + '/models/bvlc_reference_caffenet/bvlc_reference_caffenet.caffemodel'
net = Classifier(MODEL_FILE, PRETRAINED,
                       mean=load(caffe_root + '/python/caffe/imagenet/ilsvrc_2012_mean.npy'),
                       channel_swap=(2,1,0),
                       raw_scale=255,
                       image_dims=(256, 256))


# Set the right path to your model definition file, pretrained model weights,
# and the image you would like to classify.
def word_probs(folder_name, word_to_search, gpu_on = False, max_to_look = 50):
    image_names = [join(folder_name,file_name) for file_name in listdir(folder_name)]
    #set_phase_test()
    if gpu_on:
        set_mode_gpu()
    else:
        set_mode_cpu()
    predictions = net.predict(map(load_image, image_names))

    ret = []
    for name,prediction in zip(image_names,predictions):
        a = sorted(enumerate(prediction), key=lambda x:-x[1])
        a = a[:max_to_look]
        prob = 0
        for thoughts in map(lambda i:(word_data[i[0]], i[1]), a):
            words, chance = thoughts
            if word_to_search in words:
                prob += chance
        ret.append([prob, name])
    return ret
def test():
    print word_probs("../caffe/examples/images","cat")
