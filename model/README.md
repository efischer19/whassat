# An object detection model in 4.6MB of javascript?

Surely I jest. But no, it works! Here's how I found and polished the model I'm using, everything was freely available when I wrote this.

Firstly, I was browsing the [coco-ssd code](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd), and noticed that they have some notes there on how the models were made. When I followed that link to the [tensorflow object detection model zoo](https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/detection_model_zoo.md), I noticed the [`ssdlite_mobilenet_v2_coco`](http://download.tensorflow.org/models/object_detection/ssdlite_mobilenet_v2_coco_2018_05_09.tar.gz) file. "`ssdlite`" seemed promising, and the tarball wasn't crazy huge, and it even had a saved model directory! Now I was really cooking.

I then had to mess around with the `tensorflowjs_converter` script for a while to find the version I wanted with the options I wanted. I then modified [this line](https://github.com/tensorflow/tfjs/blob/d15065a9fcf6212c7541f1dd364ab433e69e5b97/tfjs-converter/python/tensorflowjs/write_weights.py#L32) in order to avoid sharding a 4-and-change MB file because the limit was 4 exactly and it seemed silly to have 2 files at that point.

Finally, I landed on these commands, which are hopefully somewhat reproducible:

```
tar -xzvf ssdlite_mobilenet_v2_coco_2018_05_09.tar.gz
cd ssdlite_mobilenet_v2_coco_2018_05_09/
virtualenv venv
source venv/bin/activate
pip install tensorflowjs==0.8.6
grep -rni shard_size_bytes .
vim venv/lib/python2.7/site-packages/tensorflowjs/write_weights.py
tensorflowjs_converter --input_format=tf_saved_model --output_node_names='Postprocessor/ExpandDims_1,Postprocessor/Slice' --output_format tensorflowjs --quantization_bytes=1 --output_json=true --saved_model_tags=serve saved_model/ new_model;
ls new_model/
  group1-shard1of1  model.json
du -sh new_model/
  4.6M	new_model/
```

Now after some trial and error I know I can load this model in js via:
```
model = await cocoSsd.load({modelUrl: "/model/model.json"});
```

And it works! Crazy stuff.
