from numpy import load

from sys import path
print "Trying without path change."
from caffe import Classifier
# , set_mode_cpu,set_mode_gpu
from caffe.io import load_image
print "Worked without path change."

from os import listdir
from os.path import join as join_paths
word_data_file_name =  "../data/synset_words.txt"
word_data_file = open(word_data_file_name)
word_data = []
for i in word_data_file.read().split("\n"):
    if " " in i:
        word_data.append(i[i.index(" ") + 1:])
word_data_file.close()
MODEL_FILE =  '../data/deploy.prototxt'
PRETRAINED =  '../data/bvlc_reference_caffenet.caffemodel'
net = Classifier(MODEL_FILE, PRETRAINED,
                       mean = load('../data/ilsvrc_2012_mean.npy'),
                       channel_swap = (2, 1, 0),
                       raw_scale = 255,
                       image_dims = (256, 256))

def word_probs(directory, search_string, gpu_on = True, max_to_look = 50):
    needles = search_string.split(" ")
    paths = [join_paths(directory, path) for path in listdir(directory)]
    paths = paths[0::int(0.5+len(paths)/50.0)]
    #print "Path amounts:",len(paths)
    # set_phase_test()
    if gpu_on:
         net.set_mode_gpu()
     else:
         net.set_mode_cpu()
    #print paths
    if len(paths)==0:
        return

    predictions = net.predict(map(load_image, paths))

    # ret = []
    for path, prediction in zip(paths, predictions):
        prob = 0
        for thoughts in map(lambda i:(word_data[i[0]], i[1]), enumerate(prediction)):
            words, chance = thoughts
            for needle in needles:
                if needle in words:
                    prob += chance
        print path, prob
    # return ret

def test():
    return word_probs("../caffe/examples/images","cat")
